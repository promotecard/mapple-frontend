import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/app')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="w-full mb-3 p-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-2 rounded"
      >
        {loading ? 'Ingresando…' : 'Entrar'}
      </button>
    </form>
  )
}
