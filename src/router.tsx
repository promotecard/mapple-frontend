import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminPayments from './components/admin/AdminPayments'

function AdminDashboard() {
  return <div>Panel Administrador</div>
}

function ParentDashboard() {
  return <div>Panel Padres</div>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

<Route
  path="/admin/payments"
  element={
    <ProtectedRoute allowedRoles={['school_admin']}>
      <AdminPayments />
    </ProtectedRoute>
  }
/>

       <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent"
        import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import ProtectedRoute from './components/auth/ProtectedRoute'

function AdminDashboard() {
  return <div>Panel Administrador</div>
}

function ParentDashboard() {
  return <div>Panel Padres</div>
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['school_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
