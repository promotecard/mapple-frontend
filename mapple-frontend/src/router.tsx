import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/components/auth/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { LandingPage } from "./components/landing/LandingPage";
import { GlobalAdminDashboard } from "./components/components/dashboards/GlobalAdminDashboard";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <GlobalAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
