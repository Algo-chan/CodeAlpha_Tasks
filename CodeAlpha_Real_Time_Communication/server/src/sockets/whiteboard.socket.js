import { roomStore } from '../services/db.adapter.js'

// In-memory whiteboard states for instant syncing without DB bottlenecks
// Map<roomId, { strokes: [], shapes: [], texts: [], history: [] }>
export const roomWhiteboardStates = new Map()

// Save state to MongoDB with debouncing
const saveDebounceTimers = new Map()

const scheduleDBSave = (roomId) => {
  if (saveDebounceTimers.has(roomId)) {
    clearTimeout(saveDebounceTimers.get(roomId))
  }

  const timer = setTimeout(async () => {
    try {
      const state = roomWhiteboardStates.get(roomId)
      if (state) {
        await roomStore.updateWhiteboard(roomId, {
          strokes: state.strokes,
          shapes: state.shapes,
          texts: state.texts,
        })
      }
      saveDebounceTimers.delete(roomId)
    } catch (err) {
      console.error('[Whiteboard] DB persist error:', err)
    }
  }, 2000)

  saveDebounceTimers.set(roomId, timer)
}

export const registerWhiteboardHandlers = (io, socket) => {
  const getRoomState = async (roomId) => {
    if (!roomWhiteboardStates.has(roomId)) {
      const room = await roomStore.findByShortId(roomId)
      const state = room?.whiteboardState || { strokes: [], shapes: [], texts: [] }
      roomWhiteboardStates.set(roomId, {
        strokes: state.strokes || [],
        shapes: state.shapes || [],
        texts: state.texts || [],
        undoStack: [],
      })
    }
    return roomWhiteboardStates.get(roomId)
  }

  // Draw stroke
  socket.on('whiteboard:stroke', async (strokeData) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const state = await getRoomState(roomId)
    const stroke = {
      ...strokeData,
      authorId: socket.user.userId,
      authorName: socket.user.displayName,
      id: strokeData.id || Math.random().toString(36).substring(2, 9),
    }

    state.strokes.push(stroke)
    scheduleDBSave(roomId)

    // Broadcast to other peers
    socket.to(roomId).emit('whiteboard:stroke', stroke)
  })

  // Add geometric shape
  socket.on('whiteboard:shape', async (shapeData) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const state = await getRoomState(roomId)
    const shape = {
      ...shapeData,
      authorId: socket.user.userId,
      authorName: socket.user.displayName,
      id: shapeData.id || Math.random().toString(36).substring(2, 9),
    }

    state.shapes.push(shape)
    scheduleDBSave(roomId)

    socket.to(roomId).emit('whiteboard:shape', shape)
  })

  // Add text label
  socket.on('whiteboard:text', async (textData) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const state = await getRoomState(roomId)
    const textItem = {
      ...textData,
      authorId: socket.user.userId,
      authorName: socket.user.displayName,
      id: textData.id || Math.random().toString(36).substring(2, 9),
    }

    state.texts.push(textItem)
    scheduleDBSave(roomId)

    socket.to(roomId).emit('whiteboard:text', textItem)
  })

  // Clear board
  socket.on('whiteboard:clear', async () => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const state = await getRoomState(roomId)
    state.strokes = []
    state.shapes = []
    state.texts = []
    scheduleDBSave(roomId)

    io.to(roomId).emit('whiteboard:clear', {
      clearedBy: socket.user.displayName,
    })
  })

  // Live remote cursor broadcasting
  socket.on('whiteboard:cursor', ({ x, y }) => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    socket.to(roomId).emit('whiteboard:remote-cursor', {
      userId: socket.user.userId,
      displayName: socket.user.displayName,
      x,
      y,
    })
  })

  // Undo action
  socket.on('whiteboard:undo', async () => {
    const roomId = socket.currentRoomId
    if (!roomId) return

    const state = await getRoomState(roomId)
    // Remove last stroke or shape
    if (state.strokes.length > 0) {
      state.strokes.pop()
    } else if (state.shapes.length > 0) {
      state.shapes.pop()
    } else if (state.texts.length > 0) {
      state.texts.pop()
    }
    scheduleDBSave(roomId)

    io.to(roomId).emit('whiteboard:state', {
      strokes: state.strokes,
      shapes: state.shapes,
      texts: state.texts,
    })
  })
}
