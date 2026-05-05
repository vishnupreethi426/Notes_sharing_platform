import { Router } from 'express'
import Room from '../models/Room.js'
import User from '../models/User.js'
import Note from '../models/Note.js'
import File from '../models/File.js'

function randomJoinCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase().padEnd(6, 'X')
}

export function createRoomsRouter(db) {
  const router = Router()

  async function serializeNoteSummary(noteId, sharedAt, sharedBy) {
    const note = await Note.findById(noteId)
    if (!note) return null
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      category: note.category,
      sharedAt,
      sharedBy,
    }
  }

  async function serializeFileSummary(fileId, sharedAt, sharedBy) {
    const file = await File.findById(fileId)
    if (!file) return null
    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      data: file.data,
      uploadDate: file.upload_date,
      sharedAt,
      sharedBy,
    }
  }

  async function buildRoomResponse(room) {
    const sharedNotes = await Promise.all(
      (room.shared_notes || []).map(n => serializeNoteSummary(n.note_id, n.shared_at, n.shared_by))
    )
    const sharedFiles = await Promise.all(
      (room.shared_files || []).map(f => serializeFileSummary(f.file_id, f.shared_at, f.shared_by))
    )

    return {
      id: room.id,
      name: room.name,
      description: room.description,
      subject: room.subject,
      teacherId: room.teacher_id,
      teacherName: room.teacher_name,
      students: (room.members || []).map(m => ({
        id: m.user_id,
        username: m.username,
        email: m.email
      })),
      sharedNotes: sharedNotes.filter(Boolean),
      sharedFiles: sharedFiles.filter(Boolean),
      announcements: [],
      createdAt: room.created_at,
      joinCode: room.join_code,
    }
  }

  router.get('/', async (req, res) => {
    try {
      const uid = req.userId
      const rooms = await Room.find({
        $or: [
          { teacher_id: uid },
          { 'members.user_id': uid }
        ]
      }).sort({ created_at: -1 })
      
      const out = await Promise.all(rooms.map(r => buildRoomResponse(r)))
      res.json(out)
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch rooms' })
    }
  })

  router.post('/', async (req, res) => {
    const body = req.body || {}
    const name = body.name?.trim()
    const description = (body.description || '').trim()
    const subject = (body.subject || '').trim()
    const studentsPayload = Array.isArray(body.students) ? body.students : []

    if (!name) return res.status(400).json({ error: 'Room name is required' })

    try {
      let joinCode = randomJoinCode()
      for (let i = 0; i < 5; i++) {
        const exists = await Room.findOne({ join_code: joinCode })
        if (!exists) break
        joinCode = randomJoinCode()
      }

      const user = await User.findById(req.userId)
      
      const members = []
      for (const s of studentsPayload) {
        if (!s.id) continue
        const urow = await User.findById(s.id)
        if (!urow) continue
        members.push({
          user_id: urow._id,
          username: urow.username,
          email: urow.email
        })
      }

      const room = await Room.create({
        name,
        description,
        subject,
        teacher_id: req.userId,
        teacher_name: user?.username || 'Teacher',
        join_code: joinCode,
        members
      })

      res.status(201).json(await buildRoomResponse(room))
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Could not create room' })
    }
  })

  router.post('/join', async (req, res) => {
    const code = String(req.body?.joinCode || req.body?.code || '')
      .trim()
      .toUpperCase()
    if (!code) return res.status(400).json({ error: 'joinCode is required' })

    try {
      const room = await Room.findOne({ join_code: code })
      if (!room) return res.status(404).json({ error: 'Invalid join code' })

      const existing = room.members.some(m => m.user_id.toString() === req.userId)
      if (existing) return res.status(409).json({ error: 'Already joined' })

      const user = await User.findById(req.userId)
      room.members.push({
        user_id: user._id,
        username: user.username,
        email: user.email,
        joined_at: new Date()
      })
      
      await room.save()
      res.json(await buildRoomResponse(room))
    } catch (e) {
      res.status(400).json({ error: 'Error joining room' })
    }
  })

  router.post('/:roomId/share-note', async (req, res) => {
    try {
      const { roomId } = req.params
      const { noteId } = req.body
      
      const room = await Room.findById(roomId)
      if (!room || room.teacher_id.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' })

      const note = await Note.findOne({ _id: noteId, author_id: req.userId })
      if (!note) return res.status(404).json({ error: 'Note not found' })

      const dup = room.shared_notes.some(sn => sn.note_id.toString() === noteId)
      if (!dup) {
        const user = await User.findById(req.userId)
        room.shared_notes.push({
          note_id: noteId,
          shared_by: user.username,
          shared_at: new Date()
        })
        await room.save()
      }
      
      res.json(await buildRoomResponse(room))
    } catch (e) {
      res.status(400).json({ error: 'Error sharing note' })
    }
  })

  router.post('/:roomId/share-file', async (req, res) => {
    try {
      const { roomId } = req.params
      const { fileId } = req.body
      
      const room = await Room.findById(roomId)
      if (!room || room.teacher_id.toString() !== req.userId) return res.status(403).json({ error: 'Forbidden' })

      const file = await File.findOne({ _id: fileId, user_id: req.userId, deleted_at: null })
      if (!file) return res.status(404).json({ error: 'File not found' })

      const dup = room.shared_files.some(sf => sf.file_id.toString() === fileId)
      if (!dup) {
        const user = await User.findById(req.userId)
        room.shared_files.push({
          file_id: fileId,
          shared_by: user.username,
          shared_at: new Date()
        })
        await room.save()
      }
      
      res.json(await buildRoomResponse(room))
    } catch (e) {
      res.status(400).json({ error: 'Error sharing file' })
    }
  })

  return router
}
