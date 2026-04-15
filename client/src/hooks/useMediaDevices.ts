import { useCallback } from 'react'
import { useAppStore } from '../store'

/**
 * Safari-safe getUserMedia wrapper.
 *
 * Key constraints from ARCHITECTURE.md Section 6.0:
 * 1. Call getUserMedia() ONCE per session — Safari silently mutes previous
 *    tracks if you call it again. Use track.enabled to toggle.
 * 2. Use replaceTrack() to switch devices — don't request a new stream.
 * 3. Always set playsinline + muted on local <video> elements.
 */
export function useMediaDevices() {
  const localStream = useAppStore((s) => s.localStream)
  const isMicOn = useAppStore((s) => s.isMicOn)
  const isCameraOn = useAppStore((s) => s.isCameraOn)
  const mediaError = useAppStore((s) => s.mediaError)

  /**
   * Request camera + mic access. Called once when joining a voice channel.
   */
  const startMedia = useCallback(async () => {
    // If we already have a stream, don't call getUserMedia again (Safari rule)
    if (useAppStore.getState().localStream) return

    try {
      useAppStore.getState().setMediaError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      useAppStore.getState().setLocalStream(stream)
    } catch (err) {
      const error = err as DOMException

      let message = 'Failed to access camera/microphone'
      if (error.name === 'NotAllowedError') {
        message = 'Camera/microphone permission denied. Please allow access in your browser settings.'
      } else if (error.name === 'NotFoundError') {
        message = 'No camera or microphone found on this device.'
      } else if (error.name === 'NotReadableError') {
        message = 'Camera or microphone is already in use by another application.'
      } else if (error.name === 'OverconstrainedError') {
        // Fallback: try audio only
        try {
          const audioOnly = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })
          useAppStore.getState().setLocalStream(audioOnly)
          useAppStore.getState().setCameraOn(false)
          useAppStore.getState().setMediaError('Camera not available. Audio only.')
          return
        } catch {
          message = 'No suitable media devices found.'
        }
      }

      useAppStore.getState().setMediaError(message)
    }
  }, [])

  /**
   * Toggle camera on/off by enabling/disabling the video track.
   * Does NOT call getUserMedia again (Safari-safe).
   */
  const toggleCamera = useCallback(() => {
    const stream = useAppStore.getState().localStream
    if (!stream) return

    const videoTrack = stream.getVideoTracks()[0]
    if (videoTrack) {
      const newState = !videoTrack.enabled
      videoTrack.enabled = newState
      useAppStore.getState().setCameraOn(newState)
    }
  }, [])

  /**
   * Toggle microphone on/off by enabling/disabling the audio track.
   * Does NOT call getUserMedia again (Safari-safe).
   */
  const toggleMic = useCallback(() => {
    const stream = useAppStore.getState().localStream
    if (!stream) return

    const audioTrack = stream.getAudioTracks()[0]
    if (audioTrack) {
      const newState = !audioTrack.enabled
      audioTrack.enabled = newState
      useAppStore.getState().setMicOn(newState)
    }
  }, [])

  /**
   * Stop all tracks and clear the stream from the store.
   * Turns off the camera hardware light.
   */
  const stopMedia = useCallback(() => {
    useAppStore.getState().clearLocalStream()
  }, [])

  return {
    localStream,
    isMicOn,
    isCameraOn,
    mediaError,
    startMedia,
    stopMedia,
    toggleCamera,
    toggleMic,
  }
}
