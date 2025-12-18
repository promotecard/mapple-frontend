import { useState } from 'react'
import { supabase } from '../../lib/supabase'


export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

   const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

if (error) {
  setError(error.message)
  return
}

const accessToken = data.session?.access_token

if (!accessToken) {
  setError('No se pudo obtener el token de sesión')
  return
}

const res = await fetch(
  `${import.meta.env.VITE_BACKEND_URL}/auth/me`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
)

if (!res.ok) {
  setError('No se pudo validar el usuario con el backend')
  return
}

const profile = await res.json()

// 👉 Aquí puedes guardar el perfil (state, context o localStorage)
localStorage.setItem('mapple_profile', JSON.stringify(profile))

// 👉 Redirección según rol
if (profile.role === 'school_admin') {
  window.location.href = '/admin'
} else if (profile.role === 'parent') {
  window.location.href = '/parent'
} else {
  setError('Rol de usuario no reconocido')
}

