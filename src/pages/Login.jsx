import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    userEmail: '',
    userPass: ''
  })

  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', {
        userEmail: formData.userEmail,
        password: formData.userPass,
      })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setIsAuthenticated(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to NoteShare</h2>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">

          {/* Hidden trick fields */}
          <input type="text" name="random1" autoComplete="off" style={{ display: 'none' }} />
          <input type="password" name="random2" autoComplete="off" style={{ display: 'none' }} />

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="userPass"
              value={formData.userPass}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className="btn-submit">
            Login
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}

export default Login