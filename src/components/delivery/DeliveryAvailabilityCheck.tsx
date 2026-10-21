import { useEffect, useState } from 'react';
import { ApiError } from '../../api/apiClient';
import { checkDeliveryAvailability, type DeliveryCheckResult } from '../../api/deliveryApi';
import { validateDeliveryPincode } from '../../utils/deliveryValidation';

type DeliveryState =
  | { key: string; status: 'checking' }
  | { key: string; status: 'available'; result: DeliveryCheckResult }
  | { key: string; status: 'unavailable' }
  | { key: string; status: 'invalid' }
  | { key: string; status: 'error' };

type Props = {
  productId: number;
  pincode?: string | null;
  onAvailabilityChange?: (available: boolean | null) => void;
};

const INVALID_PINCODE_MESSAGE = 'Unable to verify delivery for this PIN code. Please check the PIN code and try again.';
const UNAVAILABLE_MESSAGE = 'Sorry, delivery is not available to this PIN code.';
const UNAVAILABLE_ERROR_MESSAGE = 'Unable to check delivery availability. Please try again.';

export default function DeliveryAvailabilityCheck({ productId, pincode, onAvailabilityChange }: Props) {
  const key = `${productId}:${pincode ?? ''}`;
  const [deliveryState, setDeliveryState] = useState<DeliveryState | null>(null);
  const currentState = deliveryState?.key === key ? deliveryState : null;

  useEffect(() => {
    onAvailabilityChange?.(null);
    const checkedPincode = pincode;
    if (!validateDeliveryPincode(checkedPincode) || !Number.isInteger(productId) || productId <= 0) {
      setDeliveryState({ key, status: 'invalid' });
      return undefined;
    }

    const controller = new AbortController();
    setDeliveryState({ key, status: 'checking' });

    checkDeliveryAvailability({ productId, pincode: checkedPincode }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!result.success) {
          setDeliveryState({ key, status: 'invalid' });
          onAvailabilityChange?.(null);
        } else if (result.deliveryAvailable === true) {
          setDeliveryState({ key, status: 'available', result });
          onAvailabilityChange?.(true);
        } else if (result.deliveryAvailable === false) {
          setDeliveryState({ key, status: 'unavailable' });
          onAvailabilityChange?.(false);
        } else {
          setDeliveryState({ key, status: 'error' });
          onAvailabilityChange?.(null);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setDeliveryState({
          key,
          status: error instanceof ApiError && [400, 422].includes(error.status) ? 'invalid' : 'error',
        });
        onAvailabilityChange?.(null);
      });

    return () => controller.abort();
  }, [key, productId, pincode, onAvailabilityChange]);

  const status = currentState?.status ?? 'checking';
  const message = status === 'available'
    ? 'Delivery is available to your PIN code.'
    : status === 'unavailable'
      ? UNAVAILABLE_MESSAGE
      : status === 'invalid'
        ? INVALID_PINCODE_MESSAGE
        : status === 'error'
          ? UNAVAILABLE_ERROR_MESSAGE
          : 'Checking delivery availability…';
  const result = currentState?.status === 'available' ? currentState.result : null;

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm" aria-live="polite">
      <p className={`flex items-center gap-2 ${status === 'available' ? 'text-emerald-300' : status === 'checking' ? 'text-slate-300' : 'text-rose-300'}`}>
        {status === 'checking' ? <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {message}
      </p>
      {result ? (
        <p className="mt-1 text-xs text-slate-400">
          {typeof result.distanceKm === 'number' ? `Distance: ${result.distanceKm} km` : null}
          {typeof result.distanceKm === 'number' && typeof result.configuredRadiusKm === 'number' ? ' · ' : null}
          {typeof result.configuredRadiusKm === 'number' ? `Delivery radius: ${result.configuredRadiusKm} km` : null}
        </p>
      ) : null}
    </div>
  );
}
