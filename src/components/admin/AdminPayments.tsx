import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

type Payment = {
  id: string
  concept: string
  total_amount: number
  due_date: string
  status: string
}

export default function AdminPayments() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const session = JSON.parse(
        localStorage.getItem('sb-auth-token') || '{}'
      )

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/payments`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      )

      const data = await res.json()
      setPayments(data)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <p>Cargando pagos…</p>

  return (
    <div style={{ padding: 24 }}>
      <h2>Pagos de la escuela</h2>

      {payments.map((p) => (
        <div
          key={p.id}
          style={{
            border: '1px solid #e5e7eb',
            padding: 12,
            marginBottom: 8,
          }}
        >
          <p><strong>{p.concept}</strong></p>
          <p>Monto: USD {p.total_amount}</p>
          <p>Vence: {p.due_date}</p>
          <p>Estado: {p.status}</p>
        </div>
      ))}
    </div>
  )
}
