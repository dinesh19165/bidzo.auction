import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { ApiError } from '../api/apiClient';
import { getPublicDeliveryShare, updatePublicDeliveryOrderStatus, type PublicDeliveryDestination, type PublicDeliveryShareResponse } from '../api/deliveryShareApi';
import { hasVerifiedCoordinates } from '../components/checkout/DeliveryLocationPicker';
import { getNextDeliveryPersonStatus } from '../utils/deliveryOrderStatus';

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; share: PublicDeliveryShareResponse }
  | { status: 'expired' }
  | { status: 'revoked' }
  | { status: 'error'; message: string };

function mapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

function directionsUrl(destination: PublicDeliveryDestination): string | null {
  if (destination.mapUrl) {
    try {
      const url = new URL(destination.mapUrl);
      if (url.protocol === 'https:') return url.href;
    } catch {
      return null;
    }
  }
  return destination.latitude != null && destination.longitude != null
    && hasVerifiedCoordinates(destination.latitude, destination.longitude)
    ? mapUrl(destination.latitude, destination.longitude)
    : null;
}

function statusLabel(status: string): string {
  return status.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClasses(status?: string): string {
  if (status === 'DELIVERED') return 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200';
  if (status === 'OUT_FOR_DELIVERY') return 'border-blue-400/30 bg-blue-500/10 text-blue-200';
  if (status === 'SHIPPED') return 'border-amber-400/30 bg-amber-500/10 text-amber-200';
  return 'border-white/15 bg-white/5 text-slate-200';
}

export interface DestinationCardProps {
  destination: PublicDeliveryDestination;
  index: number;
  multiple: boolean;
  statusLoading: boolean;
  statusError?: string;
  onUpdateStatus: (destination: PublicDeliveryDestination) => void;
}

export function DestinationCard({
  destination,
  index,
  multiple,
  statusLoading,
  statusError,
  onUpdateStatus,
}: DestinationCardProps) {
  const directions = directionsUrl(destination);
  const orderStatus = String(destination.orderStatus ?? '').trim().toUpperCase();
  const nextStatus = getNextDeliveryPersonStatus(orderStatus);
  return (
    <article className="flex h-full flex-col gap-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{multiple ? `Destination ${index + 1}` : 'Delivery order'}</p>
          <h2 className="mt-1 text-lg font-semibold text-white">{destination.orderNumber}</h2>
          <p className="mt-1 text-xs text-slate-400">Internal order ID: #{destination.orderId}</p>
        </div>
        <span className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(orderStatus)}`}>
          {orderStatus ? statusLabel(orderStatus) : 'Status unavailable'}
        </span>
      </header>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">Products</h3>
        {destination.productNames.length
          ? <ul className="list-inside list-disc space-y-1 text-sm leading-6 text-slate-300">{destination.productNames.map((productName, productIndex) => <li key={`${productName}-${productIndex}`}>{productName}</li>)}</ul>
          : <p className="text-sm text-slate-400">Product names unavailable.</p>}
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-100">Delivery address</h3>
        <address className="space-y-1 text-sm not-italic leading-6 text-slate-200">
          {destination.addressLine1 ? <p>{destination.addressLine1}</p> : null}
          {destination.addressLine2 ? <p>{destination.addressLine2}</p> : null}
          {[destination.city, destination.state, destination.postalCode].filter(Boolean).length ? <p>{[destination.city, destination.state, destination.postalCode].filter(Boolean).join(', ')}</p> : null}
          {destination.country ? <p>{destination.country}</p> : null}
        </address>
        {destination.scheduledDeliveryDate ? <p className="text-sm text-slate-400">Scheduled delivery: {destination.scheduledDeliveryDate}</p> : null}
      </section>

      <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
        {directions
          ? <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">Open directions</a>
          : <p className="text-sm text-amber-200">Map directions are unavailable for this destination.</p>}
        {orderStatus === 'DELIVERED'
          ? <span className="text-sm font-medium text-emerald-200">Delivery completed</span>
          : nextStatus
            ? <button type="button" disabled={statusLoading} onClick={() => onUpdateStatus(destination)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-400/30 px-4 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50">
              {statusLoading ? 'Updating status...' : nextStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : 'Mark Delivered'}
            </button>
            : null}
      </div>
      {statusError ? <p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{statusError}</p> : null}
    </article>
  );
}

export interface DeliveryDestinationListProps {
  destinations: PublicDeliveryDestination[];
  updatingOrderId: number | null;
  statusErrors: Record<number, string>;
  onUpdateStatus: (destination: PublicDeliveryDestination) => void;
}

export function DeliveryDestinationList({
  destinations,
  updatingOrderId,
  statusErrors,
  onUpdateStatus,
}: DeliveryDestinationListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {destinations.map((destination, index) => (
        <DestinationCard
          key={`${destination.orderId}-${index}`}
          destination={destination}
          index={index}
          multiple={destinations.length > 1}
          statusLoading={updatingOrderId !== null}
          statusError={statusErrors[destination.orderId]}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}

export function DeliverySharePage() {
  const { token } = useParams();
  const [state, setState] = useState<PageState>({ status: 'loading' });
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [statusErrors, setStatusErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: 'This delivery link is incomplete.' });
      return;
    }
    let active = true;
    setState({ status: 'loading' });
    getPublicDeliveryShare(token).then((share) => {
      if (active) setState({ status: 'ready', share });
    }).catch((error: unknown) => {
      if (!active) return;
      if (error instanceof ApiError && error.status === 410) {
        setState({ status: 'expired' });
      } else if (error instanceof ApiError && error.status === 404) {
        setState({ status: 'revoked' });
      } else {
        setState({ status: 'error', message: error instanceof Error ? error.message : 'Unable to load this delivery link.' });
      }
    });
    return () => { active = false; };
  }, [token]);

  const updateStatus = async (destination: PublicDeliveryDestination) => {
    if (!token || destination.orderId == null || updatingOrderId !== null) return;
    const status = getNextDeliveryPersonStatus(destination.orderStatus);
    if (!status) return;

    const orderId = destination.orderId;
    setUpdatingOrderId(orderId);
    setStatusErrors((current) => ({ ...current, [orderId]: '' }));
    try {
      await updatePublicDeliveryOrderStatus(token, orderId, status);
      try {
        const share = await getPublicDeliveryShare(token);
        setState({ status: 'ready', share });
      } catch (refreshError: unknown) {
        if (refreshError instanceof ApiError && refreshError.status === 410) {
          setState({ status: 'expired' });
        } else if (refreshError instanceof ApiError && refreshError.status === 404) {
          setState({ status: 'revoked' });
        } else {
          const detail = refreshError instanceof Error ? refreshError.message : 'Unable to reload delivery details.';
          setStatusErrors((current) => ({ ...current, [orderId]: `Status updated, but the latest delivery details could not be refreshed. ${detail}` }));
        }
      }
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 410) {
        setState({ status: 'expired' });
      } else if (error instanceof ApiError && error.status === 404) {
        setState({ status: 'revoked' });
      } else {
        const message = error instanceof ApiError && (error.status === 400 || error.status === 409)
          ? 'This delivery status transition is not valid anymore. Refresh the page to see the latest status.'
          : error instanceof ApiError && error.status === 401
            ? 'This delivery link does not authorize this update.'
            : error instanceof TypeError
              ? 'Network error while updating delivery status. Check your connection and try again.'
              : error instanceof Error
                ? error.message
                : 'Unable to update this delivery status.';
        setStatusErrors((current) => ({ ...current, [orderId]: message }));
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <SectionShell title="Delivery destinations" subtitle="Address details shared for this delivery">
          {state.status === 'loading' ? <p role="status" className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">Loading delivery details...</p>
            : state.status === 'expired' ? <div role="status" className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5"><h2 className="font-semibold text-amber-100">This delivery link has expired</h2><p className="mt-2 text-sm text-amber-100/80">Ask the sender for a current delivery link.</p></div>
              : state.status === 'revoked' ? <div role="status" className="rounded-2xl border border-slate-400/20 bg-slate-700/30 p-5"><h2 className="font-semibold text-white">This delivery link is no longer available</h2><p className="mt-2 text-sm text-slate-300">It may have been revoked or is no longer valid. Ask the sender for a current link.</p></div>
                : state.status === 'error' ? <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5"><h2 className="font-semibold text-rose-100">Unable to open delivery link</h2><p className="mt-2 text-sm text-rose-100/80">{state.message}</p></div>
                  : (() => {
                    const destinations = state.share.destinations;
                    return destinations.length === 0
                      ? <p role="status" className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">No delivery destinations are available in this link.</p>
                      : <DeliveryDestinationList
                        destinations={destinations}
                        updatingOrderId={updatingOrderId}
                        statusErrors={statusErrors}
                        onUpdateStatus={(item) => { void updateStatus(item); }}
                      />;
                  })()}
        </SectionShell>
      </div>
    </main>
  );
}
