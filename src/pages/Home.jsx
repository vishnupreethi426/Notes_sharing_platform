import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function Home() {
  const [publicNotes, setPublicNotes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sharedWithMe, setSharedWithMe] = useState([])

  useEffect(() => {
    const user = localStorage.getItem('user')
    setIsLoggedIn(!!user)

    api
      .get('/notes/public')
      .then(({ data }) => setPublicNotes(data))
      .catch(() => setPublicNotes([]))

    if (user) {
      api
        .get('/notes/shared-with-me')
        .then(({ data }) => setSharedWithMe(data))
        .catch(() => setSharedWithMe([]))
    } else {
      setSharedWithMe([])
    }
  }, [])

  const filteredPublicNotes = publicNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Share and Discover Notes</h1>
        <p>Join our community of learners and share your knowledge</p>
        {!isLoggedIn && (
          <div className="hero-buttons">
            <Link to="/register" className="hero-btn primary">Get Started</Link>
            <Link to="/login" className="hero-btn secondary">Login</Link>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search public notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="home-search"
        />
      </div>

      {/* Notes Shared With Me (if logged in) */}
      {isLoggedIn && sharedWithMe.length > 0 && (
        <div className="notes-section">
          <h2>🔗 Shared With You</h2>
          <div className="notes-grid">
            {sharedWithMe.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <h3>{note.title}</h3>
                  <span className="shared-badge">Shared with you</span>
                </div>
                <p>{(note.content || '').substring(0, 100)}...</p>
                <div className="note-footer">
                  <span>By: {note.author}</span>
                  <Link to={`/note/${note.id}`} className="view-btn">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Public Notes */}
      <div className="notes-section">
        <h2>📝 Public Notes</h2>
        {filteredPublicNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredPublicNotes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-card-header">
                  <h3>{note.title}</h3>
                  <span className="note-category">{note.category}</span>
                </div>
                <p>{(note.content || '').substring(0, 100)}...</p>
                <div className="note-footer">
                  <span>By: {note.author}</span>
                  <Link to={`/note/${note.id}`} className="view-btn">View</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-notes">
            <p>No public notes available. Be the first to share a note!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home