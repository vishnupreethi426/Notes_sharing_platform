import React, { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import api from '../api/client'

function FileManager() {
  const [files, setFiles] = useState([])
  const [filteredFiles, setFilteredFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentUser, setCurrentUser] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    setCurrentUser(user)
    loadUserFiles()
  }, [])

  const loadUserFiles = async () => {
    try {
      const { data } = await api.get('/files')
      setFiles(data)
      setFilteredFiles(data)
    } catch (error) {
      console.error('Error loading files:', error)
      setFiles([])
      setFilteredFiles([])
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Maximum size is 10MB')
      return
    }

    setUploading(true)
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        await api.post('/files', {
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
        })
        await loadUserFiles()
        alert('File uploaded successfully!')
      } catch {
        alert('Upload failed — check that the backend is running.')
      } finally {
        setUploading(false)
        event.target.value = ''
      }
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Move this file to trash?')) return
    try {
      await api.patch(`/files/${fileId}/move-to-trash`)
      await loadUserFiles()
      alert('File moved to trash')
    } catch (error) {
      console.error('Error deleting file:', error)
      alert(error.response?.data?.error || 'Could not delete file')
    }
  }

  const handleDownloadFile = (file) => {
    try {
      const byteString = atob(file.data.split(',')[1])
      const mimeString = file.data.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([ab], { type: mimeString })
      saveAs(blob, file.name)
      alert('Download started!')
    } catch (error) {
      alert('Error downloading file')
    }
  }

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase()
    setSearchTerm(term)
    filterFiles(term, selectedType)
  }

  const filterByType = (type) => {
    setSelectedType(type)
    filterFiles(searchTerm, type)
  }

  const filterFiles = (term, type) => {
    let filtered = files
    
    if (term) {
      filtered = filtered.filter(f => f.name.toLowerCase().includes(term))
    }
    
    if (type !== 'all') {
      if (type === 'image') filtered = filtered.filter(f => f.type.startsWith('image/'))
      else if (type === 'video') filtered = filtered.filter(f => f.type.startsWith('video/'))
      else if (type === 'document') filtered = filtered.filter(f => f.type.includes('pdf') || f.type.includes('word') || f.type.includes('document'))
      else if (type === 'audio') filtered = filtered.filter(f => f.type.startsWith('audio/'))
    }
    
    setFilteredFiles(filtered)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.startsWith('video/')) return '🎥'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('excel')) return '📊'
    if (file.type.includes('powerpoint')) return '📽️'
    if (file.type.startsWith('audio/')) return ''
    return '📎'
  }

  const fileTypes = [
    { id: 'all', name: 'All Files', icon: '📁' },
    { id: 'image', name: 'Images', icon: '🖼️' },
    { id: 'video', name: 'Videos', icon: '🎥' },
    { id: 'document', name: 'Documents', icon: '📄' },
    { id: 'audio', name: 'Audio', icon: '🎵' }
  ]

  if (!currentUser) return <div className="loading">Loading...</div>

  return (
    <div className="filemanager-container">
      <div className="filemanager-header">
        <h1>📁 File Manager</h1>
        <p>Upload and manage your files</p>
      </div>

      {/* Upload Area */}
      <div className="upload-area">
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-icon">📤</div>
          <div className="upload-text">
            <strong>Click to upload</strong> or drag and drop
          </div>
          <div className="upload-hint">Supports: Images, Videos, PDF, Documents, Audio (Max 10MB)</div>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,video/*,application/pdf,application/msword,application/vnd.ms-excel,audio/*"
          />
        </label>
        {uploading && <div className="uploading-status">Uploading... Please wait</div>}
      </div>

      {/* Search and Filter */}
      <div className="filemanager-controls">
        <input
          type="text"
          placeholder="🔍 Search files..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <div className="filter-buttons">
          {fileTypes.map(type => (
            <button
              key={type.id}
              onClick={() => filterByType(type.id)}
              className={`filter-btn ${selectedType === type.id ? 'active' : ''}`}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="file-stats">
        <div className="stat-card">
          <div className="stat-number">{files.length}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{files.filter(f => f.type?.startsWith('image/')).length}</div>
          <div className="stat-label">Images</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{files.filter(f => f.type?.startsWith('video/')).length}</div>
          <div className="stat-label">Videos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{files.filter(f => f.type?.includes('pdf')).length}</div>
          <div className="stat-label">Documents</div>
        </div>
      </div>

      {/* Files Grid */}
      {filteredFiles.length === 0 ? (
        <div className="empty-files">
          <div className="empty-icon">📂</div>
          <h3>No files found</h3>
          <p>{searchTerm ? 'Try a different search term' : 'Upload your first file using the button above'}</p>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map(file => (
            <div key={file.id} className="file-card">
              <div className="file-preview">
                {file.type.startsWith('image/') ? (
                  <img src={file.data} alt={file.name} className="file-image" />
                ) : (
                  <div className="file-icon-large">{getFileIcon(file)}</div>
                )}
              </div>
              <div className="file-details">
                <h4 title={file.name}>{file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}</h4>
                <div className="file-meta">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                </div>
                <div className="file-actions">
                  <button onClick={() => handleDownloadFile(file)} className="file-btn download-btn">
                    ⬇️ Download
                  </button>
                  <button onClick={() => handleDeleteFile(file.id)} className="file-btn delete-btn">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileManager