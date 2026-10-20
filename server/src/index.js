import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import { authRouter } from './routes/auth.routes.js'
import { roomRouter } from './routes/room.routes.js'
import { fileRouter } from './routes/file.routes.js'
import config from './config/env.js'

export const app = express()

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'ws:', 'wss:', 'https:'],
        mediaSrc: ["'self'", 'blob:', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        workerSrc: ["'self'", 'blob:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)

// CORS Configuration
app.use(
  cors({
    origin: config.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
)

// Body & Cookie Parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// NoSQL Injection Sanitization
app.use(mongoSanitize({ replaceWith: '_' }))

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: config.NODE_ENV,
    maxParticipants: config.MAX_PARTICIPANTS,
  })
})

// Route Mounts
app.use('/api/auth', authRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/files', fileRouter)

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.message || err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({
    error: message,
    ...(config.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  })
})

export default app
