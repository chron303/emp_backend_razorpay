import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'No records found', description = '', action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Inbox size={28} />
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}
