import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import api from './api/client'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateNote from './pages/CreateNote'
import EditNote from './pages/EditNote'
import NoteDetail from './pages/NoteDetail'
import FileManager from './pages/FileManager'
import MyRooms from './pages/MyRooms'
import SharedWithMe from './pages/SharedWithMe'
import Trash from './pages/Trash'
import Settings from './pages/Settings'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api
      .get('/auth/me')
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      })
  }, [])

  return (
    <div className="app">
      <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/create-note" element={isAuthenticated ? <CreateNote /> : <Navigate to="/login" />} />
        <Route path="/edit-note/:id" element={isAuthenticated ? <EditNote /> : <Navigate to="/login" />} />
        <Route path="/note/:id" element={<NoteDetail />} />
        <Route path="/files" element={isAuthenticated ? <FileManager /> : <Navigate to="/login" />} />
        <Route path="/rooms" element={isAuthenticated ? <MyRooms /> : <Navigate to="/login" />} />
        <Route path="/shared" element={isAuthenticated ? <SharedWithMe /> : <Navigate to="/login" />} />
        <Route path="/trash" element={isAuthenticated ? <Trash /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App