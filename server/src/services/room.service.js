import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { roomStore } from './db.adapter.js'
import config from '../config/env.js'

export const roomService = {
  /**
   * Generates a clean short readable room ID like 'abc-defg-hij'
   */
  generateShortId() {
    const chars = 'abcdefghjkmnpqrstuvwxyz' // exclude easily confused chars
    const segment = (len) => {
      let str = ''
      const bytes = crypto.randomBytes(len)
      for (let i = 0; i < len; i++) {
        str += chars[bytes[i] % chars.length]
      }
      return str
    }
    return `${segment(3)}-${segment(4)}-${segment(3)}`
  },

  /**
   * Create a new room
   */
  async createRoom({ name, password, userId, hostName }) {
    let shortId = this.generateShortId()
    let exists = await roomStore.findByShortId(shortId)
    while (exists) {
      shortId = this.generateShortId()
      exists = await roomStore.findByShortId(shortId)
    }

    let passwordHash = null
    const hasPassword = Boolean(password && password.trim().length > 0)
    if (hasPassword) {
      passwordHash = await bcrypt.hash(password.trim(), 10)
    }

    const room = await roomStore.create({
      shortId,
      name: name.trim(),
      password: passwordHash,
      hasPassword,
      createdBy: userId || null,
      hostName: hostName || 'Host',
    })

    await room.save()
    return room.toJSON()
  },

  /**
   * Retrieve room metadata by short ID
   */
  async getRoomByShortId(shortId) {
    const room = await roomStore.findByShortId(shortId)
    if (!room) {
      const error = new Error('Room not found.')
      error.status = 404
      throw error
    }
    return room.toJSON()
  },

  /**
   * Verify password and generate join token
   */
  async joinRoom({ shortId, password, user, guestName }) {
    const room = await roomStore.findByShortId(shortId)
    if (!room) {
      const error = new Error('Room not found.')
      error.status = 404
      throw error
    }

    if (room.isLocked) {
      const error = new Error('This room is currently locked by the host.')
      error.status = 403
      throw error
    }

    // Check room password if set
    if (room.hasPassword && room.password) {
      if (!password) {
        const error = new Error('Password required to join this room.')
        error.status = 401
        error.requiresPassword = true
        throw error
      }
      const isMatch = await bcrypt.compare(password, room.password)
      if (!isMatch) {
        const error = new Error('Incorrect room password.')
        error.status = 401
        throw error
      }
    }

    // Determine participant identity
    const isHost = Boolean(user && room.createdBy && user._id.toString() === room.createdBy.toString())
    const userId = user ? user._id.toString() : `guest_${crypto.randomBytes(4).toString('hex')}`
    const displayName = user ? user.name : (guestName?.trim() || 'Guest')

    // Generate room join token (valid for 2 hours)
    const joinToken = jwt.sign(
      {
        roomId: room.shortId,
        userId,
        displayName,
        isHost,
        isGuest: !user,
      },
      config.JWT_SECRET,
      { expiresIn: '2h' }
    )

    // Update room last activity
    room.lastActivity = new Date()
    await room.save()

    return {
      room: room.toJSON(),
      joinToken,
      participant: {
        userId,
        displayName,
        isHost,
        isGuest: !user,
      },
    }
  },

  /**
   * List recent rooms created by or associated with user
   */
  async getUserRooms(userId) {
    if (!userId) return []
    return roomStore.findByUser(userId)
  },

  /**
   * Delete room by ID (Host only)
   */
  async deleteRoom(shortId, userId) {
    const room = await roomStore.findByShortId(shortId)
    if (!room) {
      const error = new Error('Room not found.')
      error.status = 404
      throw error
    }
    if (room.createdBy && room.createdBy.toString() !== userId.toString()) {
      const error = new Error('Only the room host can delete this room.')
      error.status = 403
      throw error
    }
    await roomStore.deleteByShortId(shortId)
    return { success: true }
  },
}

export default roomService
