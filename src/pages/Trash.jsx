import React, { useState, useEffect } from 'react'
import api from '../api/client'

function Trash() {
  const [trashedItems, setTrashedItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrashedItems()
  }, [])

  const loadTrashedItems = async () => {
    try {
      const { data } = await api.get('/files/trash')
      setTrashedItems(data)
    } catch (error) {
      console.error('Error loading trash:', error)
      setTrashedItems([])
    } finally {
      setLoading(false)
    }
  }

  const restoreItem = async (itemId) => {
    try {
      await api.patch(`/files/${itemId}/restore`)
      await loadTrashedItems()
      alert('Item restored successfully!')
    } catch (error) {
      console.error('Error restoring item:', error)
      alert(error.response?.data?.error || 'Error restoring item')
    }
  }

  const permanentDelete = async (itemId) => {
    if (!window.confirm('⚠️ Permanently delete this item? This action cannot be undone.')) return
    try {
      await api.delete(`/files/${itemId}`)
      await loadTrashedItems()
      alert('Item permanently deleted')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert(error.response?.data?.error || 'Could not delete')
    }
  }

  const emptyTrash = async () => {
    if (!window.confirm('⚠️ Empty trash? All items will be permanently deleted. This cannot be undone!')) return
    try {
      await Promise.all(trashedItems.map((item) => api.delete(`/files/${item.id}`)))
      await loadTrashedItems()
      alert('Trash emptied successfully')
    } catch (error) {
      console.error('Error emptying trash:', error)
      alert('Could not empty trash')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading trash...</div>
  }

  const totalSize = trashedItems.reduce((sum, item) => sum + (item.size || 0), 0)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🗑️ Trash</h1>
          <p>Items you deleted (items are automatically deleted after 30 days)</p>
        </div>
        {trashedItems.length > 0 && (
          <button 
            onClick={emptyTrash}
            style={{
              padding: '10px 20px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Empty Trash
          </button>
        )}
      </div>

      {trashedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#f9f9f9', borderRadius: '20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🗑️</div>
          <h3 style={{ marginBottom: '10px' }}>Trash is empty</h3>
          <p style={{ color: '#666' }}>When you delete files, they will appear here. You can restore them within 30 days.</p>
          <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '10px' }}>
            <strong>💡 Tip:</strong> Deleted files stay in trash for 30 days before automatic deletion
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '10px' }}>
            <strong>📊 Trash Summary:</strong> {trashedItems.length} items • {formatFileSize(totalSize)} • Items will be deleted after 30 days
          </div>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            {trashedItems.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                  <span style={{ fontSize: '2rem' }}>
                    {item.type?.startsWith('image/') ? '🖼️' : 
                     item.type?.startsWith('video/') ? '🎥' : 
                     item.type === 'application/pdf' ? '📄' : '📎'}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', marginBottom: '5px' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {formatFileSize(item.size)} • Deleted: {new Date(item.deletedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => restoreItem(item.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    ↺ Restore
                  </button>
                  <button 
                    onClick={() => permanentDelete(item.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete Forever
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Trash