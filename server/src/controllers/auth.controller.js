import { authService } from '../services/auth.service.js'
import config from '../config/env.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
}

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body
      const result = await authService.register({ email, password, name })

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      })
    } catch (err) {
      next(err)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const result = await authService.login({ email, password })

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      })
    } catch (err) {
      next(err)
    }
  },

  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken
      const result = await authService.refresh(refreshToken)

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS)
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      })
    } catch (err) {
      next(err)
    }
  },

  async logout(req, res, next) {
    try {
      const userId = req.user ? req.user._id : null
      await authService.logout(userId)

      res.clearCookie('refreshToken', { ...COOKIE_OPTIONS, maxAge: 0 })
      res.json({ success: true, message: 'Logged out successfully' })
    } catch (err) {
      next(err)
    }
  },

  async me(req, res) {
    res.json({ user: req.user.toJSON() })
  },
}
