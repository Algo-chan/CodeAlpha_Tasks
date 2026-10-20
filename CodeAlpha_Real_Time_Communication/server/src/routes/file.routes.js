import { Router } from 'express'
import multer from 'multer'
import { fileController } from '../controllers/file.controller.js'
import { optionalAuthMiddleware } from '../middleware/auth.middleware.js'
import config from '../config/env.js'

export const fileRouter = Router()

// Memory storage for immediate AES-256-GCM encryption
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    // MIME allowlist
    const allowed = [
      'image/',
      'video/',
      'audio/',
      'text/',
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
    ]

    const isAllowed = allowed.some((prefix) => file.mimetype.startsWith(prefix) || file.mimetype === prefix)
    if (isAllowed) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not permitted.`))
    }
  },
})

fileRouter.post('/upload', optionalAuthMiddleware, upload.single('file'), fileController.upload)
fileRouter.get('/room/:roomId', optionalAuthMiddleware, fileController.getRoomFiles)
fileRouter.get('/sign/:fileId', optionalAuthMiddleware, fileController.signDownload)
fileRouter.get('/download/:fileId', fileController.download)
