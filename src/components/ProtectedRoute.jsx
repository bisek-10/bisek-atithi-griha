import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink-600">Loading…</div>
  }
  if (!session) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
