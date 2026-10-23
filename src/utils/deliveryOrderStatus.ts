import type { DeliveryPersonOrderStatus } from '../api/vendorOrderApi';

export function getNextDeliveryPersonStatus(status?: string | null): DeliveryPersonOrderStatus | null {
  switch (String(status ?? '').trim().toUpperCase()) {
    case 'SHIPPED':
      return 'OUT_FOR_DELIVERY';
    case 'OUT_FOR_DELIVERY':
      return 'DELIVERED';
    default:
      return null;
  }
}
