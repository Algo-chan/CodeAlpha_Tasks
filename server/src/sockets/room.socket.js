import { roomStore } from '../services/db.adapter.js'
import config from '../config/env.js'

// In-memory active room tracker: Map<roomId, Map<socketId, ParticipantInfo>>
export const activeRooms = new Map()

export const registerRoomHandlers = (io, socket) => {
  const getRoomParticipants = (roomId) => {
    const roomMap = activeRooms.get(roomId)
    if (!roomMap) return []
    return Array.from(roomMap.values())
  }

  // Join Room
  socket.on('join-room', async ({ roomId, isAudioEnabled = true, isVideoEnabled = true }) => {
    try {
      const cleanRoomId = roomId.toLowerCase()
      const dbRoom = await roomStore.findByShortId(cleanRoomId)

      if (!dbRoom) {
        return socket.emit('room-error', { message: 'Room not found' })
      }

      if (dbRoom.isLocked && !socket.user.isHost) {
        return socket.emit('room-error', { message: 'Room is locked by the host' })
      }

      let roomMap = activeRooms.get(cleanRoomId)
      if (!roomMap) {
        roomMap = new Map()
        activeRooms.set(cleanRoomId, roomMap)
      }

      // Check room capacity limit
      if (roomMap.size >= config.MAX_PARTICIPANTS) {
        return socket.emit('room-error', {
          message: `Room has reached maximum capacity (${config.MAX_PARTICIPANTS} participants).`,
        })
      }

      // Check if user is room creator (Host)
      const isRoomCreator = Boolean(
        dbRoom.createdBy && socket.user.userId === dbRoom.createdBy.toString()
      )
      const isHost = socket.user.isHost || isRoomCreator || roomMap.size === 0

      const participant = {
        socketId: socket.id,
        userId: socket.user.userId,
        displayName: socket.user.displayName,
        isHost,
        isGuest: socket.user.isGuest,
        isAudioEnabled,
        isVideoEnabled,
        isSharingScreen: false,
        isHandRaised: false,
        joinedAt: new Date(),
      }

      // Join Socket.io room
      socket.join(cleanRoomId)
      socket.currentRoomId = cleanRoomId
      roomMap.set(socket.id, participant)

      // Notify existing peers
      socket.to(cleanRoomId).emit('peer-joined', {
        peer: participant,
      })

      // Send current participants list and room info to the new joiner
      const existingPeers = Array.from(roomMap.values()).filter((p) => p.socketId !== socket.id)
      socket.emit('room-joined', {
        room: dbRoom.toJSON(),
        self: participant,
        peers: existingPeers,
        whiteboardState: dbRoom.whiteboardState || { strokes: [], shapes: [], texts: [] },
      })

      console.log(`[Room] ${socket.user.displayName} (${socket.id}) joined ${cleanRoomId}. Total: ${roomMap.size}`)
    } catch (err) {
      console.error('[Room] join-room error:', err)
      socket.emit('room-error', { message: 'Failed to join room' })
    }
  })

  // Leave Room
  const handleLeave = () => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    if (roomMap) {
      const participant = roomMap.get(socket.id)
      roomMap.delete(socket.id)

      if (participant) {
        socket.to(roomId).emit('peer-left', {
          socketId: socket.id,
          displayName: participant.displayName,
        })
        console.log(`[Room] ${participant.displayName} left ${roomId}. Remaining: ${roomMap.size}`)
      }

      if (roomMap.size === 0) {
        activeRooms.delete(roomId)
      }
    }

    socket.leave(roomId)
    socket.currentRoomId = null
  }

  socket.on('leave-room', handleLeave)
  socket.on('disconnect', handleLeave)

  // Media state changes (mute/unmute, cam on/off)
  socket.on('media-state-changed', ({ isAudioEnabled, isVideoEnabled }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    if (roomMap) {
      const participant = roomMap.get(socket.id)
      if (participant) {
        participant.isAudioEnabled = isAudioEnabled
        participant.isVideoEnabled = isVideoEnabled

        socket.to(roomId).emit('peer-media-state-changed', {
          socketId: socket.id,
          isAudioEnabled,
          isVideoEnabled,
        })
      }
    }
  })

  // Screen Share Toggle
  socket.on('screen-share-changed', ({ isSharingScreen }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    if (roomMap) {
      const participant = roomMap.get(socket.id)
      if (participant) {
        participant.isSharingScreen = isSharingScreen
        socket.to(roomId).emit('peer-screen-share-changed', {
          socketId: socket.id,
          isSharingScreen,
        })
      }
    }
  })

  // Raise / Lower Hand
  socket.on('hand-raise-changed', ({ isHandRaised }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    if (roomMap) {
      const participant = roomMap.get(socket.id)
      if (participant) {
        participant.isHandRaised = isHandRaised
        io.to(roomId).emit('peer-hand-raise-changed', {
          socketId: socket.id,
          displayName: participant.displayName,
          isHandRaised,
        })
      }
    }
  })

  // Host Controls: Mute Participant
  socket.on('host-mute-peer', ({ targetSocketId }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    const hostParticipant = roomMap?.get(socket.id)
    if (!hostParticipant?.isHost) return

    io.to(targetSocketId).emit('host-action-mute')
  })

  // Host Controls: Remove Participant
  socket.on('host-remove-peer', ({ targetSocketId }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    const hostParticipant = roomMap?.get(socket.id)
    if (!hostParticipant?.isHost) return

    io.to(targetSocketId).emit('host-action-removed')
  })

  // Host Controls: Lock / Unlock Room
  socket.on('host-lock-room', async ({ isLocked }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const roomMap = activeRooms.get(roomId)
    const hostParticipant = roomMap?.get(socket.id)
    if (!hostParticipant?.isHost) return

    try {
      await roomStore.updateLock(roomId, isLocked)
      io.to(roomId).emit('room-lock-changed', { isLocked })
    } catch (err) {
      console.error('Failed to update room lock status', err)
    }
  })
}
