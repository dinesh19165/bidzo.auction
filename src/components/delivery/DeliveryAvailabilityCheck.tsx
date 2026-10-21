import { useRef, useState } from 'react';
import { checkDeliveryAvailability } from '../../api/deliveryAvailabilityApi';
import { validateIndianPincode } from '../../utils/indianPincode';

type Props = {
  initialPincode?: string;
  readOnly?: boolean;
  onAvailabilityChange?: (available: boolean | null) => void;
};

type CheckStatus = 'idle' | 'checking' | 'available' | 'unavailable' | 'invalid' | 'error';

export default function DeliveryAvailabilityCheck({ initialPincode = '', readOnly = false, onAvailabilityChange }: Props) {
  const [pincode, setPincode] = useState(initialPincode);
  const [status, setStatus] = useState<CheckStatus>('idle');
  const [message, setMessage] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | undefined>();
  const requestId = useRef(0);

  const handlePincodeChange = (value: string) => {
    requestId.current += 1;
    setPincode(value);
    setStatus('idle');
    setMessage('');
    setEstimatedDelivery(undefined);
    onAvailabilityChange?.(null);
  };

  const checkAvailability = async () => {
    const validationError = validateIndianPincode(pincode);
    if (validationError) {
      setStatus('invalid');
      setMessage(validationError);
      setEstimatedDelivery(undefined);
      onAvailabilityChange?.(null);
      return;
    }

    setStatus('checking');
    const currentRequestId = ++requestId.current;
    setMessage('');
    setEstimatedDelivery(undefined);
    onAvailabilityChange?.(null);

    try {
      const result = await checkDeliveryAvailability(pincode);
      if (currentRequestId !== requestId.current) return;
      setStatus(result.available ? 'available' : 'unavailable');
      setMessage(result.available ? 'Delivery is available to this PIN code.' : 'Delivery is not available to this PIN code.');
      setEstimatedDelivery(result.available ? result.estimatedDelivery : undefined);
      onAvailabilityChange?.(result.available);
    } catch (error) {
      if (currentRequestId !== requestId.current) return;
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to check delivery availability. Please try again.');
      onAvailabilityChange?.(null);
    }
  };

  const messageClass = status === 'available'
    ? 'text-emerald-600'
    : status === 'checking'
      ? 'text-[var(--text-muted)]'
      : status === 'idle'
        ? 'text-[var(--text-muted)]'
        : 'text-rose-600';

  return (
    <section aria-labelledby="delivery-availability-heading" className="mt-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4">
      <h2 id="delivery-availability-heading" className="text-base font-semibold text-[var(--text-primary)]">Delivery availability</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">Enter an Indian PIN code to check delivery service.</p>
      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void checkAvailability();
        }}
      >
        <label htmlFor="delivery-pincode" className="sr-only">Six-digit Indian PIN code</label>
        <input
          id="delivery-pincode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="postal-code"
          value={pincode}
          readOnly={readOnly}
          onChange={(event) => handlePincodeChange(event.target.value)}
          aria-describedby="delivery-pincode-message"
          aria-invalid={status === 'invalid'}
          className="h-11 min-w-0 flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-blue-500 read-only:opacity-80"
        />
        <button
          type="submit"
          disabled={status === 'checking'}
          aria-busy={status === 'checking'}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        >
          {status === 'checking' ? (
            <>
              <span aria-hidden="true" className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Checking…
            </>
          ) : 'Check'}
        </button>
      </form>
      <p id="delivery-pincode-message" role="status" aria-live="polite" className={`mt-2 min-h-5 text-sm ${messageClass}`}>
        {status === 'idle' ? 'Availability will be confirmed by the delivery service.' : status === 'checking' ? 'Checking delivery availability…' : message}
      </p>
      {status === 'available' && estimatedDelivery ? <p className="mt-1 text-sm text-[var(--text-secondary)]">Estimated delivery: {estimatedDelivery}</p> : null}
    </section>
  );
}
