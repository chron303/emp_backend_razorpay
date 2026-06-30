export function Spinner({ size = 'md', className = '' }) {
  const cls = size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return <div className={`${cls} ${className}`} role="status" aria-label="Loading" />;
}

export function LoadingContainer({ message = 'Loading…' }) {
  return (
    <div className="loading-container">
      <Spinner size="lg" />
      <span>{message}</span>
    </div>
  );
}
