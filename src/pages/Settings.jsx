import React, { useState, useEffect } from 'react'
import api from '../api/client'

function Settings() {
  const [user, setUser] = useState(null)
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    defaultPrivacy: 'public',
    language: 'en',
    emailNotifications: true,
    compactView: false
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [storageUsed, setStorageUsed] = useState(0)

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'))
    setUser(currentUser)
    
    const savedSettings = localStorage.getItem(`settings_${currentUser?.id}`)
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setSettings(parsed)
      if (parsed.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark')
      }
    }
    
    calculateStorage()
  }, [])

  const calculateStorage = async () => {
    try {
      const [{ data: files }, { data: trash }] = await Promise.all([
        api.get('/files'),
        api.get('/files/trash'),
      ])
      const totalSize = [...files, ...trash].reduce((sum, file) => sum + (file.size || 0), 0)
      setStorageUsed((totalSize / (1024 * 1024)).toFixed(2))
    } catch {
      setStorageUsed(0)
    }
  }

  const showMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem(`settings_${user?.id}`, JSON.stringify(newSettings))
    
    if (key === 'theme' && value === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else if (key === 'theme' && value === 'light') {
      document.documentElement.removeAttribute('data-theme')
    }
    
    showMessage(`${key} updated successfully!`)
  }

  const exportData = async () => {
    try {
      const [{ data: userNotes }, { data: userFiles }] = await Promise.all([
        api.get('/notes/mine'),
        api.get('/files'),
      ])

      const payload = {
        user: { username: user?.username, email: user?.email },
        notes: userNotes.map((n) => ({ title: n.title, content: n.content, category: n.category })),
        files: userFiles.map((f) => ({ name: f.name, type: f.type, size: f.size })),
        settings,
        exportDate: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(payload, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', `noteshare_backup_${user?.username}_${Date.now()}.json`)
      linkElement.click()

      showMessage('Data exported successfully!')
    } catch {
      showMessage('Error exporting data')
    }
  }

  const clearAllData = async () => {
    if (
      !window.confirm(
        '⚠️ WARNING: This will permanently delete ALL your notes and files from the server. This action cannot be undone! Are you absolutely sure?'
      )
    ) {
      return
    }
    try {
      await api.delete('/users/me/data')
      showMessage('All your data has been cleared!')
      await calculateStorage()
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      showMessage('Error clearing data')
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  const storageLimit = 100
  const storagePercentage = (storageUsed / storageLimit) * 100

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your NoteShare experience</p>
      </div>

      <div className="settings-sections">
        {/* Account Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">👤</span>
            Account Information
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Username</label>
              <span>{user.username}</span>
            </div>
            <div className="setting-row">
              <label>Email</label>
              <span>{user.email}</span>
            </div>
            <div className="setting-row">
              <label>Member Since</label>
              <span>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">🎨</span>
            Appearance
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Theme Mode</label>
              <select 
                value={settings.theme} 
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="setting-select"
              >
                <option value="light">☀️ Light Mode</option>
                <option value="dark">🌙 Dark Mode</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Compact View</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.compactView}
                  onChange={(e) => updateSetting('compactView', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">🔔</span>
            Notifications
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Push Notifications</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.notifications}
                  onChange={(e) => updateSetting('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <label>Email Notifications</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">🔒</span>
            Privacy & Security
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Default Note Privacy</label>
              <select 
                value={settings.defaultPrivacy} 
                onChange={(e) => updateSetting('defaultPrivacy', e.target.value)}
                className="setting-select"
              >
                <option value="public">🌍 Public - Everyone can see</option>
                <option value="private">🔒 Private - Only you can see</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">⚡</span>
            Preferences
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Auto-save Notes</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.autoSave}
                  onChange={(e) => updateSetting('autoSave', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-row">
              <label>Language</label>
              <select 
                value={settings.language} 
                onChange={(e) => updateSetting('language', e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Storage Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">💾</span>
            Storage Usage
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Storage Used</label>
              <div className="storage-info">
                <div className="storage-bar-bg">
                  <div className="storage-bar-fill" style={{ width: `${Math.min(storagePercentage, 100)}%` }}>
                    {storagePercentage > 30 && `${storageUsed} MB`}
                  </div>
                </div>
                <span className="storage-text">{storageUsed} MB of {storageLimit} MB used ({storagePercentage.toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="settings-section">
          <h2>
            <span className="section-icon">📦</span>
            Data Management
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Backup Your Data</label>
              <button onClick={exportData} className="setting-btn primary-btn">
                📥 Export All Data
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-section danger-section">
          <h2>
            <span className="section-icon">⚠️</span>
            Danger Zone
          </h2>
          <div className="settings-list">
            <div className="setting-row">
              <label>Delete All Data</label>
              <button onClick={clearAllData} className="setting-btn danger-btn">
                🗑️ Delete All My Data
              </button>
            </div>
            <p className="danger-warning">This action is permanent and cannot be undone. All your notes and files will be lost.</p>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="toast-notification">
          ✅ {toastMessage}
        </div>
      )}
    </div>
  )
}

export default Settings