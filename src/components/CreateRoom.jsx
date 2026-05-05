import React, { useState } from 'react'

function CreateRoom({ onRoomCreated, onClose }) {
  const [roomName, setRoomName] = useState('')
  const [description, setDescription] = useState('')
  const [subject, setSubject] = useState('')
  const [students, setStudents] = useState([])
  const [studentEmail, setStudentEmail] = useState('')

  const addStudent = () => {
    if (!studentEmail) return
    const users = JSON.parse(localStorage.getItem('users') || '[]')
    const student = users.find(u => u.email === studentEmail)
    
    if (!student) {
      alert('User not found!')
      return
    }

    if (students.find(s => s.id === student.id)) {
      alert('Student already added!')
      return
    }

    setStudents([...students, { id: student.id, email: student.email, username: student.username }])
    setStudentEmail('')
  }

  const removeStudent = (studentId) => {
    setStudents(students.filter(s => s.id !== studentId))
  }

  const createRoom = () => {
    if (!roomName) {
      alert('Please enter room name')
      return
    }

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const newRoom = {
      id: Date.now(),
      name: roomName,
      description: description,
      subject: subject,
      teacherId: currentUser.id,
      teacherName: currentUser.username,
      students: students,
      createdAt: new Date().toISOString(),
      sharedNotes: [],
      sharedFiles: [],
      announcements: []
    }

    const rooms = JSON.parse(localStorage.getItem('classrooms') || '[]')
    rooms.push(newRoom)
    localStorage.setItem('classrooms', JSON.stringify(rooms))

    onRoomCreated(newRoom)
    alert('Room created successfully!')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-room-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📚 Create New Classroom</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Room Name *</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., React JS Class, Mathematics 101"
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Web Development, Physics, Literature"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              placeholder="Describe what this room is about..."
            />
          </div>

          <div className="form-group">
            <label>Add Students</label>
            <div className="add-student-group">
              <input
                type="text"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter student email or username"
              />
              <button onClick={addStudent} className="add-student-btn">+ Add</button>
            </div>
            {students.length > 0 && (
              <div className="students-list">
                <h4>Enrolled Students ({students.length})</h4>
                {students.map(student => (
                  <div key={student.id} className="student-item">
                    <span>{student.username} ({student.email})</span>
                    <button onClick={() => removeStudent(student.id)} className="remove-student">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button onClick={onClose} className="btn-cancel">Cancel</button>
            <button onClick={createRoom} className="btn-submit">Create Room</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRoom