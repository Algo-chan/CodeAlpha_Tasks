import { Router } from 'express'
import { z } from 'zod'
import { roomController } from '../controllers/room.controller.js'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'

export const roomRouter = Router()

const createRoomSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Room name must be at least 2 characters'),
    password: z.string().optional(),
  }),
})

const joinRoomSchema = z.object({
  body: z.object({
    password: z.string().optional(),
    guestName: z.string().optional(),
  }),
})

roomRouter.post('/', authMiddleware, validate(createRoomSchema), roomController.create)
roomRouter.get('/', authMiddleware, roomController.getRecent)
roomRouter.get('/:shortId', roomController.getByShortId)
roomRouter.post('/:shortId/join', optionalAuthMiddleware, validate(joinRoomSchema), roomController.join)
roomRouter.delete('/:shortId', authMiddleware, roomController.delete)
