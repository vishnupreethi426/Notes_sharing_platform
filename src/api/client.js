import axios from 'axios'

/** Local dev uses Vite proxy `/api`. In production set VITE_API_BASE_URL (e.g. https://your-api.onrender.com/api). */
const apiBase =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/?$/, '') || '/api'

const api = axios.create({
  baseURL: apiBase,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
