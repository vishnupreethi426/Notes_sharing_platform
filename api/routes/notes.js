import { Router } from 'express'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import Note from '../models/Note.js'
import User from '../models/User.js'

async function serializeNote(note) {
  const author = await User.findById(note.author_id).select('username')
  
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    category: note.category,
    isPublic: note.is_public,
    tags: note.tags || [],
    attachments: note.attachments || [],
    author: author?.username ?? 'Anonymous',
    authorId: note.author_id,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    views: note.views,
    likes: note.likes,
    comments: note.comments || [],
    sharedWith: (note.shared_with || []).map(s => ({
      userId: s.user_id,
      permission: s.permission,
      sharedAt: s.shared_at
    }))
  }
}

export function createNotesRouter(db, jwtSecret) {
  const router = Router()
  const requireFn = requireAuth(jwtSecret)
  const optionalFn = optionalAuth(jwtSecret)

  router.get('/public', async (_req, res) => {
    try {
      const notes = await Note.find({ is_public: true }).sort({ created_at: -1 })
      const out = await Promise.all(notes.map(n => serializeNote(n)))
      res.json(out)
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch notes' })
    }
  })

  router.get('/mine', requireFn, async (req, res) => {
    try {
      const notes = await Note.find({ author_id: req.userId }).sort({ updated_at: -1 })
      const out = await Promise.all(notes.map(n => serializeNote(n)))
      res.json(out)
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch your notes' })
    }
  })

  router.get('/shared-with-me', requireFn, async (req, res) => {
    try {
      const notes = await Note.find({ 'shared_with.user_id': req.userId }).sort({ updated_at: -1 })
      const out = await Promise.all(notes.map(n => serializeNote(n)))
      res.json(out)
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch shared notes' })
    }
  })

  router.get('/:id', optionalFn, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id)
      if (!note) return res.status(404).json({ error: 'Not found' })
      
      const isAuthor = req.userId && note.author_id.toString() === req.userId
      const isPublic = note.is_public
      const isShared = note.shared_with.some(s => s.user_id.toString() === req.userId)

      if (!isAuthor && !isPublic && !isShared) {
        return res.status(403).json({ error: 'You do not have access to this note' })
      }

      note.views += 1
      await note.save()
      
      const data = await serializeNote(note)
      res.json(data)
    } catch (e) {
      res.status(400).json({ error: 'Invalid id or error fetching note' })
    }
  })

  router.post('/', requireFn, async (req, res) => {
    const body = req.body || {}
    const { category = 'Personal', isPublic = true, tags = '', attachments = [] } = body
    if (!body.title?.trim() || !body.content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' })
    }

    let tagsArr
    if (Array.isArray(tags)) tagsArr = tags
    else if (typeof tags === 'string') tagsArr = tags.split(',').map((t) => t.trim()).filter(Boolean)
    else tagsArr = []

    try {
      const note = await Note.create({
        author_id: req.userId,
        title: body.title.trim(),
        content: body.content.trim(),
        category,
        is_public: isPublic,
        tags: tagsArr,
        attachments: attachments || []
      })
      res.status(201).json(await serializeNote(note))
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Could not create note' })
    }
  })

  router.put('/:id', requireFn, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id)
      if (!note) return res.status(404).json({ error: 'Not found' })
      if (note.author_id.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' })

      const body = req.body || {}
      const tagsStr = typeof body.tags === 'string' ? body.tags : ''
      const tagsArr = tagsStr.split(',').map((t) => t.trim()).filter(Boolean)

      if (body.title?.trim()) note.title = body.title.trim()
      if (body.content?.trim()) note.content = body.content.trim()
      if (body.category) note.category = body.category
      if (body.isPublic !== undefined) note.is_public = !!body.isPublic
      if (tagsArr.length > 0) note.tags = tagsArr
      
      note.updated_at = new Date()
      await note.save()

      res.json(await serializeNote(note))
    } catch (e) {
      res.status(400).json({ error: 'Error updating note' })
    }
  })

  router.delete('/:id', requireFn, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id)
      if (!note) return res.status(404).json({ error: 'Not found' })
      if (note.author_id.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' })
      
      await Note.findByIdAndDelete(req.params.id)
      res.status(204).end()
    } catch (e) {
      res.status(400).json({ error: 'Error deleting note' })
    }
  })

  router.put('/:id/shares', requireFn, async (req, res) => {
    try {
      const note = await Note.findById(req.params.id)
      if (!note) return res.status(404).json({ error: 'Not found' })
      if (note.author_id.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' })

      const { sharedWith } = req.body || {}
      if (!Array.isArray(sharedWith)) return res.status(400).json({ error: 'sharedWith must be an array' })

      note.shared_with = sharedWith.map(s => ({
        user_id: s.userId,
        permission: s.permission || 'view',
        shared_at: s.sharedAt || new Date()
      }))
      
      note.is_public = false
      note.updated_at = new Date()
      await note.save()

      res.json(await serializeNote(note))
    } catch (e) {
      res.status(400).json({ error: 'Error updating shares' })
    }
  })

  return router
}
