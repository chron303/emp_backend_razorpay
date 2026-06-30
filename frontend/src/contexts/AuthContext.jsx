import { createContext, useState, useEffect, useCallback } from 'react';
import { login as loginService, logout as logoutService } from '../services/auth.service.js';
import { getEmployees } from '../services/employee.service.js';
import { ROLES } from '../constants/roles.js';

export const AuthContext = createContext(null);

/**
 * Role Detection Strategy:
 * ─────────────────────────────────────────────────────────────
 * The auth cookie is httpOnly — JS cannot read it.
 * The login response body is {success, message} only — no user data.
 * 
 * We detect role by probing GET /rest/employees after login:
 *   - 200 → RM | APE | CFO (further distinction done by UI — backend enforces it)
 *   - 403 → EMP
 * 
 * On page refresh, the same probe runs via checkAuth().
 * Name is stored from the form input on login.
 */
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);   // { email, name, role }
  const [isLoading, setIsLoading] = useState(true); // true while checking session

  // ── Detect role by probing /rest/employees ──────────────────────────────────
  const detectRole = useCallback(async () => {
    try {
      await getEmployees();
      // If we reach here, caller is RM, APE, or CFO
      // We return a sentinel; actual distinctions come from backend-scoped data
      return ROLES.RM; // placeholder — UI treats RM/APE/CFO the same for sidebar
    } catch (err) {
      if (err.response?.status === 403) return ROLES.EMP;
      throw err; // re-throw unexpected errors
    }
  }, []);

  // ── Check if already logged in (on page load / refresh) ────────────────────
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to hit a protected endpoint; 401 = not logged in
      const role = await detectRole();
      // We don't have name/email from cookie — restore from sessionStorage if available
      const saved = sessionStorage.getItem('erms_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser({ ...parsed, role });
      } else {
        setUser({ email: '', name: 'User', role });
      }
    } catch {
      // 401 → not authenticated
      setUser(null);
      sessionStorage.removeItem('erms_user');
    } finally {
      setIsLoading(false);
    }
  }, [detectRole]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password, name }) => {
    // 1. Call login API → sets httpOnly cookie
    await loginService({ email, password });

    // 2. Detect role via probe
    const role = await detectRole();

    // 3. Build user object (name comes from form if provided, else derive from email)
    const displayName = name || email.split('@')[0];
    const userData = { email, name: displayName, role };

    // 4. Persist to sessionStorage for refresh survival
    sessionStorage.setItem('erms_user', JSON.stringify(userData));
    setUser(userData);

    return role;
  }, [detectRole]);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } finally {
      setUser(null);
      sessionStorage.removeItem('erms_user');
    }
  }, []);

  // ── Update user info (e.g. after role assignment) ───────────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      sessionStorage.setItem('erms_user', JSON.stringify(next));
      return next;
    });
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    refreshAuth: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
