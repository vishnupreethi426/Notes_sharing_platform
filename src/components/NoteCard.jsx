import React from 'react'
import { Link } from 'react-router-dom'

function NoteCard({ note, onDelete, onShare }) {
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3>{note.title}</h3>
        <span className={`note-category category-${note.category}`}>
          {note.category}
        </span>
      </div>
      
      {note.sharedWith && note.sharedWith.length > 0 && (
        <div className="shared-badge">
          🔗 Shared with {note.sharedWith.length} person(s)
        </div>
      )}
      
      <p className="note-content">{truncateText(note.content, 100)}</p>
      
      <div className="note-meta">
        <small>By: {note.author}</small>
        <small>{new Date(note.createdAt).toLocaleDateString()}</small>
        <small>{note.isPublic ? '🌍 Public' : '🔒 Private'}</small>
      </div>
      
      <div className="note-actions">
        <Link to={`/note/${note.id}`} className="btn-view">View</Link>
        <Link to={`/edit-note/${note.id}`} className="btn-edit">Edit</Link>
        <button onClick={() => onShare(note)} className="btn-share">Share</button>
        <button onClick={() => onDelete(note.id)} className="btn-delete">Delete</button>
      </div>
    </div>
  )
}

export default NoteCard