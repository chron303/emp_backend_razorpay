import { STATUS } from '../../constants/status.js';

const DOT_STYLES = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  display: 'inline-block',
  flexShrink: 0,
};

export function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  let cls = 'badge';
  let dotColor = 'currentColor';

  if (normalized === STATUS.APPROVED) {
    cls += ' badge-approved';
    dotColor = 'var(--success)';
  } else if (normalized === STATUS.REJECTED) {
    cls += ' badge-rejected';
    dotColor = 'var(--danger)';
  } else {
    cls += ' badge-pending';
    dotColor = 'var(--warning)';
  }

  return (
    <span className={cls}>
      <span style={{ ...DOT_STYLES, background: dotColor }} />
      {normalized || 'PENDING'}
    </span>
  );
}

export function RoleBadge({ role }) {
  const roleMap = {
    EMP: 'badge-emp',
    RM:  'badge-rm',
    APE: 'badge-ape',
    CFO: 'badge-cfo',
  };
  return (
    <span className={`badge ${roleMap[role] || 'badge-emp'}`}>
      {role || '—'}
    </span>
  );
}
