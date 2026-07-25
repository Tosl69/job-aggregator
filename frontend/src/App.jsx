import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function App() {
  const [page, setPage] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:8080/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) { setUser(data.user); setPage('dashboard') } })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-gray-500 text-lg">Chargement...</p>
    </div>
  )
  if (user) {
    if (page === 'admin' && user.role === 'admin') return <Admin user={user} setUser={setUser} setPage={setPage} />
    return <Dashboard user={user} setUser={setUser} setPage={setPage} />
  }
  if (page === 'register') return <Register setPage={setPage} setUser={setUser} />
  return <Login setPage={setPage} setUser={setUser} />
}
export default App