import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login({ onBack, onSuccess }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (username === 'admin' && password === '123') {
      localStorage.setItem('auth_user', username)
      setError('')
      if (onSuccess) onSuccess(); else navigate('/app')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-6 rounded-xl border border-border bg-card shadow">
        <h1 className="text-xl font-semibold mb-4 text-foreground">Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Username</label>
            <input className="w-full px-3 py-2 rounded border border-input bg-background text-foreground" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">Password</label>
            <input type="password" className="w-full px-3 py-2 rounded border border-input bg-background text-foreground" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-3 py-2 rounded bg-amber-400 hover:bg-amber-500 text-black">Login</button>
            <button type="button" onClick={() => (onBack ? onBack() : navigate('/'))} className="px-3 py-2 rounded border border-input text-foreground">Back</button>
          </div>
        </form>
      </div>
    </div>
  )
}
