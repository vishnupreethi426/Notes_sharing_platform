import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate()
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    applyTheme(savedTheme)
  }, [])

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', theme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span>📝</span> NoteShare Pro
        </Link>
        <ul className="nav-menu">
          <li><Link to="/"> Home</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/dashboard"> My Notes</Link></li>
              <li><Link to="/files">Files</Link></li>
              <li><Link to="/rooms"> Rooms</Link></li>
              <li><Link to="/shared"> Shared</Link></li>
              <li><Link to="/trash">Trash</Link></li>
              <li><Link to="/settings">Settings</Link></li>

              <li>
                <button onClick={toggleTheme} className="theme-toggle">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
              <li><button onClick={handleLogout} className="logout-btn">🚪 Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login"> Login</Link></li>
              <li><Link to="/register"> Register</Link></li>
              <li>
                <button onClick={toggleTheme} className="theme-toggle">
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar