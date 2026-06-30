/**
 * Format a number as INR currency
 * @param {number|string} amount
 */
export function formatCurrency(amount) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Format an ISO date string to a readable format
 * @param {string} dateStr
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    hour:  '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

/**
 * Get initials from a name (up to 2 chars)
 * @param {string} name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Extract error message from an Axios error
 * @param {any} err
 * @param {string} fallback
 */
export function getErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.message || err?.message || fallback;
}
