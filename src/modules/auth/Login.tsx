// src/modules/auth/Login.tsx

import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 🔥 LOGIN FORZADO TEMPORAL (DEV)
    // Esto evita Supabase mientras corregimos profiles + roles
    navigate('/app')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow max-w-md mx-auto mt-10"
    >
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión (DEV)</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-2 border rounded"
        disabled
      />

      <input
        type="password"
        placeholder="Contraseña"
        className="w-full mb-3 p-2 border rounded"
        disabled
      />

      <button
        type="submit"
        className="w-full bg-slate-900 text-white py-2 rounded"
      >
        Entrar
      </button>

      <p className="text-xs text-gray-500 mt-3">
        Modo desarrollo activo. Autenticación forzada.
      </p>
    </form>
  )
}
