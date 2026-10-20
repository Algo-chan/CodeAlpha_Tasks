import jwt from 'jsonwebtoken'
import config from '../config/env.js'
import { userStore } from '../services/db.adapter.js'

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token

    if (!token) {
      return next(new Error('Authentication token required'))
    }

    // Verify token (can be user access token OR room join token)
    const decoded = jwt.verify(token, config.JWT_SECRET)

    // Check if it's a room joinToken
    if (decoded.roomId) {
      socket.user = {
        userId: decoded.userId,
        displayName: decoded.displayName,
        roomId: decoded.roomId,
        isHost: Boolean(decoded.isHost),
        isGuest: Boolean(decoded.isGuest),
      }
      return next()
    }

    // Otherwise standard user access token
    const user = await userStore.findById(decoded.userId)
    if (!user) {
      return next(new Error('User not found'))
    }

    socket.user = {
      userId: user._id ? user._id.toString() : user.id,
      displayName: user.name,
      email: user.email,
      isHost: false,
      isGuest: false,
    }

    next()
  } catch (err) {
    return next(new Error('Invalid authentication token'))
  }
}

export default socketAuthMiddleware
