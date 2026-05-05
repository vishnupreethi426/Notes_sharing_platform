import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export function createAuthRouter(db, jwtSecret) {
  const router = Router()

  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body || {}
    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' })
    }
    try {
      const passwordHash = bcrypt.hashSync(password, 10)
      const user = await User.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash
      })
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' })
      return res.json({ token, user })
    } catch (e) {
      if (e.code === 11000) {
        return res.status(409).json({ error: 'Email or username already registered' })
      }
      console.error(e)
      return res.status(500).json({ error: 'Registration failed' })
    }
  })

  router.post('/login', async (req, res) => {
    const { userEmail: emailRaw, password, email } = req.body || {}
    const loginEmail = (emailRaw ?? email ?? '').trim().toLowerCase()
    const pwd = password
    if (!loginEmail || !pwd) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await User.findOne({ email: loginEmail })
    if (!user || !bcrypt.compareSync(pwd, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' })
    return res.json({ token, user })
  })

  router.get('/me', async (req, res) => {
    const hdr = req.headers.authorization
    const tok = hdr?.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!tok) return res.status(401).json({ error: 'Unauthorized' })
    try {
      const payload = jwt.verify(tok, jwtSecret)
      const user = await User.findById(payload.userId)
      if (!user) return res.status(401).json({ error: 'Unauthorized' })
      return res.json({ user })
    } catch {
      return res.status(401).json({ error: 'Invalid token' })
    }
  })

  return router
}
