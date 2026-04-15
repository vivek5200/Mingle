import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store'

/**
 * Displays the local camera feed.
 *
 * Safari / iOS requirements (Section 6.0):
 * - `playsinline` — prevents iOS from hijacking to fullscreen
 * - `autoplay` — hint to start playing immediately
 * - `muted` — required for local preview to prevent echo
 */
export default function LocalVideoPreview() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const localStream = useAppStore((s) => s.localStream)
  const isCameraOn = useAppStore((s) => s.isCameraOn)
  const mediaError = useAppStore((s) => s.mediaError)

  // Bind stream to <video> element
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    if (localStream) {
      el.srcObject = localStream
      // .play() may be blocked by autoplay policy — catch silently
      el.play().catch(() => {})
    } else {
      el.srcObject = null
    }
  }, [localStream])

  // Error state
  if (mediaError && !localStream) {
    return (
      <div className="flex items-center justify-center bg-bg-tertiary rounded-lg aspect-video">
        <div className="text-center px-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-red/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red text-xs leading-tight">{mediaError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-bg-tertiary rounded-lg overflow-hidden aspect-video">
      {/* Video element — always rendered, hidden when camera is off */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`w-full h-full object-cover ${isCameraOn && localStream ? '' : 'hidden'}`}
      />

      {/* Camera off placeholder */}
      {(!isCameraOn || !localStream) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blurple/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-blurple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        </div>
      )}

      {/* Non-fatal warning badge (e.g. "Audio only") */}
      {mediaError && localStream && (
        <div className="absolute bottom-1 left-1 right-1">
          <p className="text-[10px] text-yellow bg-bg-floating/80 rounded px-1.5 py-0.5 truncate">
            {mediaError}
          </p>
        </div>
      )}
    </div>
  )
}
