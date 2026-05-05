import React, { useState } from 'react'
import ReactPlayer from 'react-player'

function FileCard({ file, onDelete, onShare, onDownload }) {
  const [showPreview, setShowPreview] = useState(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type.startsWith('video/')) return '🎥'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('excel')) return '📊'
    if (file.type.includes('powerpoint')) return '📽️'
    if (file.type.startsWith('audio/')) return '🎵'
    return '📎'
  }

  const renderPreview = () => {
    if (file.type.startsWith('image/')) {
      return <img src={file.data} alt={file.name} className="file-preview-image" />
    }
    if (file.type.startsWith('video/')) {
      return <ReactPlayer url={file.data} controls width="100%" height="200px" />
    }
    if (file.type === 'application/pdf') {
      return <iframe src={file.data} title={file.name} className="file-preview-pdf" />
    }
    return <div className="file-preview-placeholder">{getFileIcon()}</div>
  }

  return (
    <div className="file-card">
      <div className="file-card-header">
        <span className="file-icon">{getFileIcon()}</span>
        <h4>{file.name}</h4>
        <button className="file-menu-btn" onClick={() => setShowPreview(!showPreview)}>
          ⋮
        </button>
      </div>
      
      {showPreview && (
        <div className="file-preview">
          {renderPreview()}
        </div>
      )}
      
      <div className="file-info">
        <small>Size: {formatFileSize(file.size)}</small>
        <small>Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</small>
      </div>
      
      <div className="file-actions">
        <button onClick={() => onDownload(file)} className="btn-download" title="Download">
          ⬇️ Download
        </button>
        <button onClick={() => onShare(file)} className="btn-share" title="Share">
          🔗 Share
        </button>
        <button onClick={() => onDelete(file.id)} className="btn-delete-file" title="Delete">
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}

export default FileCard