import { useState, useEffect, useCallback, useRef } from 'react'
import { useMediaStore } from '../store/media.store'

export function useMediaDevices() {
  const [videoDevices, setVideoDevices] = useState([])
  const [audioInputDevices, setAudioInputDevices] = useState([])
  const [audioOutputDevices, setAudioOutputDevices] = useState([])
  const [permissionError, setPermissionError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    isAudioEnabled,
    isVideoEnabled,
    selectedAudioDeviceId,
    selectedVideoDeviceId,
    setSelectedAudioDeviceId,
    setSelectedVideoDeviceId,
    localStream,
    setLocalStream,
  } = useMediaStore()

  const currentStreamRef = useRef(null)

  const enumerateDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return
      const devices = await navigator.mediaDevices.enumerateDevices()

      const vDevs = devices.filter((d) => d.kind === 'videoinput')
      const aInDevs = devices.filter((d) => d.kind === 'audioinput')
      const aOutDevs = devices.filter((d) => d.kind === 'audiooutput')

      setVideoDevices(vDevs)
      setAudioInputDevices(aInDevs)
      setAudioOutputDevices(aOutDevs)

      if (!selectedVideoDeviceId && vDevs.length > 0) {
        setSelectedVideoDeviceId(vDevs[0].deviceId)
      }
      if (!selectedAudioDeviceId && aInDevs.length > 0) {
        setSelectedAudioDeviceId(aInDevs[0].deviceId)
      }
    } catch (err) {
      console.warn('Device enumeration error:', err)
    }
  }, [selectedVideoDeviceId, selectedAudioDeviceId, setSelectedVideoDeviceId, setSelectedAudioDeviceId])

  const startMedia = useCallback(async () => {
    setIsLoading(true)
    setPermissionError(null)

    // Stop existing tracks if any
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach((t) => t.stop())
    }

    try {
      const constraints = {
        video: selectedVideoDeviceId
          ? { deviceId: { exact: selectedVideoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: selectedAudioDeviceId
          ? { deviceId: { exact: selectedAudioDeviceId }, echoCancellation: true, noiseSuppression: true }
          : { echoCancellation: true, noiseSuppression: true },
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      currentStreamRef.current = stream
      setLocalStream(stream)

      // Apply current mute state
      stream.getAudioTracks().forEach((t) => (t.enabled = isAudioEnabled))
      stream.getVideoTracks().forEach((t) => (t.enabled = isVideoEnabled))

      await enumerateDevices()
    } catch (err) {
      console.warn('getUserMedia error:', err)
      setPermissionError(err.name === 'NotAllowedError' ? 'Camera/Microphone access was denied. Please allow permissions in your browser.' : err.message)
    } finally {
      setIsLoading(false)
    }
  }, [selectedVideoDeviceId, selectedAudioDeviceId, isAudioEnabled, isVideoEnabled, setLocalStream, enumerateDevices])

  useEffect(() => {
    startMedia()

    const handleDeviceChange = () => {
      enumerateDevices()
    }

    navigator.mediaDevices?.addEventListener('change', handleDeviceChange)
    return () => {
      navigator.mediaDevices?.removeEventListener('change', handleDeviceChange)
    }
  }, [selectedVideoDeviceId, selectedAudioDeviceId])

  return {
    videoDevices,
    audioInputDevices,
    audioOutputDevices,
    permissionError,
    isLoading,
    localStream,
    refreshMedia: startMedia,
  }
}
