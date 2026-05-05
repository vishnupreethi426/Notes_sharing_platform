import { Router } from 'express'
import User from '../models/User.js'
import Note from '../models/Note.js'
import File from '../models/File.js'

export function createUsersRouter(db) {
  const router = Router()

  router.get('/', async (req, res) => {
    try {
      const excludeId = req.userId
      const users = await User.find({ _id: { $ne: excludeId } })
        .select('username email')
        .sort({ username: 1 })
      res.json(users)
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch users' })
    }
  })

  router.delete('/me/data', async (req, res) => {
    try {
      const uid = req.userId
      await Note.deleteMany({ author_id: uid })
      await File.deleteMany({ user_id: uid })
      res.status(204).end()
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete data' })
    }
  })

  return router
}
