import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load from root .env or local server .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })
dotenv.config()

export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/collabroom',
  JWT_SECRET: process.env.JWT_SECRET || 'collabroom_super_secure_jwt_access_secret_2026_min32chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'collabroom_super_secure_jwt_refresh_secret_2026_min32chars',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef', // 32 bytes
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || 'local',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  MAX_PARTICIPANTS: parseInt(process.env.MAX_PARTICIPANTS || '8', 10),
  STUN_URL: process.env.STUN_URL || 'stun:stun.l.google.com:19302',
  TURN_URL: process.env.TURN_URL || '',
  TURN_USERNAME: process.env.TURN_USERNAME || '',
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL || '',
  UPLOADS_DIR: path.resolve(__dirname, '../../uploads'),
}

export default config
