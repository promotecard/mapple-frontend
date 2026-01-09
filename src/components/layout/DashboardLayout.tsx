import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import LanguageSwitcher from '../ui/LanguageSwitcher'
// import { useAuth } from '../../context/AuthContext'

export default function DashboardLayout() {
  const { t } = useTranslation()
  // const { logout } = useAuth()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: '#f9fafb',
          padding: 16,
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>{t('app.name')}</h2>

        {/* Menú vendrá aquí */}

        <div style={{ marginTop: 'auto' }}>
          <LanguageSwitcher />

          {/*
          <button
            style={{ marginTop: 12 }}
            onClick={logout}
          >
            {t('common.logout')}
          </button>
          */}
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
