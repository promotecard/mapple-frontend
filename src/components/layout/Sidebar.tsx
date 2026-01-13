import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { menuConfig } from './menuConfig'
import type { UserRole } from '../../modules/auth/roles'

export default function Sidebar() {
  const { profile } = useAuth()

  // ⛔ Si aún no hay perfil, no renderizamos nada
  if (!profile) return null

  // ✅ El rol VIENE DE profiles.role (BD)
  const role = profile.role as UserRole

  const items = menuConfig[role] ?? []

  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'block',
    padding: '8px 12px',
    borderRadius: 6,
    textDecoration: 'none',
    color: isActive ? '#111827' : '#374151',
    background: isActive ? '#e5e7eb' : 'transparent',
    marginBottom: 4,
  })

  return (
    <aside
      style={{
        width: 240,
        background: '#f9fafb',
        padding: 16,
        borderRight: '1px solid #e5e7eb',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 12 }}>
        {role.replace('_', ' ').toUpperCase()}
      </strong>

      {items.map((item) => (
        <NavLink key={item.path} to={item.path} style={linkStyle}>
          {item.label}
        </NavLink>
      ))}
    </aside>
  )
}
