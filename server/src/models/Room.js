import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    hasPassword: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hostName: {
      type: String,
      default: 'Host',
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    whiteboardState: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ strokes: [], shapes: [], texts: [] }),
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

roomSchema.methods.toJSON = function () {
  const room = this.toObject()
  delete room.password
  return room
}

export const Room = mongoose.model('Room', roomSchema)
export default Room
