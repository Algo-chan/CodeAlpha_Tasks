import { fileService } from '../services/file.service.js'

export const fileController = {
  async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      const { roomId, displayName } = req.body
      if (!roomId) {
        return res.status(400).json({ error: 'roomId is required' })
      }

      const userId = req.user ? req.user._id.toString() : (req.body.userId || 'guest')
      const name = req.user ? req.user.name : (displayName || 'Guest')

      const fileRecord = await fileService.processUpload({
        file: req.file,
        roomId,
        userId,
        displayName: name,
      })

      // Broadcast file upload to room via Socket.io
      const io = req.app.get('io')
      if (io) {
        io.to(roomId.toLowerCase()).emit('file:uploaded', fileRecord)
      }

      res.status(201).json({ file: fileRecord })
    } catch (err) {
      next(err)
    }
  },

  async getRoomFiles(req, res, next) {
    try {
      const { roomId } = req.params
      const files = await fileService.getRoomFiles(roomId)
      res.json({ files })
    } catch (err) {
      next(err)
    }
  },

  async signDownload(req, res, next) {
    try {
      const { fileId } = req.params
      const userId = req.user ? req.user._id.toString() : 'guest'
      const token = fileService.signDownloadToken(fileId, userId)
      res.json({ token, downloadUrl: `/api/files/download/${fileId}?token=${token}` })
    } catch (err) {
      next(err)
    }
  },

  async download(req, res, next) {
    try {
      const { fileId } = req.params
      const { token } = req.query

      if (!token) {
        return res.status(401).json({ error: 'Download token required' })
      }

      try {
        fileService.verifyDownloadToken(token)
      } catch {
        return res.status(401).json({ error: 'Download token is invalid or has expired' })
      }

      const file = await fileService.getDecryptedFile(fileId)

      res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`
      )
      res.setHeader('Content-Length', file.buffer.length)

      res.send(file.buffer)
    } catch (err) {
      next(err)
    }
  },
}
