export function validateDeliveryPincode(pincode: string | null | undefined): pincode is string {
  return typeof pincode === 'string' && /^[1-9]\d{5}$/.test(pincode);
}

export function validateDeliveryRadius(value: string): string | null {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return 'Enter a radius with no more than two decimal places.';
  }

  const radiusKm = Number(value);
  if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 5000) {
    return 'Radius must be greater than 0 and no more than 5,000 km.';
  }
  return null;
}
