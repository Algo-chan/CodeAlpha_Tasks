import mongoose from 'mongoose'
import crypto from 'crypto'

export const isDbConnected = () => mongoose.connection.readyState === 1

// In-Memory fallback store when MongoDB is not connected
export const memoryStore = {
  users: new Map(), // email/id -> user
  rooms: new Map(), // shortId -> room
  messages: [],     // array of messages
  files: new Map(), // fileId -> file record
}

// User Helpers
export const userStore = {
  async findByEmail(email) {
    if (isDbConnected()) {
      const { User } = await import('../models/User.js')
      return User.findOne({ email: email.toLowerCase() })
    }
    const cleanEmail = email.toLowerCase()
    for (const u of memoryStore.users.values()) {
      if (u.email === cleanEmail) return u
    }
    return null
  },

  async findById(id) {
    if (isDbConnected()) {
      const { User } = await import('../models/User.js')
      return User.findById(id)
    }
    return memoryStore.users.get(id.toString()) || null
  },

  async create({ email, password, name }) {
    if (isDbConnected()) {
      const { User } = await import('../models/User.js')
      const user = new User({ email: email.toLowerCase(), password, name })
      return user
    }
    const id = new mongoose.Types.ObjectId().toString()
    const user = {
      _id: id,
      id,
      email: email.toLowerCase(),
      password,
      name,
      refreshToken: null,
      createdAt: new Date(),
      toJSON() {
        const copy = { ...this }
        delete copy.password
        delete copy.refreshToken
        return copy
      },
      async save() {
        memoryStore.users.set(this.id, this)
        return this
      },
    }
    memoryStore.users.set(id, user)
    return user
  },

  async updateRefreshToken(id, refreshToken) {
    if (isDbConnected()) {
      const { User } = await import('../models/User.js')
      return User.findByIdAndUpdate(id, { refreshToken })
    }
    const user = memoryStore.users.get(id.toString())
    if (user) {
      user.refreshToken = refreshToken
    }
  },
}

// Room Helpers
export const roomStore = {
  async findByShortId(shortId) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      return Room.findOne({ shortId: shortId.toLowerCase() })
    }
    return memoryStore.rooms.get(shortId.toLowerCase()) || null
  },

  async create({ shortId, name, password, hasPassword, createdBy, hostName }) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      return new Room({
        shortId,
        name,
        password,
        hasPassword,
        createdBy,
        hostName,
        lastActivity: new Date(),
      })
    }
    const id = new mongoose.Types.ObjectId().toString()
    const room = {
      _id: id,
      id,
      shortId: shortId.toLowerCase(),
      name,
      password,
      hasPassword,
      createdBy: createdBy || null,
      hostName,
      isLocked: false,
      whiteboardState: { strokes: [], shapes: [], texts: [] },
      lastActivity: new Date(),
      createdAt: new Date(),
      toJSON() {
        const copy = { ...this }
        delete copy.password
        return copy
      },
      async save() {
        memoryStore.rooms.set(this.shortId, this)
        return this
      },
    }
    memoryStore.rooms.set(shortId.toLowerCase(), room)
    return room
  },

  async findByUser(userId) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      const rooms = await Room.find({ createdBy: userId })
        .sort({ lastActivity: -1 })
        .limit(12)
      return rooms.map((r) => r.toJSON())
    }
    const userRooms = []
    for (const r of memoryStore.rooms.values()) {
      if (r.createdBy && r.createdBy.toString() === userId.toString()) {
        userRooms.push(r.toJSON())
      }
    }
    return userRooms.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  },

  async deleteByShortId(shortId) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      return Room.deleteOne({ shortId: shortId.toLowerCase() })
    }
    memoryStore.rooms.delete(shortId.toLowerCase())
    return { acknowledged: true }
  },

  async updateLock(shortId, isLocked) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      return Room.updateOne({ shortId: shortId.toLowerCase() }, { isLocked })
    }
    const room = memoryStore.rooms.get(shortId.toLowerCase())
    if (room) room.isLocked = isLocked
  },

  async updateWhiteboard(shortId, whiteboardState) {
    if (isDbConnected()) {
      const { Room } = await import('../models/Room.js')
      return Room.updateOne({ shortId: shortId.toLowerCase() }, { whiteboardState })
    }
    const room = memoryStore.rooms.get(shortId.toLowerCase())
    if (room) room.whiteboardState = whiteboardState
  },
}

// Message Helpers
export const messageStore = {
  async save({ roomId, userId, displayName, content, timestamp }) {
    if (isDbConnected()) {
      const { Message } = await import('../models/Message.js')
      const msg = new Message({ roomId, userId, displayName, content, timestamp })
      return msg.save()
    }
    const msg = {
      _id: new mongoose.Types.ObjectId().toString(),
      roomId: roomId.toLowerCase(),
      userId,
      displayName,
      content,
      timestamp: timestamp || new Date(),
    }
    memoryStore.messages.push(msg)
    return msg
  },

  async findRecent(roomId, limit = 50) {
    if (isDbConnected()) {
      const { Message } = await import('../models/Message.js')
      const messages = await Message.find({ roomId: roomId.toLowerCase() })
        .sort({ timestamp: -1 })
        .limit(limit)
      return messages.reverse().map((m) => ({
        id: m._id.toString(),
        userId: m.userId,
        displayName: m.displayName,
        content: m.content,
        timestamp: m.timestamp,
      }))
    }
    const filtered = memoryStore.messages
      .filter((m) => m.roomId === roomId.toLowerCase())
      .slice(-limit)

    return filtered.map((m) => ({
      id: m._id.toString(),
      userId: m.userId,
      displayName: m.displayName,
      content: m.content,
      timestamp: m.timestamp,
    }))
  },
}

// File Record Helpers
export const fileRecordStore = {
  async save(record) {
    if (isDbConnected()) {
      const { FileRecord } = await import('../models/FileRecord.js')
      const doc = new FileRecord(record)
      return doc.save()
    }
    const id = new mongoose.Types.ObjectId().toString()
    const doc = {
      _id: id,
      ...record,
      uploadedAt: record.uploadedAt || new Date(),
    }
    memoryStore.files.set(id, doc)
    return doc
  },

  async findById(id) {
    if (isDbConnected()) {
      const { FileRecord } = await import('../models/FileRecord.js')
      return FileRecord.findById(id)
    }
    return memoryStore.files.get(id.toString()) || null
  },

  async findByRoom(roomId) {
    if (isDbConnected()) {
      const { FileRecord } = await import('../models/FileRecord.js')
      const files = await FileRecord.find({ roomId: roomId.toLowerCase() })
        .sort({ uploadedAt: -1 })
        .limit(100)
      return files.map((f) => ({
        id: f._id.toString(),
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        displayName: f.displayName,
        uploadedAt: f.uploadedAt,
      }))
    }
    const files = []
    for (const f of memoryStore.files.values()) {
      if (f.roomId === roomId.toLowerCase()) {
        files.push({
          id: f._id.toString(),
          originalName: f.originalName,
          mimeType: f.mimeType,
          size: f.size,
          displayName: f.displayName,
          uploadedAt: f.uploadedAt,
        })
      }
    }
    return files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
  },
}
