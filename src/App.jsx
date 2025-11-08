import { useState } from 'react'
import Dashboard from './components/Dashboard'
import FileUpload from './components/FileUpload'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && <Dashboard onUploadClick={() => setCurrentView('upload')} />}
      {currentView === 'upload' && <FileUpload onBack={() => setCurrentView('dashboard')} />}
    </div>
  )
}

export default App
