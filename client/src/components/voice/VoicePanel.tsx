import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store'
import { useMediaDevices } from '../../hooks/useMediaDevices'
import { useWebRTC } from '../../hooks/useWebRTC'
import LocalVideoPreview from './LocalVideoPreview'
import VoiceControls from './VoiceControls'

interface Props {
  channelId?: string
  channelName: string
}

const RemoteVideo = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])
  
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full aspect-video bg-black rounded-sm border border-bg-tertiary object-cover mt-2"
    />
  )
}

/**
 * Voice panel shown above UserPanel when connected to a voice channel.
 * Composes LocalVideoPreview + VoiceControls + RemoteVideo Streams.
 */
export default function VoicePanel({ channelId, channelName }: Props) {
  const { startMedia, stopMedia } = useMediaDevices()
  const localStream = useAppStore((s) => s.localStream)
  
  // Phase 4: Auto-connect to Go SFU when we have a localStream + channelId
  const { remoteStreams, error } = useWebRTC(channelId, localStream)

  // Auto-start media when panel mounts (user clicked a voice channel)
  useEffect(() => {
    startMedia()

    // Cleanup: stop media when panel unmounts
    return () => {
      stopMedia()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="border-t border-bg-tertiary bg-bg-secondary/80">
      {/* Channel indicator */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-wrap">
        <div className={`w-2 h-2 rounded-full shrink-0 ${localStream ? 'bg-green animate-pulse' : 'bg-status-offline'}`} />
        <span className="text-xs font-semibold text-green truncate flex-1">
          {localStream ? 'Voice Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Channel name */}
      <div className="flex items-center gap-1 px-3 pb-1">
        <span className="text-text-muted text-xs">🔊</span>
        <span className="text-text-muted text-xs truncate max-w-[200px]" title={channelName}>{channelName}</span>
      </div>
      
      {error && (
        <div className="px-3 pb-1 text-[10px] text-status-dnd truncate">
          Error: {error}
        </div>
      )}

      {/* Video preview Grid */}
      <div className="px-2 max-h-[300px] overflow-y-auto">
        <LocalVideoPreview />
        {remoteStreams.map((stream, idx) => (
          <RemoteVideo key={stream.id || idx} stream={stream} />
        ))}
      </div>

      {/* Controls */}
      <VoiceControls />
    </div>
  )
}
