export function formatCurrency(value: number | string) {
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}
