import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function RequireAuth() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <div style={{ padding: 24 }}>Cargando sesión...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!profile) {
    return <div style={{ padding: 24 }}>Cargando perfil...</div>
  }

  return <Outlet />
}
