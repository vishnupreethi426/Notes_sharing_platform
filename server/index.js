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

const PORT = Number(process.env.PORT || 3001)
const JWT_SECRET =
  process.env.JWT_SECRET || 'development-only-change-me-in-production'
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env')
}

// Initialize MongoDB
const db = initDb(MONGODB_URI)

const app = express()

app.locals.jwtSecret = JWT_SECRET

app.use(
  cors({
    origin: true,
    credentials: false,
  })
)
app.use(express.json({ limit: '25mb' }))

const needsAuth = requireAuth(JWT_SECRET)

const authRouter = createAuthRouter(db, JWT_SECRET)
const usersRouter = createUsersRouter(db)
const notesRouter = createNotesRouter(db, JWT_SECRET)
const filesRouter = createFilesRouter(db)
const roomsRouter = createRoomsRouter(db)

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/users', needsAuth, usersRouter)
app.use('/api/notes', notesRouter)
app.use('/api/files', needsAuth, filesRouter)
app.use('/api/rooms', needsAuth, roomsRouter)

// Only start the server if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API listening at http://localhost:${PORT}`)
    console.log(`MongoDB connection initialized`)
  })
}

export default app
