

import DashboardLayout from '../layout/DashboardLayout'
import AccountStatus from '../payments/AccountStatus'
import { useTranslation } from 'react-i18next'

export default function ParentDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div style={{ padding: 24 }}>
        <h1>{t('parent.dashboardTitle')}</h1>
        <AccountStatus />
      </div>
    </DashboardLayout>
  )
}
