import { AlertTriangle } from 'lucide-react';

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        <AlertTriangle size={28} />
      </div>
      <p className="error-state-title">Error</p>
      <p className="error-state-desc">{message}</p>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry} style={{ marginTop: '0.75rem' }}>
          Try Again
        </button>
      )}
    </div>
  );
}
