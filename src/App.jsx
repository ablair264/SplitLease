import { useEffect, useState } from 'react'
import Dashboard from './components/Dashboard'
import FileUpload from './components/FileUpload'
import Home from './components/Home'
import Login from './components/Login'
import './App.css'

const isAuthed = () => Boolean(localStorage.getItem('auth_user'))

function App() {
  const [view, setView] = useState('home') // home | login | app | upload
  const [authed, setAuthed] = useState(isAuthed())

  useEffect(() => {
    setAuthed(isAuthed())
  }, [view])

  const handleLoginSuccess = () => {
    localStorage.setItem('auth_user', 'admin')
    setAuthed(true)
    setView('app')
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_user')
    setAuthed(false)
    setView('home')
  }

  return (
    <div className="min-h-screen bg-background">
      {view === 'home' && <Home onLogin={() => setView('login')} />}
      {view === 'login' && <Login onBack={() => setView('home')} onSuccess={handleLoginSuccess} />}
      {view === 'upload' && <FileUpload onBack={() => setView('app')} />}
      {view === 'app' && (authed ? (
        <Dashboard onUploadClick={() => setView('upload')} />
      ) : (
        <Login onBack={() => setView('home')} onSuccess={handleLoginSuccess} />
      ))}
    </div>
  )
}

export default App
