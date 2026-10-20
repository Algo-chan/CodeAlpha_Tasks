import { create } from 'zustand'

export const useMediaStore = create((set, get) => ({
  isAudioEnabled: true,
  isVideoEnabled: true,
  selectedAudioDeviceId: '',
  selectedVideoDeviceId: '',
  selectedAudioOutputDeviceId: '',
  localStream: null,
  displayName: localStorage.getItem('collabroom_display_name') || '',

  setDisplayName: (displayName) => {
    localStorage.setItem('collabroom_display_name', displayName)
    set({ displayName })
  },

  setAudioEnabled: (isAudioEnabled) => {
    const stream = get().localStream
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioEnabled
      })
    }
    set({ isAudioEnabled })
  },

  setVideoEnabled: (isVideoEnabled) => {
    const stream = get().localStream
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoEnabled
      })
    }
    set({ isVideoEnabled })
  },

  toggleAudio: () => {
    get().setAudioEnabled(!get().isAudioEnabled)
  },

  toggleVideo: () => {
    get().setVideoEnabled(!get().isVideoEnabled)
  },

  setSelectedAudioDeviceId: (selectedAudioDeviceId) => set({ selectedAudioDeviceId }),
  setSelectedVideoDeviceId: (selectedVideoDeviceId) => set({ selectedVideoDeviceId }),
  setSelectedAudioOutputDeviceId: (selectedAudioOutputDeviceId) => set({ selectedAudioOutputDeviceId }),
  setLocalStream: (localStream) => set({ localStream }),

  stopLocalStream: () => {
    const stream = get().localStream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    set({ localStream: null })
  },
}))
