import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Public
import { LandingPage } from './components/landing/LandingPage'
import Login from './modules/auth/Login'

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

        {/* App */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
