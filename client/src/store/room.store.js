import { create } from 'zustand'

export const useRoomStore = create((set, get) => ({
  room: null,
  self: null,
  peers: {}, // { [socketId]: { socketId, userId, displayName, stream, isAudioEnabled, isVideoEnabled, isSharingScreen, isHandRaised, isHost, connectionQuality } }
  activeSpeakerId: null,
  pinnedPeerId: null,
  isSharingScreen: false,
  isWhiteboardOpen: false,
  activeSideTab: null, // null | 'chat' | 'files' | 'people'
  unreadMessagesCount: 0,
  messages: [],
  typingUsers: [],
  files: [],

  setRoom: (room) => set({ room }),
  setSelf: (self) => set({ self }),

  addPeer: (peer) => {
    set((state) => ({
      peers: {
        ...state.peers,
        [peer.socketId]: {
          ...peer,
          stream: peer.stream || null,
          connectionQuality: peer.connectionQuality || 'good',
        },
      },
    }))
  },

  updatePeer: (socketId, updates) => {
    set((state) => {
      const existing = state.peers[socketId]
      if (!existing) return state
      return {
        peers: {
          ...state.peers,
          [socketId]: { ...existing, ...updates },
        },
      }
    })
  },

  removePeer: (socketId) => {
    set((state) => {
      const nextPeers = { ...state.peers }
      delete nextPeers[socketId]
      return {
        peers: nextPeers,
        pinnedPeerId: state.pinnedPeerId === socketId ? null : state.pinnedPeerId,
        activeSpeakerId: state.activeSpeakerId === socketId ? null : state.activeSpeakerId,
      }
    })
  },

  setPeerStream: (socketId, stream) => {
    get().updatePeer(socketId, { stream })
  },

  setActiveSpeakerId: (activeSpeakerId) => set({ activeSpeakerId }),
  setPinnedPeerId: (pinnedPeerId) => set({ pinnedPeerId }),
  setIsSharingScreen: (isSharingScreen) => set({ isSharingScreen }),
  setIsWhiteboardOpen: (isWhiteboardOpen) => set({ isWhiteboardOpen }),

  setActiveSideTab: (activeSideTab) => {
    set({
      activeSideTab,
      unreadMessagesCount: activeSideTab === 'chat' ? 0 : get().unreadMessagesCount,
    })
  },

  toggleSideTab: (tab) => {
    const current = get().activeSideTab
    get().setActiveSideTab(current === tab ? null : tab)
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
      unreadMessagesCount:
        state.activeSideTab === 'chat'
          ? 0
          : state.unreadMessagesCount + 1,
    }))
  },

  setMessages: (messages) => set({ messages }),

  setTypingUser: ({ userId, displayName, isTyping }) => {
    set((state) => {
      const filtered = state.typingUsers.filter((u) => u.userId !== userId)
      if (isTyping) {
        return { typingUsers: [...filtered, { userId, displayName }] }
      }
      return { typingUsers: filtered }
    })
  },

  addFile: (file) => {
    set((state) => ({
      files: [file, ...state.files.filter((f) => f.id !== file.id)],
    }))
  },

  setFiles: (files) => set({ files }),

  resetRoom: () => {
    set({
      room: null,
      self: null,
      peers: {},
      activeSpeakerId: null,
      pinnedPeerId: null,
      isSharingScreen: false,
      isWhiteboardOpen: false,
      activeSideTab: null,
      unreadMessagesCount: 0,
      messages: [],
      typingUsers: [],
      files: [],
    })
  },
}))
