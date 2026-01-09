import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h2>{t('app.name')}</h2>

        <div style={{ marginTop: 'auto', fontSize: 12, color: '#6b7280' }}>
          {/* LanguageSwitcher se reintroduce en Sprint 1 */}
          Mapple School
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  )
}
