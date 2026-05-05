import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

function FileUploader({ onFileUpload }) {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    setUploading(true)
    acceptedFiles.forEach(file => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          uploadDate: new Date().toISOString(),
          fileType: file.type.split('/')[0] // image, video, application, etc.
        }
        onFileUpload(fileData)
      }
      
      if (file.type.includes('image') || file.type.includes('pdf')) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
    setTimeout(() => setUploading(false), 1000)
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'text/plain': ['.txt'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    }
  })

  return (
    <div {...getRootProps()} className="file-uploader">
      <input {...getInputProps()} />
      {uploading ? (
        <div className="uploading">
          <div className="spinner"></div>
          <p>Uploading file...</p>
        </div>
      ) : isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <div className="upload-area">
          <span className="upload-icon">📁</span>
          <p>Drag & drop files here, or click to select</p>
          <small>Supports: Images, Videos, PDF, Documents, Audio (Max 10MB each)</small>
        </div>
      )}
    </div>
  )
}

export default FileUploader