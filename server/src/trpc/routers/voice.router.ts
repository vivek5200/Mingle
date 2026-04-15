import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { t, protectedProcedure } from '../trpc.js';
import { pool } from '../../config/database.js';
import { sendInternalWebhook } from '../../utils/helpers.js';
import { getSocketServer } from '../../socket/index.js';
import crypto from 'crypto';

export const voiceRouter = t.router({
  getTicket: protectedProcedure
    .input(z.object({ roomId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const { roomId } = input;
      const userId = ctx.userId;

      // 1. Verify the channel exists and is a voice channel
      const channel = await pool.query(
        `SELECT c.id, c.server_id, c.type FROM channels c
         WHERE c.id = $1 AND c.type = 'voice'`,
        [roomId]
      );
      if (channel.rowCount === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Voice channel not found' });
      }

      // 2. Verify the user is a member of this server
      const member = await pool.query(
        'SELECT 1 FROM server_members WHERE user_id = $1 AND server_id = $2',
        [userId, channel.rows[0].server_id]
      );
      if (member.rowCount === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You are not a member of this server' });
      }

      // 3. PRE-EMPTIVE KICK - Prevent "Phantom Listener" exploit
      const existing = await pool.query(
        'SELECT channel_id FROM voice_states WHERE user_id = $1',
        [userId]
      );
      
      if (existing.rowCount && existing.rowCount > 0 && existing.rows[0].channel_id !== roomId) {
        const oldRoom = existing.rows[0].channel_id;
        
        // Kick from old room in Go SFU (HMAC-signed webhook)
        await sendInternalWebhook('http://localhost:8080/rtc/kick', {
          userId,
          roomId: oldRoom,
        });

        // Delete old voice state to guarantee atomicity
        await pool.query(
          'DELETE FROM voice_states WHERE user_id = $1',
          [userId]
        );

        // Notify UI that user left the old channel
        const io = getSocketServer();
        if (io) {
          io.to(`channel:${oldRoom}`).emit('voice:user-left', {
            channelId: oldRoom,
            userId,
          });
        }
      }

      // 4. Generate HMAC-signed ticket (30-second TTL)
      const exp = Math.floor(Date.now() / 1000) + 30;
      const payload = JSON.stringify({ userId, roomId, exp });
      const payloadB64 = Buffer.from(payload).toString('base64url');
      const secret = process.env.INTERNAL_SECRET;
      
      if (!secret) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'INTERNAL_SECRET is missing' });
      }

      const signature = crypto
        .createHmac('sha256', secret)
        .update(payloadB64)
        .digest('base64url');

      return {
        ticket: `${payloadB64}.${signature}`,
        expiresAt: exp,
      };
    }),
});
