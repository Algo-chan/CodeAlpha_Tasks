import { useState, useCallback, useRef } from 'react'
import { useRoomStore } from '../store/room.store'
import { useMediaStore } from '../store/media.store'
import { useToast } from '../components/ui'

export function useScreenShare(socket, replaceVideoTrack) {
  const [screenStream, setScreenStream] = useState(null)
  const screenTrackRef = useRef(null)
  const toast = useToast()

  const { isSharingScreen, setIsSharingScreen } = useRoomStore()
  const { localStream, isVideoEnabled } = useMediaStore()

  const stopScreenShare = useCallback(async () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop()
      screenTrackRef.current = null
    }

    setScreenStream(null)
    setIsSharingScreen(false)

    // Notify room peers
    if (socket) {
      socket.emit('screen-share-changed', { isSharingScreen: false })
    }

    // Restore original camera track if available
    const cameraTrack = localStream?.getVideoTracks()[0]
    if (cameraTrack && replaceVideoTrack) {
      cameraTrack.enabled = isVideoEnabled
      await replaceVideoTrack(cameraTrack)
    }

    toast.info('Screen sharing stopped')
  }, [socket, localStream, isVideoEnabled, replaceVideoTrack, setIsSharingScreen, toast])

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      toast.error('Screen sharing is not supported on this browser.')
      return
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        },
        audio: true, // system / tab audio where supported
      })

      const screenTrack = displayStream.getVideoTracks()[0]
      screenTrackRef.current = screenTrack

      // Handle user pressing the browser's native "Stop Sharing" button
      screenTrack.onended = () => {
        stopScreenShare()
      }

      setScreenStream(displayStream)
      setIsSharingScreen(true)

      // Replace track on all peer connections
      if (replaceVideoTrack) {
        await replaceVideoTrack(screenTrack)
      }

      // Notify room peers
      if (socket) {
        socket.emit('screen-share-changed', { isSharingScreen: true })
      }

      toast.success("You're sharing your screen")
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        console.error('getDisplayMedia error:', err)
        toast.error('Could not initiate screen share')
      }
    }
  }, [socket, replaceVideoTrack, setIsSharingScreen, stopScreenShare, toast])

  const toggleScreenShare = useCallback(() => {
    if (isSharingScreen) {
      stopScreenShare()
    } else {
      startScreenShare()
    }
  }, [isSharingScreen, startScreenShare, stopScreenShare])

  return {
    isSharingScreen,
    screenStream,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  }
}
