import { Router } from 'express'
import File from '../models/File.js'

export function createFilesRouter(db) {
  const router = Router()

  function serializeFile(file) {
    if (!file) return null
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      data: file.data,
      uploadDate: file.upload_date,
      fileType: file.file_type_category,
      deletedAt: file.deleted_at || undefined,
    }
  }

  router.get('/trash', async (req, res) => {
    try {
      const files = await File.find({ user_id: req.userId, deleted_at: { $ne: null } }).sort({ deleted_at: -1 })
      res.json(files.map((r) => serializeFile(r)))
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch trash' })
    }
  })

  router.get('/', async (req, res) => {
    try {
      const files = await File.find({ user_id: req.userId, deleted_at: null }).sort({ upload_date: -1 })
      res.json(files.map((r) => serializeFile(r)))
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch files' })
    }
  })

  router.post('/', async (req, res) => {
    const body = req.body || {}
    const { name, type, size, data } = body
    if (!name || !type || typeof size !== 'number' || data == null) {
      return res.status(400).json({ error: 'name, type, size, and data are required' })
    }

    let fileTypeCategory = 'other'
    if (type.startsWith('image/')) fileTypeCategory = 'image'
    else if (type.startsWith('video/')) fileTypeCategory = 'video'
    else if (type.startsWith('audio/')) fileTypeCategory = 'audio'
    else if (type.includes('pdf') || type.includes('document') || type.includes('word') || type.includes('sheet')) {
      fileTypeCategory = 'document'
    }

    try {
      const file = await File.create({
        user_id: req.userId,
        name,
        type,
        size,
        file_type_category: fileTypeCategory,
        data: String(data)
      })
      res.status(201).json(serializeFile(file))
    } catch (e) {
      res.status(500).json({ error: 'Could not upload file' })
    }
  })

  router.patch('/:id/move-to-trash', async (req, res) => {
    try {
      const file = await File.findOne({ _id: req.params.id, user_id: req.userId })
      if (!file || file.deleted_at) return res.status(404).json({ error: 'Not found' })
      
      file.deleted_at = new Date()
      await file.save()
      res.json(serializeFile(file))
    } catch (e) {
      res.status(400).json({ error: 'Error moving to trash' })
    }
  })

  router.patch('/:id/restore', async (req, res) => {
    try {
      const file = await File.findOne({ _id: req.params.id, user_id: req.userId })
      if (!file) return res.status(404).json({ error: 'Not found' })
      
      file.deleted_at = null
      await file.save()
      res.json(serializeFile(file))
    } catch (e) {
      res.status(400).json({ error: 'Error restoring file' })
    }
  })

  router.delete('/:id', async (req, res) => {
    try {
      const file = await File.findOne({ _id: req.params.id, user_id: req.userId })
      if (!file) return res.status(404).json({ error: 'Not found' })
      
      // Also remove from rooms? In Mongoose, if we use a Room model with shared_files array, we should update it.
      // But for now, let's just delete the file.
      await File.findByIdAndDelete(req.params.id)
      res.status(204).end()
    } catch (e) {
      res.status(400).json({ error: 'Error deleting file' })
    }
  })

  return router
}
