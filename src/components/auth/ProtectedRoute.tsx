import { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'

type Props = {
  allowedRoles: string[]
  children: ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { loading, profile } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!profile) {
    window.location.href = '/'
    return null
  }

  if (!allowedRoles.includes(profile.role)) {
    return <div>No tienes permisos para acceder</div>
  }

  return <>{children}</>
}
