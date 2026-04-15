// server/src/utils/helpers.ts — Shared utility functions

import { customAlphabet } from 'nanoid';

// 8-character invite codes using alphanumeric chars (no ambiguous chars)
const generateInviteCode = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  8,
);

export function createInviteCode(): string {
  return generateInviteCode();
}

/** Convert snake_case DB rows to camelCase for the API response */
export function snakeToCamel<T extends Record<string, unknown>>(
  row: T,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    );
    result[camelKey] = value;
  }
  return result;
}

/** Securely send a webhook to the Go SFU */
export async function sendInternalWebhook(url: string, payload: any): Promise<void> {
  const crypto = await import('crypto');
  
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  
  const secret = process.env.INTERNAL_SECRET;
  if (!secret) throw new Error('INTERNAL_SECRET is not configured');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  const token = `${payloadB64}.${signature}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: payloadStr
    });
    
    if (!res.ok) {
      console.error(`Webhook to ${url} failed: ${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error(`Webhook to ${url} failed:`, err);
  }
}
