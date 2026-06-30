import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';

/**
 * useAuth — consume the AuthContext.
 * Throws if used outside <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return context;
}
