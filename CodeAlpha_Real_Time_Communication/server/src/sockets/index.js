import { socketAuthMiddleware } from '../middleware/socket.auth.middleware.js'
import { registerRoomHandlers } from './room.socket.js'
import { registerSignalHandlers } from './signal.socket.js'
import { registerChatHandlers } from './chat.socket.js'
import { registerWhiteboardHandlers } from './whiteboard.socket.js'
import { registerFilesHandlers } from './files.socket.js'

// Per-socket event rate limiter to prevent flooding or DoS
const createSocketRateLimiter = (limit = 120, windowMs = 60000) => {
  const socketCounts = new Map()

  return (socket, next) => {
    socket.use(([event, ...args], eventNext) => {
      // Don't rate limit audio/video webrtc signals or rapid whiteboard drawing
      if (event === 'signal:relay' || event === 'whiteboard:stroke' || event === 'whiteboard:cursor') {
        return eventNext()
      }

      const now = Date.now()
      let record = socketCounts.get(socket.id)
      if (!record || now - record.resetTime > windowMs) {
        record = { count: 1, resetTime: now }
        socketCounts.set(socket.id, record)
      } else {
        record.count++
        if (record.count > limit) {
          console.warn(`[Socket RateLimit] Socket ${socket.id} exceeded limit on ${event}`)
          return eventNext(new Error('Rate limit exceeded. Please slow down.'))
        }
      }
      eventNext()
    })

    socket.on('disconnect', () => {
      socketCounts.delete(socket.id)
    })

    next()
  }
}

export const initSockets = (io) => {
  // Authentication middleware
  io.use(socketAuthMiddleware)

  // Rate limiting middleware
  io.use(createSocketRateLimiter(150, 60000))

  io.on('connection', (socket) => {
    console.log(`[Socket] Authorized: ${socket.user?.displayName} (${socket.id})`)

    // Register modular feature handlers
    registerRoomHandlers(io, socket)
    registerSignalHandlers(io, socket)
    registerChatHandlers(io, socket)
    registerWhiteboardHandlers(io, socket)
    registerFilesHandlers(io, socket)

    socket.on('error', (err) => {
      console.error(`[Socket Error] ${socket.id}:`, err.message)
    })
  })
}

export default initSockets
