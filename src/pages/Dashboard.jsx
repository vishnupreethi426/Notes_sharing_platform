import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import NoteCard from '../components/NoteCard'
import ShareWithPerson from '../components/ShareWithPerson'

function Dashboard() {
  const [userNotes, setUserNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    setCurrentUser(user)
    loadUserNotes()
  }, [])

  const loadUserNotes = async () => {
    try {
      const { data } = await api.get('/notes/mine')
      setUserNotes(data)
      setFilteredNotes(data)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    try {
      await api.delete(`/notes/${noteId}`)
      loadUserNotes()
      alert('Note deleted successfully!')
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.error || 'Could not delete note')
    }
  }

  const handleShareNote = (note) => {
    setSelectedNote(note)
    setShowShareModal(true)
  }

  const handleShareItem = async (itemId, sharedWith) => {
    try {
      await api.put(`/notes/${itemId}/shares`, { sharedWith })
      alert(`Sharing updated (${sharedWith.length} collaborator(s)).`)
      loadUserNotes()
    } catch (error) {
      console.error(error)
      alert(error.response?.data?.error || 'Could not update sharing')
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    filterNotes(term, selectedCategory)
  }

  const filterByCategory = (category) => {
    setSelectedCategory(category)
    filterNotes(searchTerm, category)
  }

  const filterNotes = (term, category) => {
    let filtered = userNotes
    
    if (term) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term)
      )
    }
    
    if (category !== 'all') {
      filtered = filtered.filter(note => note.category === category)
    }
    
    setFilteredNotes(filtered)
  }

  if (loading) {
    return <div className="loading">Loading your notes...</div>
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Notes Dashboard</h1>
          <p>Welcome back, {currentUser?.username}! You have {userNotes.length} notes</p>
        </div>
        <Link to="/create-note" className="create-note-btn">
          + Create New Note
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-section">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        
        <div className="categories">
          <button onClick={() => filterByCategory('all')} className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}>
            All Notes
          </button>
          <button onClick={() => filterByCategory('Work')} className={`category-btn ${selectedCategory === 'Work' ? 'active' : ''}`}>
            Work
          </button>
          <button onClick={() => filterByCategory('Personal')} className={`category-btn ${selectedCategory === 'Personal' ? 'active' : ''}`}>
            Personal
          </button>
          <button onClick={() => filterByCategory('Study')} className={`category-btn ${selectedCategory === 'Study' ? 'active' : ''}`}>
            Study
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length > 0 ? (
        <div className="notes-grid">
          {filteredNotes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onDelete={handleDeleteNote}
              onShare={handleShareNote}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No notes found. Create your first note!</p>
          <Link to="/create-note" className="create-first-btn">
            Create Note
          </Link>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && selectedNote && (
        <ShareWithPerson
          item={selectedNote}
          itemType="note"
          onClose={() => {
            setShowShareModal(false)
            setSelectedNote(null)
          }}
          onShare={handleShareItem}
        />
      )}
    </div>
  )
}

export default Dashboard