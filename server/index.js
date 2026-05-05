import 'dotenv/config'
import path from 'path'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'

import { initDb } from './db.js'
import { requireAuth } from './middleware/auth.js'
import { createAuthRouter } from './routes/auth.js'
import { createUsersRouter } from './routes/users.js'
import { createNotesRouter } from './routes/notes.js'
import { createFilesRouter } from './routes/files.js'
import { createRoomsRouter } from './routes/rooms.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me-in-production'
const MONGODB_URI = process.env.MONGODB_URI

const app = express()

// Initialize MongoDB (Mongoose handles the connection queue)
if (MONGODB_URI) {
  initDb(MONGODB_URI)
} else {
  console.error('CRITICAL: MONGODB_URI is not defined!')
}

app.locals.jwtSecret = JWT_SECRET

app.use(
  cors({
    origin: true,
    credentials: false,
  })
)
app.use(express.json({ limit: '25mb' }))

// Health check endpoint
app.get('/api/health', (_req, res) => res.json({ ok: true, message: 'Backend is running' }))

const needsAuth = requireAuth(JWT_SECRET)

// Pass app.locals.db or just the models
const authRouter = createAuthRouter(null, JWT_SECRET)
const usersRouter = createUsersRouter(null)
const notesRouter = createNotesRouter(null, JWT_SECRET)
const filesRouter = createFilesRouter(null)
const roomsRouter = createRoomsRouter(null)

app.use('/api/auth', authRouter)
app.use('/api/users', needsAuth, usersRouter)
app.use('/api/notes', notesRouter)
app.use('/api/files', needsAuth, filesRouter)
app.use('/api/rooms', needsAuth, roomsRouter)

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Local API listening at http://localhost:${PORT}`)
  })
}

export default app
