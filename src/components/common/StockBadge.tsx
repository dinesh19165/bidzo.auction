import type { ReactNode } from 'react';

export function stockLabel(availableQuantity?: number | null): string | null {
  if (availableQuantity === undefined || availableQuantity === null) return null;
  return availableQuantity > 0 ? `${availableQuantity} available` : 'Out of stock';
}

export function StockBadge({ availableQuantity, className = '' }: { availableQuantity?: number | null; className?: string }): ReactNode {
  const label = stockLabel(availableQuantity);
  if (!label) return null;
  const available = Number(availableQuantity) > 0;
  return <span className={`inline-flex items-center rounded-md text-xs font-semibold ${available ? 'text-emerald-300' : 'text-rose-300'} ${className}`}>{label}</span>;
}
