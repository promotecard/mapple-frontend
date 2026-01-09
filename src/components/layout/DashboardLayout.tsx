import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          background: '#f9fafb',
          padding: 16,
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <h2>{t('app.name')}</h2>
        <Sidebar />
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
