import AccountStatus from '../payments/AccountStatus'

export default function ParentDashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Panel del Padre</h1>
      <AccountStatus />
    </div>
  )
}
