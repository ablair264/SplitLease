import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import FileUpload from './components/FileUpload'
import Home from './components/Home'
import Login from './components/Login'
import './App.css'

const isAuthed = () => Boolean(localStorage.getItem('auth_user'))

function PrivateRoute({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/deals" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/customers" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/sales" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/pricing" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/orders" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/fleet" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/ss/documents" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/robo/drivalia" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/app/robo/lex" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/upload" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
