import { useEffect } from 'react'
import { useAppStore } from '../../store'
import { useMediaDevices } from '../../hooks/useMediaDevices'
import LocalVideoPreview from './LocalVideoPreview'
import VoiceControls from './VoiceControls'

interface Props {
  channelName: string
}

/**
 * Voice panel shown above UserPanel when connected to a voice channel.
 * Composes LocalVideoPreview + VoiceControls.
 *
 * Phase 2.7: Media preview only (no SFU connection).
 * Phase 4+: The "Connect" flow will send voice tickets to the Go SFU.
 */
export default function VoicePanel({ channelName }: Props) {
  const { startMedia, stopMedia } = useMediaDevices()
  const localStream = useAppStore((s) => s.localStream)

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
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className={`w-2 h-2 rounded-full ${localStream ? 'bg-green animate-pulse' : 'bg-status-offline'}`} />
        <span className="text-xs font-semibold text-green truncate">
          {localStream ? 'Voice Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Channel name */}
      <div className="flex items-center gap-1 px-3 pb-1">
        <span className="text-text-muted text-xs">🔊</span>
        <span className="text-text-muted text-xs truncate">{channelName}</span>
      </div>

      {/* Video preview */}
      <div className="px-2">
        <LocalVideoPreview />
      </div>

      {/* Controls */}
      <VoiceControls />
    </div>
  )
}
