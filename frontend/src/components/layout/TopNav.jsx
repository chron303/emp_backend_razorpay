import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { RoleBadge } from '../common/StatusBadge.jsx';
import { ROLE_LABELS } from '../../constants/roles.js';

const PAGE_TITLES = {
  '/dashboard':                'Dashboard',
  '/dashboard/reimbursements': 'Reimbursements',
  '/dashboard/employees':      'Employees',
  '/dashboard/roles':          'Role Management',
};

export function TopNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const title = PAGE_TITLES[pathname] || 'Dashboard';
  const roleLabel = user?.role ? ROLE_LABELS[user.role] || user.role : '';

  return (
    <header className="topnav">
      <div>
        <span className="topnav-title">{title}</span>
      </div>
      <div className="topnav-actions">
        {user?.role && <RoleBadge role={user.role} />}
        {roleLabel && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {roleLabel}
          </span>
        )}
      </div>
    </header>
  );
}
