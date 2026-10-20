import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { fileRecordStore } from './db.adapter.js'
import storageService from './storage.service.js'
import config from '../config/env.js'

// Master encryption key (derived or padded to 32 bytes)
const MASTER_KEY = crypto.createHash('sha256').update(config.ENCRYPTION_KEY).digest()

export const fileService = {
  /**
   * Encrypt a buffer with AES-256-GCM
   * Returns: { encryptedBuffer, iv, authTag, fileKey }
   */
  encrypt(buffer) {
    // Generate unique 32-byte key for this file
    const fileKey = crypto.randomBytes(32)
    const iv = crypto.randomBytes(12) // 96-bit IV recommended for GCM

    const cipher = crypto.createCipheriv('aes-256-gcm', fileKey, iv)
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    const authTag = cipher.getAuthTag()

    // Encrypt fileKey using master key
    const masterCipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv)
    const encryptedKey = Buffer.concat([masterCipher.update(fileKey), masterCipher.final()])
    const masterTag = masterCipher.getAuthTag()

    // Package metadata: iv (12) + authTag (16) + masterTag (16) + encryptedKey (32) + encryptedContent
    const encryptedKeyCombined = Buffer.concat([masterTag, encryptedKey]).toString('hex')
    const finalBuffer = Buffer.concat([authTag, encrypted])

    return {
      finalBuffer,
      iv: iv.toString('hex'),
      encryptedKey: encryptedKeyCombined,
    }
  },

  /**
   * Decrypt a buffer with AES-256-GCM
   */
  decrypt(finalBuffer, ivHex, encryptedKeyCombinedHex) {
    const iv = Buffer.from(ivHex, 'hex')
    const combinedKey = Buffer.from(encryptedKeyCombinedHex, 'hex')

    const masterTag = combinedKey.subarray(0, 16)
    const encryptedKey = combinedKey.subarray(16)

    // Decrypt fileKey using master key
    const masterDecipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv)
    masterDecipher.setAuthTag(masterTag)
    const fileKey = Buffer.concat([masterDecipher.update(encryptedKey), masterDecipher.final()])

    // Decrypt content
    const authTag = finalBuffer.subarray(0, 16)
    const cipheredContent = finalBuffer.subarray(16)

    const decipher = crypto.createDecipheriv('aes-256-gcm', fileKey, iv)
    decipher.setAuthTag(authTag)
    const decrypted = Buffer.concat([decipher.update(cipheredContent), decipher.final()])

    return decrypted
  },

  /**
   * Sign a time-limited download URL token (15 minutes)
   */
  signDownloadToken(fileId, userId) {
    return jwt.sign({ fileId, userId }, config.JWT_SECRET, { expiresIn: '15m' })
  },

  /**
   * Verify download token
   */
  verifyDownloadToken(token) {
    return jwt.verify(token, config.JWT_SECRET)
  },

  /**
   * Process file upload, encrypt at rest, and record in MongoDB
   */
  async processUpload({ file, roomId, userId, displayName }) {
    const { finalBuffer, iv, encryptedKey } = this.encrypt(file.buffer)

    const storedName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}.enc`
    await storageService.saveFile(storedName, finalBuffer)

    const record = await fileRecordStore.save({
      roomId: roomId.toLowerCase(),
      userId,
      displayName,
      originalName: file.originalname,
      storedName,
      mimeType: file.mimetype,
      size: file.size,
      encryptedKey,
      iv,
      uploadedAt: new Date(),
    })

    return {
      id: record._id.toString(),
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      displayName: record.displayName,
      uploadedAt: record.uploadedAt,
    }
  },

  /**
   * Get decrypted file buffer for authorized download
   */
  async getDecryptedFile(fileId) {
    const record = await fileRecordStore.findById(fileId)
    if (!record) {
      const error = new Error('File not found')
      error.status = 404
      throw error
    }

    const stream = await storageService.getFileStream(record.storedName)
    const chunks = []
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    const encryptedBuffer = Buffer.concat(chunks)

    const decryptedBuffer = this.decrypt(encryptedBuffer, record.iv, record.encryptedKey)

    return {
      buffer: decryptedBuffer,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
    }
  },

  /**
   * List files uploaded to a specific room
   */
  async getRoomFiles(roomId) {
    return fileRecordStore.findByRoom(roomId)
  },
}

export default fileService
