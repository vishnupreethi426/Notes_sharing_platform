import React, { useState, useEffect } from 'react'
import api from '../api/client'

function ShareWithPerson({ item, itemType, onClose, onShare }) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [allUsers, setAllUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sharedWith, setSharedWith] = useState(item.sharedWith || [])

  useEffect(() => {
    api
      .get('/users')
      .then(({ data }) => setAllUsers(data))
      .catch(() => setAllUsers([]))
  }, [])

  const shareWithUser = (user) => {
    // Check if already shared with this user
    if (sharedWith.find(s => s.userId === user.id)) {
      alert(`Already shared with ${user.username}`)
      return
    }

    const newSharedWith = [...sharedWith, {
      userId: user.id,
      email: user.email,
      username: user.username,
      permission: permission,
      sharedAt: new Date().toISOString()
    }]

    setSharedWith(newSharedWith)
    onShare(item.id, newSharedWith)
    setEmail('')
    alert(`✓ Shared with ${user.username}`)
  }

  const removeSharedUser = (userId) => {
    const updated = sharedWith.filter(u => u.userId !== userId)
    setSharedWith(updated)
    onShare(item.id, updated)
  }

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>Share {itemType === 'note' ? 'Note' : 'File'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-body">
          <div className="share-item-info">
            <strong>{item.title || item.name}</strong>
            <p>Share with specific people or generate a shareable link</p>
          </div>

          {/* Search Users */}
          <div className="share-search-section">
            <h3>Share with specific person</h3>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="share-search-input"
            />
            
            {searchTerm && filteredUsers.length > 0 && (
              <div className="users-list">
                {filteredUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-info">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                    </div>
                    <div className="share-actions">
                      <select 
                        value={permission} 
                        onChange={(e) => setPermission(e.target.value)}
                        className="permission-select"
                      >
                        <option value="view">Can view</option>
                        <option value="comment">Can comment</option>
                        <option value="edit">Can edit</option>
                      </select>
                      <button onClick={() => shareWithUser(user)} className="share-user-btn">
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Already Shared With */}
          {sharedWith.length > 0 && (
            <div className="shared-with-section">
              <h3>Shared with ({sharedWith.length})</h3>
              <div className="shared-users-list">
                {sharedWith.map(user => (
                  <div key={user.userId} className="shared-user">
                    <div className="shared-user-info">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                      <span className="permission-badge">{user.permission}</span>
                    </div>
                    <button onClick={() => removeSharedUser(user.userId)} className="remove-user-btn">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shareable Link Section */}
          <div className="share-link-section">
            <h3>Or generate a shareable link</h3>
            <button 
              onClick={() => {
                const link = `${window.location.origin}/shared-link/${item.id}`
                navigator.clipboard.writeText(link)
                alert(`Link copied: ${link}\n\nAnyone with this link can view this ${itemType}`)
              }}
              className="generate-link-btn"
            >
              🔗 Generate Shareable Link
            </button>
            <p className="link-hint">Anyone with the link can view this {itemType} (no login required)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareWithPerson