import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public
import { LandingPage } from './components/landing/LandingPage'
import Login from './modules/auth/Login'

// Auth
import RequireAuth from './modules/auth/RequireAuth'

// Layout
import DashboardLayout from './components/layout/DashboardLayout'

// App
import Dashboard from './modules/app/Dashboard'

// Debug
import VerifyContext from './modules/debug/VerifyContext'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Debug */}
        <Route path="/debug" element={<VerifyContext />} />

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
