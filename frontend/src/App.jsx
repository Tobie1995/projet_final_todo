import './App.css'
import { useEffect, useState } from 'react'
import TacheListe from './components/TacheListe'

function App() {
  const [token, setToken] = useState('')

  useEffect(() => {
    const t = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''
    setToken(t)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    setToken('')
  }

  if (!token) {
    return (
      <div>
        <h1>Ma Liste de Tâches</h1>
        <TacheListe onSuccess={(t) => setToken(t)} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Ma Liste de Tâches</h1>
      </div>
      <TacheListe key={token} />
    </div>
  )
}

export default App
