import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../constants/roles.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';

// Auth pages
import LoginPage    from '../pages/auth/LoginPage.jsx';
import RegisterPage from '../pages/auth/RegisterPage.jsx';

// Dashboard pages
import DashboardPage       from '../pages/dashboard/DashboardPage.jsx';
import EmployeesPage       from '../pages/dashboard/EmployeesPage.jsx';
import ReimbursementsPage  from '../pages/dashboard/ReimbursementsPage.jsx';
import RolesPage           from '../pages/dashboard/RolesPage.jsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route
              path="/dashboard/reimbursements"
              element={<ReimbursementsPage />}
            />

            {/* RM, APE, CFO only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.RM, ROLES.APE, ROLES.CFO]} />}>
              <Route path="/dashboard/employees" element={<EmployeesPage />} />
            </Route>

            {/* CFO only */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.CFO]} />}>
              <Route path="/dashboard/roles" element={<RolesPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all: redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
