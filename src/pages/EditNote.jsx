import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'

function EditNote() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal',
    isPublic: true,
    tags: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let cancelled = false
    api
      .get(`/notes/${id}`)
      .then(({ data: note }) => {
        if (cancelled || !note) return
        const tagStr = Array.isArray(note.tags) ? note.tags.join(', ') : String(note.tags || '')
        setFormData({
          title: note.title,
          content: note.content,
          category: note.category,
          isPublic: note.isPublic,
          tags: tagStr,
        })
      })
      .catch(() => {
        if (!cancelled) navigate('/dashboard')
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/notes/${id}`, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        isPublic: formData.isPublic,
        tags: formData.tags,
      })
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || 'Could not save note')
    }
  }

  return (
    <div className="create-note">
      <h1>Edit Note</h1>
      <form onSubmit={handleSubmit} className="note-form">
        {/* Same form fields as CreateNote */}
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Ideas">Ideas</option>
              <option value="Tutorial">Tutorial</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            Make this note public
          </label>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit">
            Update Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditNote