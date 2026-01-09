import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './components/landing/LandingPage'
import Login from './modules/auth/Login'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
