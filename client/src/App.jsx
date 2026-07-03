import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Incidents from './pages/Incidents'
import Query from './pages/Query'
import Search from './pages/Search'
import Files from './pages/Files'
import Reports from './pages/Reports'
import Users from './pages/Users'
import AuditLogs from './pages/AuditLogs'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen flex items-center justify-center">
      <div style={{ color: '#A8A29E', fontSize: 13 }}>Loading...</div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
      <Route path="/incidents" element={<ProtectedRoute><Incidents /></ProtectedRoute>} />
      <Route path="/query" element={<ProtectedRoute><Query /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}