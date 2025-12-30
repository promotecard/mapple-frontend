import { supabase } from '../lib/supabase'

async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (!token) {
    throw new Error('Sesión expirada. Inicia sesión nuevamente.')
  }

  return token
}

export async function createCheckout(paymentId: string) {
  const token = await getAccessToken()

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/payments/checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentId }),
    }
  )

  if (!res.ok) {
    throw new Error('Error al iniciar el pago')
  }

  return res.json()
}

export async function getMyPayments() {
  const token = await getAccessToken()

  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/payments/my`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error('Error al cargar pagos')
  }

  return res.json()
}
