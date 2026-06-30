import { AlertTriangle, X } from 'lucide-react';
import { Spinner } from './Spinner.jsx';

/**
 * ConfirmDialog — generic confirmation modal.
 * Props:
 *  - isOpen: boolean
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default "Confirm")
 *  - confirmVariant: 'danger' | 'success' | 'primary' (default 'danger')
 *  - isLoading: boolean
 *  - onConfirm: () => void
 *  - onCancel: () => void
 */
export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const btnClass = {
    danger:  'btn btn-danger',
    success: 'btn btn-success',
    primary: 'btn btn-primary',
  }[confirmVariant] || 'btn btn-danger';

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 'var(--radius-md)',
              background: confirmVariant === 'success' ? 'var(--success-muted)' : 'var(--danger-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: confirmVariant === 'success' ? 'var(--success)' : 'var(--danger)',
              flexShrink: 0,
            }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ margin: 0 }}>{title}</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        {message && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className={btnClass} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? <><Spinner /> Processing…</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
