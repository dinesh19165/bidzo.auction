export function validateIndianPincode(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || !value.trim()) return 'Enter a PIN code.';
  if (!/^\d+$/.test(value)) return 'PIN code must contain digits only.';
  if (value.length !== 6) return 'PIN code must be exactly 6 digits.';
  if (value.startsWith('0')) return 'Enter a valid Indian PIN code starting with 1–9.';
  return null;
}
