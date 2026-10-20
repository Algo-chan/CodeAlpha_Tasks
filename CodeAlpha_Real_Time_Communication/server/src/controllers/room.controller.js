import { roomService } from '../services/room.service.js'

export const roomController = {
  async create(req, res, next) {
    try {
      const { name, password } = req.body
      const userId = req.user ? req.user._id : null
      const hostName = req.user ? req.user.name : 'Host'

      const room = await roomService.createRoom({
        name,
        password,
        userId,
        hostName,
      })

      res.status(201).json({ room })
    } catch (err) {
      next(err)
    }
  },

  async getRecent(req, res, next) {
    try {
      const userId = req.user._id
      const rooms = await roomService.getUserRooms(userId)
      res.json({ rooms })
    } catch (err) {
      next(err)
    }
  },

  async getByShortId(req, res, next) {
    try {
      const { shortId } = req.params
      const room = await roomService.getRoomByShortId(shortId)
      res.json({ room })
    } catch (err) {
      next(err)
    }
  },

  async join(req, res, next) {
    try {
      const { shortId } = req.params
      const { password, guestName } = req.body
      const user = req.user || null

      const result = await roomService.joinRoom({
        shortId,
        password,
        user,
        guestName,
      })

      res.json(result)
    } catch (err) {
      next(err)
    }
  },

  async delete(req, res, next) {
    try {
      const { shortId } = req.params
      const userId = req.user._id
      await roomService.deleteRoom(shortId, userId)
      res.json({ success: true, message: 'Room deleted' })
    } catch (err) {
      next(err)
    }
  },
}
