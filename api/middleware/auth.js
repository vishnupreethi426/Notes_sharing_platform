import jwt from 'jsonwebtoken'

export function optionalAuth(secret) {
  return (req, res, next) => {
    const hdr = req.headers.authorization
    const token = hdr?.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!token) {
      req.userId = null
      return next()
    }
    try {
      const payload = jwt.verify(token, secret)
      req.userId = payload.userId
    } catch {
      req.userId = null
    }
    next()
  }
}

export function requireAuth(secret) {
  return (req, res, next) => {
    const hdr = req.headers.authorization
    const token = hdr?.startsWith('Bearer ') ? hdr.slice(7) : null
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
      const payload = jwt.verify(token, secret)
      req.userId = payload.userId
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}
