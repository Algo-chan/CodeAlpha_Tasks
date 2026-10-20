import { authService } from '../services/auth.service.js'
import { userStore } from '../services/db.adapter.js'

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = authService.verifyAccessToken(token)

    const user = await userStore.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired access token' })
  }
}

/**
 * Optional authentication: attaches user if token is valid, continues as guest if not
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = authService.verifyAccessToken(token)
      const user = await userStore.findById(decoded.userId)
      if (user) {
        req.user = user
      }
    }
  } catch {
    // Continue as guest
  }
  next()
}
