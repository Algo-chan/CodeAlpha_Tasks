import fs from 'fs'
import path from 'path'
import config from '../config/env.js'

export const storageService = {
  /**
   * Ensure upload destination directory exists
   */
  ensureUploadDir() {
    if (!fs.existsSync(config.UPLOADS_DIR)) {
      fs.mkdirSync(config.UPLOADS_DIR, { recursive: true })
    }
  },

  /**
   * Save buffer to local disk
   */
  async saveFile(storedName, buffer) {
    this.ensureUploadDir()
    const filePath = path.join(config.UPLOADS_DIR, storedName)
    await fs.promises.writeFile(filePath, buffer)
    return filePath
  },

  /**
   * Read file buffer from local disk
   */
  async getFileStream(storedName) {
    const filePath = path.join(config.UPLOADS_DIR, storedName)
    if (!fs.existsSync(filePath)) {
      const error = new Error('File not found on storage disk')
      error.status = 404
      throw error
    }
    return fs.createReadStream(filePath)
  },

  /**
   * Delete file from disk
   */
  async deleteFile(storedName) {
    const filePath = path.join(config.UPLOADS_DIR, storedName)
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath)
    }
  },
}

export default storageService
