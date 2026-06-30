import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { LoadingContainer } from '../components/common/Spinner.jsx';

/**
 * ProtectedRoute
 * - Redirects unauthenticated users to /login
 * - Optionally guards by allowed roles
 * 
 * Props:
 *  - allowedRoles: string[] | undefined
 *    If provided, only users with those roles can access.
 *    If undefined, any authenticated user can access.
 */
export function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Still checking session on initial load
  if (isLoading) {
    return <LoadingContainer message="Verifying session…" />;
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role guard
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '0.75rem',
        textAlign: 'center',
      }}>
        <div style={{
          fontSize: '3rem',
          background: 'var(--danger-muted)',
          color: 'var(--danger)',
          width: 72,
          height: 72,
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          🔒
        </div>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          You don't have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
