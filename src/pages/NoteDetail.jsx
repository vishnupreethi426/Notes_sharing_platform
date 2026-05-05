import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

function NoteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get(`/notes/${id}`)
      .then(({ data }) => {
        if (!cancelled) setNote(data)
      })
      .catch(() => {
        if (!cancelled) setNote(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div className="loading">Loading...</div>
  if (!note) return <div className="error-not-found">Note not found</div>

  return (
    <div className="note-detail-container">
      <div className="note-detail-card">
        {/* Header Section */}
        <div className="detail-header">
          <div className="detail-title-section">
            <h1>{note.title}</h1>
            <div className="detail-badges">
              <span className={`detail-category category-${note.category}`}>
                {note.category}
              </span>
              {note.isPublic ? (
                <span className="detail-badge public">🌍 Public</span>
              ) : (
                <span className="detail-badge private">🔒 Private</span>
              )}
            </div>
          </div>
          
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-icon">👤</span>
              <span>By: {note.author}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
            {note.updatedAt && (
              <div className="meta-item">
                <span className="meta-icon">✏️</span>
                <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {note.tags && note.tags.length > 0 && (
          <div className="detail-tags-section">
            <h3>🏷️ Tags</h3>
            <div className="detail-tags">
              {note.tags.map(tag => (
                <span key={tag} className="detail-tag">#{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {note.attachments && note.attachments.length > 0 && (
          <div className="detail-attachments-section">
            <h3>📎 Attachments</h3>
            <div className="detail-attachments">
              {note.attachments.map(file => (
                <div key={file.id} className="attachment-item-detail">
                  <span className="attachment-icon">
                    {file.type?.startsWith('image/') ? '🖼️' : '📄'}
                  </span>
                  <span>{file.name}</span>
                  <button onClick={() => {
                    const byteString = atob(file.data.split(',')[1])
                    const mimeString = file.data.split(',')[0].split(':')[1].split(';')[0]
                    const ab = new ArrayBuffer(byteString.length)
                    const ia = new Uint8Array(ab)
                    for (let i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i)
                    }
                    const blob = new Blob([ab], { type: mimeString })
                    const url = URL.createObjectURL(blob)
                    window.open(url)
                  }} className="view-attachment-btn">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="detail-content-section">
          <h3>📄 Content</h3>
          <div className="detail-content">
            <p>{note.content}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="detail-actions">
          <button onClick={() => navigate(-1)} className="action-btn back-btn">
            ← Back
          </button>
          {localStorage.getItem('user') && JSON.parse(localStorage.getItem('user')).id === note.authorId && (
            <Link to={`/edit-note/${note.id}`} className="action-btn edit-btn">
              ✏️ Edit Note
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoteDetail