import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequireAuth() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div>Cargando sesión...</div>
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
