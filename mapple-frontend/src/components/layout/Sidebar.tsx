import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function Sidebar() {
  const { t } = useTranslation()
  const { profile } = useAuth()

  if (!profile) return null

  const role = profile.role

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
      {/* MENÚ PADRE */}
      {role === 'parent' && (
        <>
          <h4>{t('menu.parent')}</h4>

          <NavLink to="/parent" style={linkStyle}>
            {t('menu.dashboard')}
          </NavLink>

          <NavLink to="/parent/payments" style={linkStyle}>
            {t('menu.payments')}
          </NavLink>
        </>
      )}

      {/* MENÚ ADMIN */}
      {role === 'school_admin' && (
        <>
          <h4>{t('menu.admin')}</h4>

          <NavLink to="/admin/payments" style={linkStyle}>
            {t('menu.payments')}
          </NavLink>

          <NavLink to="/admin/users" style={linkStyle}>
            {t('menu.users')}
          </NavLink>

          <NavLink to="/admin/reports" style={linkStyle}>
            {t('menu.reports')}
          </NavLink>
        </>
      )}
    </aside>
  )
}

