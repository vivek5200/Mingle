import { useMediaDevices } from '../../hooks/useMediaDevices'

/**
 * Mic/Camera/Disconnect control buttons for voice channels.
 */
export default function VoiceControls() {
  const { isMicOn, isCameraOn, toggleMic, toggleCamera, stopMedia } = useMediaDevices()

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      {/* Mic toggle */}
      <button
        id="voice-toggle-mic"
        onClick={toggleMic}
        title={isMicOn ? 'Mute' : 'Unmute'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                    ${isMicOn
                      ? 'bg-bg-modifier-hover text-text-secondary hover:bg-bg-modifier-active'
                      : 'bg-red/20 text-red hover:bg-red/30'
                    }`}
      >
        {isMicOn ? (
          /* Mic on icon */
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
        ) : (
          /* Mic off icon (with slash) */
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Camera toggle */}
      <button
        id="voice-toggle-camera"
        onClick={toggleCamera}
        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors
                    ${isCameraOn
                      ? 'bg-bg-modifier-hover text-text-secondary hover:bg-bg-modifier-active'
                      : 'bg-red/20 text-red hover:bg-red/30'
                    }`}
      >
        {isCameraOn ? (
          /* Camera on icon */
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        ) : (
          /* Camera off icon (with slash) */
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {/* Disconnect */}
      <button
        id="voice-disconnect"
        onClick={stopMedia}
        title="Disconnect"
        className="w-9 h-9 rounded-full bg-red flex items-center justify-center text-white
                   hover:bg-red-hover transition-colors"
      >
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m-2.828 9.9a9 9 0 010-12.728" />
          <line x1="4" y1="4" x2="20" y2="20" strokeLinecap="round" strokeWidth="2.5" />
        </svg>
      </button>
    </div>
  )
}
