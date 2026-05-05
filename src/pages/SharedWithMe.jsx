import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function SharedWithMe() {
  const [sharedNotes, setSharedNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSharedWithMe()
  }, [])

  const loadSharedWithMe = async () => {
    try {
      const { data } = await api.get('/notes/shared-with-me')
      setSharedNotes(data)
    } catch (error) {
      console.error('Error loading shared items:', error)
      setSharedNotes([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading shared items...</div>
  }

  return (
    <div className="shared-container">
      <div className="shared-header">
        <h1>🔗 Shared With Me</h1>
        <p>Notes that others have shared with you</p>
      </div>

      {sharedNotes.length === 0 ? (
        <div className="empty-shared">
          <div className="empty-icon">🔗</div>
          <h3>No shared notes yet</h3>
          <p>When someone shares a note with you, it will appear here</p>
          <div className="tip-box">
            💡 <strong>Tip:</strong> Ask your friends or teachers to share notes with you using your email
          </div>
        </div>
      ) : (
        <div className="shared-notes-grid">
          {sharedNotes.map(note => (
            <div key={note.id} className="shared-note-card">
              <div className="shared-note-header">
                <h3>{note.title}</h3>
                <span className="shared-category">{note.category}</span>
              </div>
              <p className="shared-note-content">{(note.content || '').substring(0, 150)}...</p>
              <div className="shared-note-footer">
                <div className="shared-by">
                  Shared by: <strong>{note.author}</strong>
                </div>
                <div className="shared-permission">
                  Permission: {note.sharedWith?.find(u => u.userId === JSON.parse(localStorage.getItem('user'))?.id)?.permission || 'View'}
                </div>
                <Link to={`/note/${note.id}`} className="view-shared-btn">
                  View Note →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SharedWithMe