import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  children: ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            Mapple School
          </Link>
          <span className="text-sm text-slate-600">
            Acceso seguro
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
