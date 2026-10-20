import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userStore } from './db.adapter.js'
import config from '../config/env.js'

const BCRYPT_ROUNDS = 12

export const authService = {
  /**
   * Hash a plain password with 12 bcrypt rounds
   */
  async hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS)
  },

  /**
   * Compare a plain password with a hashed password
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash)
  },

  /**
   * Generate access token (15m) and refresh token (7d)
   */
  generateTokens(user) {
    const payload = {
      userId: user._id ? user._id.toString() : user.id,
      email: user.email,
      name: user.name,
    }

    const accessToken = jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: '15m',
    })

    const refreshToken = jwt.sign(
      { userId: payload.userId },
      config.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    )

    return { accessToken, refreshToken }
  },

  /**
   * Register a new user
   */
  async register({ email, password, name }) {
    const existing = await userStore.findByEmail(email)
    if (existing) {
      const error = new Error('An account with this email address already exists.')
      error.status = 409
      throw error
    }

    const hashedPassword = await this.hashPassword(password)
    const user = await userStore.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
    })

    const { accessToken, refreshToken } = this.generateTokens(user)
    user.refreshToken = refreshToken
    await user.save()

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }
  },

  /**
   * Login user with email & password
   */
  async login({ email, password }) {
    const user = await userStore.findByEmail(email)
    if (!user) {
      const error = new Error('Invalid email or password.')
      error.status = 401
      throw error
    }

    const isValid = await this.comparePassword(password, user.password)
    if (!isValid) {
      const error = new Error('Invalid email or password.')
      error.status = 401
      throw error
    }

    const { accessToken, refreshToken } = this.generateTokens(user)
    user.refreshToken = refreshToken
    await user.save()

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }
  },

  /**
   * Rotate access & refresh tokens
   */
  async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      const error = new Error('Refresh token is required.')
      error.status = 401
      throw error
    }

    let decoded
    try {
      decoded = jwt.verify(oldRefreshToken, config.JWT_REFRESH_SECRET)
    } catch {
      const error = new Error('Invalid or expired refresh token.')
      error.status = 401
      throw error
    }

    const user = await userStore.findById(decoded.userId)
    if (!user || user.refreshToken !== oldRefreshToken) {
      const error = new Error('Refresh token has been revoked or expired.')
      error.status = 401
      throw error
    }

    // Token rotation
    const { accessToken, refreshToken } = this.generateTokens(user)
    user.refreshToken = refreshToken
    await user.save()

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }
  },

  /**
   * Invalidate user's refresh token on logout
   */
  async logout(userId) {
    if (userId) {
      await userStore.updateRefreshToken(userId, null)
    }
    return { success: true }
  },

  /**
   * Verify an access token
   */
  verifyAccessToken(token) {
    return jwt.verify(token, config.JWT_SECRET)
  },
}

export default authService
