import React, { useState } from 'react'

function ShareModal({ item, itemType, onClose, onShare }) {
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState('view')
  const [shareLink, setShareLink] = useState('')
  const [linkPassword, setLinkPassword] = useState('')
  const [showLink, setShowLink] = useState(false)
  const [sharedWith, setSharedWith] = useState(item.sharedWith || [])

  const generateShareLink = () => {
    const linkId = Date.now()
    const password = Math.random().toString(36).substr(2, 8)
    const link = `${window.location.origin}/shared/${itemType}/${item.id}/${linkId}`
    setShareLink(link)
    setLinkPassword(password)
    setShowLink(true)
    
    // Save link info
    const shareLinks = JSON.parse(localStorage.getItem('shareLinks') || '{}')
    shareLinks[linkId] = {
      itemId: item.id,
      itemType: itemType,
      password: password,
      createdBy: JSON.parse(localStorage.getItem('user')).email,
      createdAt: new Date().toISOString()
    }
    localStorage.setItem('shareLinks', JSON.stringify(shareLinks))
  }

  const shareWithUser = () => {
    if (!email) {
      alert('Please enter an email or username')
      return
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const userToShare = users.find(u => u.email === email || u.username === email)
    
    if (!userToShare) {
      alert('User not found!')
      return
    }

    const newSharedWith = [...sharedWith, {
      userId: userToShare.id,
      email: userToShare.email,
      username: userToShare.username,
      permission: permission,
      sharedAt: new Date().toISOString()
    }]

    setSharedWith(newSharedWith)
    onShare(item.id, newSharedWith)
    setEmail('')
    alert(`Shared with ${userToShare.username}`)
  }

  const removeSharedUser = (userId) => {
    const updated = sharedWith.filter(u => u.userId !== userId)
    setSharedWith(updated)
    onShare(item.id, updated)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareLink}\nPassword: ${linkPassword}`)
    alert('Link and password copied to clipboard!')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share {itemType === 'note' ? 'Note' : 'File'}: {item.title || item.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Share with specific people */}
          <div className="share-section">
            <h3>Share with specific people</h3>
            <div className="share-input-group">
              <input
                type="text"
                placeholder="Enter email or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="share-input"
              />
              <select value={permission} onChange={(e) => setPermission(e.target.value)}>
                <option value="view">Can view</option>
                <option value="comment">Can comment</option>
                <option value="edit">Can edit</option>
              </select>
              <button onClick={shareWithUser} className="share-btn">Share</button>
            </div>
          </div>

          {/* Shared with list */}
          {sharedWith.length > 0 && (
            <div className="shared-with-list">
              <h3>Shared with ({sharedWith.length})</h3>
              {sharedWith.map(user => (
                <div key={user.userId} className="shared-user-item">
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>({user.email})</span>
                    <span className="permission-badge">{user.permission}</span>
                  </div>
                  <button onClick={() => removeSharedUser(user.userId)} className="remove-share">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Shareable link */}
          <div className="share-section">
            <h3>Shareable link</h3>
            {!showLink ? (
              <button onClick={generateShareLink} className="generate-link-btn">
                Generate shareable link
              </button>
            ) : (
              <div className="share-link-box">
                <div className="link-info">
                  <p><strong>Link:</strong> <code>{shareLink}</code></p>
                  <p><strong>Password:</strong> <code>{linkPassword}</code></p>
                </div>
                <button onClick={copyToClipboard} className="copy-link-btn">
                  Copy Link & Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal