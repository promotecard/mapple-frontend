import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public
import { LandingPage } from './components/landing/LandingPage'
import Login from './modules/auth/Login'

// Auth
import RequireAuth from './modules/auth/RequireAuth'

// App
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './modules/app/Dashboard'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protegido */}
        <Route element={<RequireAuth />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
