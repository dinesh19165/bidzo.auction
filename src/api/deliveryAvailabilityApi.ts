import { validateIndianPincode } from '../utils/indianPincode';

export interface DeliveryAvailabilityResult {
  available: boolean;
  estimatedDelivery?: string;
}

export type DeliveryAvailabilityAdapter = (pincode: string) => Promise<DeliveryAvailabilityResult>;

export const mockDeliveryAvailabilityAdapter: DeliveryAvailabilityAdapter = async () => {
  throw new Error('Delivery availability is not configured yet. Please continue with the existing checkout process.');
};

let adapter: DeliveryAvailabilityAdapter = mockDeliveryAvailabilityAdapter;

export function configureDeliveryAvailabilityAdapter(nextAdapter: DeliveryAvailabilityAdapter): () => void {
  const previousAdapter = adapter;
  adapter = nextAdapter;
  return () => {
    if (adapter === nextAdapter) adapter = previousAdapter;
  };
}

export async function checkDeliveryAvailability(pincode: string): Promise<DeliveryAvailabilityResult> {
  const validationError = validateIndianPincode(pincode);
  if (validationError) throw new Error(validationError);
  return adapter(pincode);
}
