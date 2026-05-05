import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import FileUploader from '../components/FileUploader'

function CreateNote() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Personal',
    isPublic: true,
    tags: '',
    attachments: []
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileUpload = (fileData) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, fileData]
    }))
  }

  const removeAttachment = (fileId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(f => f.id !== fileId)
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.content.trim()) newErrors.content = 'Content is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await api.post('/notes', {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        isPublic: formData.isPublic,
        tags: formData.tags,
        attachments: formData.attachments,
      })
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create note')
    }
  }

  return (
    <div className="create-note">
      <h1>Create New Note</h1>
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            className={errors.content ? 'error' : ''}
          />
          {errors.content && <span className="error-message">{errors.content}</span>}
        </div>

        <div className="form-group">
          <label>Attachments (Images, PDF, Videos, etc.)</label>
          <FileUploader onFileUpload={handleFileUpload} />
          {formData.attachments.length > 0 && (
            <div className="attachments-list">
              <h4>Attached Files:</h4>
              {formData.attachments.map(file => (
                <div key={file.id} className="attachment-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(file.id)}>Remove</button>
                </div>
              ))}
            </div>
          )}
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
            <label>Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="react, javascript, tutorial"
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
            Create Note
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateNote