export function generateFriendlyOrderNumber(prefix = 'CA') {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const seq = Math.floor(Math.random() * 900000 + 100000); // 6-digit random for short-term uniqueness
  return `${prefix}-${y}${m}-${seq}`;
}
