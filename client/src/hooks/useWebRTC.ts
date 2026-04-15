import { useEffect, useRef, useState } from 'react'
import { trpc } from '../lib/trpc'

export function useWebRTC(channelId: string | undefined, localStream: MediaStream | null) {
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([])
  const [error, setError] = useState<string | null>(null)

  // 1. Get voice ticket when channel exists
  const ticketQuery = trpc.voice.getTicket.useQuery(
    { roomId: channelId! },
    {
      enabled: !!channelId && !!localStream,
      staleTime: 30000,
      retry: false,
    }
  )

  useEffect(() => {
    if (!channelId || !localStream || !ticketQuery.data) {
      return
    }

    const ticket = ticketQuery.data.ticket
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    })
    pcRef.current = pc

    // Add local tracks to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    // Handle incoming remote tracks
    pc.ontrack = (event) => {
      console.log('Incoming remote track:', event.track.kind)
      // Pion returns standard streams. We need to mount them directly.
      if (event.streams && event.streams[0]) {
        const stream = event.streams[0]
        setRemoteStreams((prev) => {
          if (prev.find(s => s.id === stream.id)) return prev
          return [...prev, stream]
        })
      } else {
        // Fallback if no streams array
        const newStream = new MediaStream([event.track])
        setRemoteStreams(prev => [...prev, newStream])
      }
    }

    const negotiate = async () => {
      try {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // Send offer to Go SFU (Port 8080)
        const res = await fetch('http://localhost:8080/offer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sdp: pc.localDescription?.sdp,
            ticket,
          }),
        })

        if (!res.ok) {
          throw new Error('SFU rejected offer: ' + res.statusText + ' | ' + await res.text())
        }

        const data = await res.json()
        const answer = new RTCSessionDescription({ type: 'answer', sdp: data.sdp })
        await pc.setRemoteDescription(answer)

      } catch (err: any) {
        console.error('WebRTC Negotiation failed:', err)
        setError(err.message)
      }
    }

    negotiate()

    return () => {
      pc.close()
      pcRef.current = null
      setRemoteStreams([])
    }
  }, [channelId, localStream, ticketQuery.data])

  return { remoteStreams, error }
}
