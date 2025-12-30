import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import DashboardLayout from '../layout/DashboardLayout'

type Payment = {
  id: string
  parent_name: string
  concept: string
  total_amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
}

export default function AdminPayments() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/payments/admin`
        )
        const data = await res.json()
        setPayments(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPayments()
  }, [])

  if (loading) {
    return <DashboardLayout>{t('common.loading')}</DashboardLayout>
  }

  return (
    <DashboardLayout>
      <h1>{t('admin.paymentsTitle')}</h1>

      <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>{t('payments.parent')}</th>
            <th>{t('payments.concept')}</th>
            <th>{t('payments.amount')}</th>
            <th>{t('payments.dueDate')}</th>
            <th>{t('payments.status')}</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.parent_name}</td>
              <td>{p.concept}</td>
              <td>USD {p.total_amount}</td>
              <td>{p.due_date}</td>
              <td>
                <strong>{t(`status.${p.status}`)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DashboardLayout>
  )
}
