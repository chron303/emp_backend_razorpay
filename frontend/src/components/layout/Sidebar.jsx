import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Shield,
  LogOut,
  Banknote,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../constants/roles.js';
import { getInitials } from '../../utils/formatters.js';
import { RoleBadge } from '../common/StatusBadge.jsx';
import { toast } from 'react-toastify';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    end: true,
    roles: [ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO],
  },
  {
    to: '/dashboard/reimbursements',
    icon: Receipt,
    label: 'Reimbursements',
    roles: [ROLES.EMP, ROLES.RM, ROLES.APE, ROLES.CFO],
  },
  {
    to: '/dashboard/employees',
    icon: Users,
    label: 'Employees',
    roles: [ROLES.RM, ROLES.APE, ROLES.CFO],
  },
  {
    to: '/dashboard/roles',
    icon: Shield,
    label: 'Role Management',
    roles: [ROLES.CFO],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Banknote size={20} color="white" />
        </div>
        <div>
          <div className="sidebar-brand">ReimburseFlow</div>
          <div className="sidebar-brand-sub">Management System</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User Info + Logout ── */}
      <div className="sidebar-footer">
        {user && (
          <div className="user-info">
            <div className="user-avatar">{getInitials(user.name || user.email)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name truncate">{user.name || user.email}</div>
              <RoleBadge role={user.role} />
            </div>
          </div>
        )}
        <button
          className="btn btn-ghost w-full"
          style={{ marginTop: '0.5rem', justifyContent: 'flex-start', gap: '0.625rem' }}
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
