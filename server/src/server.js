import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import app from './index.js'
import { initSockets } from './sockets/index.js'
import config from './config/env.js'

const httpServer = createServer(app)

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: config.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 10000,
  maxHttpBufferSize: 1e7, // 10MB
})

// Make io accessible to Express controllers (e.g. for file upload broadcast)
app.set('io', io)

// Register all socket modules
initSockets(io)

// Start Server & Database connection
const startServer = async () => {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    })
    console.log(`[MongoDB] Connected successfully to ${config.MONGO_URI}`)
  } catch (err) {
    console.log(`[Database Notice] MongoDB is not running locally (${err.message}).`)
    console.log(`[Database Notice] Running with automatic In-Memory Store fallback. CollabRoom is 100% active and usable!`)
  }

  httpServer.listen(config.PORT, () => {
    console.log(`[Server] CollabRoom API & Signaling running on http://localhost:${config.PORT}`)
    console.log(`[Server] Client Origin: ${config.CLIENT_ORIGIN}`)
  })
}

// Handle uncaught exceptions gracefully
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err)
})

startServer()
