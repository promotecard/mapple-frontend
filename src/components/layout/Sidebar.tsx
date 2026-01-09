import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { menuByRole } from './menuConfig'

export default function Sidebar() {
  const { profile } = useAuth()

  if (!profile) return null

  const menu = menuByRole[profile.role]

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
    <nav>
      {menu.map(item => (
        <NavLink key={item.path} to={item.path} style={linkStyle}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
