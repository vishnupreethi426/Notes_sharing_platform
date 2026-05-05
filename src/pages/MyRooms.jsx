import React, { useState, useEffect } from 'react'
import api from '../api/client'

function MyRooms() {
  const [rooms, setRooms] = useState([])
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [students, setStudents] = useState([])
  const [studentEmail, setStudentEmail] = useState('')
  const [availableNotes, setAvailableNotes] = useState([])
  const [availableFiles, setAvailableFiles] = useState([])

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    setCurrentUser(user)
    loadRooms()
    loadAvailableContent()
  }, [])

  const loadRooms = async () => {
    try {
      const { data } = await api.get('/rooms')
      setRooms(data)
    } catch {
      setRooms([])
    }
  }

  const loadAvailableContent = async () => {
    try {
      const [notesRes, filesRes] = await Promise.all([api.get('/notes/mine'), api.get('/files')])
      setAvailableNotes(notesRes.data)
      setAvailableFiles(filesRes.data)
    } catch {
      setAvailableNotes([])
      setAvailableFiles([])
    }
  }

  const addStudent = async () => {
    if (!studentEmail) {
      alert('Please enter student email')
      return
    }
    try {
      const { data: users } = await api.get('/users')
      const student = users.find((u) => u.email === studentEmail || u.username === studentEmail)

      if (!student) {
        alert('User not found! Please make sure the student is registered')
        return
      }

      if (students.find((s) => s.id === student.id)) {
        alert('Student already added!')
        return
      }

      setStudents([...students, { id: student.id, email: student.email, username: student.username }])
      setStudentEmail('')
      alert(`${student.username} added to class`)
    } catch {
      alert('Could not load users — is the backend running?')
    }
  }

  const removeStudent = (studentId) => {
    setStudents(students.filter(s => s.id !== studentId))
  }

  const createRoom = async () => {
    if (!roomName) {
      alert('Please enter room name')
      return
    }

    try {
      const { data } = await api.post('/rooms', {
        name: roomName,
        description,
        subject,
        students,
      })

      alert(`Room "${roomName}" created successfully!\nJoin Code: ${data.joinCode}`)
      setShowCreateRoom(false)
      setRoomName('')
      setDescription('')
      setSubject('')
      setStudents([])
      await loadRooms()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create room')
    }
  }

  const shareToRoom = async (roomId, itemId, itemType) => {
    if (itemId == null || Number.isNaN(itemId)) return
    try {
      if (itemType === 'note') {
        await api.post(`/rooms/${roomId}/share-note`, { noteId: itemId })
      } else {
        await api.post(`/rooms/${roomId}/share-file`, { fileId: itemId })
      }
      alert('Content shared to room successfully!')
      await loadRooms()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not share to room')
    }
  }

  const joinRoom = async () => {
    const code = prompt('Enter the join code:')
    if (!code) return

    try {
      const { data } = await api.post('/rooms/join', { joinCode: code })
      alert(`Joined "${data.name}" successfully!`)
      await loadRooms()
    } catch (err) {
      alert(err.response?.data?.error || 'Invalid join code')
    }
  }

  if (!currentUser) return <div className="loading">Loading...</div>

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>📚 My Classrooms</h1>
          <p>Create rooms to share notes and files with your students</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => joinRoom()}
            style={{
              padding: '12px 24px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔗 Join Room
          </button>
          <button 
            onClick={() => setShowCreateRoom(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            + Create New Room
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏫</div>
          <h3 style={{ marginBottom: '10px' }}>No classrooms yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Create your first classroom or join one using a join code</p>
          <button 
            onClick={() => setShowCreateRoom(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            Create Your First Room
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {rooms.map(room => (
            <div key={room.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ marginBottom: '5px' }}>{room.name}</h2>
                  <span style={{ padding: '4px 12px', background: '#e2e8f0', borderRadius: '20px', fontSize: '0.8rem' }}>
                    {room.subject || 'No subject'}
                  </span>
                </div>
                {room.teacherId === currentUser.id && (
                  <div style={{ padding: '4px 12px', background: '#667eea', color: 'white', borderRadius: '20px', fontSize: '0.8rem' }}>
                    👨‍🏫 Teacher
                  </div>
                )}
              </div>
              
              <p style={{ color: '#666', marginBottom: '15px' }}>{room.description || 'No description'}</p>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                <span>👥 Students: {room.students?.length || 0}</span>
                <span>📝 Notes: {room.sharedNotes?.length || 0}</span>
                <span>📁 Files: {room.sharedFiles?.length || 0}</span>
                <span>🔑 Join Code: <strong>{room.joinCode}</strong></span>
              </div>

              <button 
                onClick={() => setSelectedRoom(selectedRoom?.id === room.id ? null : room)}
                style={{
                  padding: '8px 16px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: selectedRoom?.id === room.id ? '20px' : '0'
                }}
              >
                {selectedRoom?.id === room.id ? 'Hide Details' : 'View Details'}
              </button>

              {selectedRoom?.id === room.id && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                  {/* Students List */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4>👥 Enrolled Students ({room.students?.length || 0})</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                      {room.students?.map(student => (
                        <div key={student.id} style={{ padding: '5px 12px', background: '#f0f0f0', borderRadius: '20px', fontSize: '0.9rem' }}>
                          {student.username}
                        </div>
                      ))}
                      {(!room.students || room.students.length === 0) && (
                        <p style={{ color: '#999' }}>No students enrolled yet</p>
                      )}
                    </div>
                  </div>

                  {/* Shared Notes */}
                  <div style={{ marginBottom: '20px' }}>
                    <h4>📝 Shared Notes</h4>
                    {room.sharedNotes?.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                        {room.sharedNotes.map(note => (
                          <div key={note.id} style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <strong>{note.title}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                              Shared by: {note.sharedBy} | {new Date(note.sharedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#999', marginTop: '10px' }}>No notes shared yet</p>
                    )}
                    
                    {room.teacherId === currentUser.id && availableNotes.length > 0 && (
                      <select 
                        onChange={async (e) => {
                          const raw = e.target.value
                          if (!raw) return
                          await shareToRoom(room.id, parseInt(raw, 10), 'note')
                          e.target.value = ''
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '8px',
                          borderRadius: '8px',
                          width: '100%'
                        }}
                      >
                        <option value="">+ Share a note to this room</option>
                        {availableNotes.map(note => (
                          <option key={note.id} value={note.id}>{note.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Shared Files */}
                  <div>
                    <h4>📁 Shared Files</h4>
                    {room.sharedFiles?.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                        {room.sharedFiles.map(file => (
                          <div key={file.id} style={{ padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <strong>{file.name}</strong>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                              Shared by: {file.sharedBy} | {new Date(file.sharedAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#999', marginTop: '10px' }}>No files shared yet</p>
                    )}
                    
                    {room.teacherId === currentUser.id && availableFiles.length > 0 && (
                      <select 
                        onChange={async (e) => {
                          const raw = e.target.value
                          if (!raw) return
                          await shareToRoom(room.id, parseInt(raw, 10), 'file')
                          e.target.value = ''
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '8px',
                          borderRadius: '8px',
                          width: '100%'
                        }}
                      >
                        <option value="">+ Share a file to this room</option>
                        {availableFiles.map(file => (
                          <option key={file.id} value={file.id}>{file.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }} onClick={() => setShowCreateRoom(false)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '20px' }}>Create New Classroom</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Room Name *</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., React JS Class"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Web Development"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                placeholder="Describe what this room is about..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Add Students</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="Enter student email"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
                <button onClick={addStudent} style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Add
                </button>
              </div>
              {students.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Added Students:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                    {students.map(s => (
                      <div key={s.id} style={{ padding: '5px 10px', background: '#e2e8f0', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {s.username}
                        <button onClick={() => removeStudent(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f44336' }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowCreateRoom(false)} style={{ flex: 1, padding: '12px', background: '#999', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={createRoom} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyRooms