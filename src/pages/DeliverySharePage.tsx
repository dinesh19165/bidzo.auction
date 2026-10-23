import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SectionShell } from '../components/SectionShell';
import { ApiError } from '../api/apiClient';
import { getPublicDeliveryShare, type PublicDeliveryDestination, type PublicDeliveryShareResponse } from '../api/deliveryShareApi';
import { hasVerifiedCoordinates } from '../components/checkout/DeliveryLocationPicker';

type PageState =
  | { status: 'loading' }
  | { status: 'ready'; share: PublicDeliveryShareResponse }
  | { status: 'expired' }
  | { status: 'revoked' }
  | { status: 'error'; message: string };

function destinationFromShare(share: PublicDeliveryShareResponse): PublicDeliveryDestination[] {
  if (Array.isArray(share.destinations)) return share.destinations;
  if (share.addressLine1 || share.city || share.postalCode) {
    const { addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, scheduledDeliveryDate } = share;
    return [{ addressLine1, addressLine2, city, state, postalCode, country, latitude, longitude, scheduledDeliveryDate }];
  }
  return [];
}

function mapUrl(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

function DestinationCard({ destination, index, multiple }: { destination: PublicDeliveryDestination; index: number; multiple: boolean }) {
  const directions = destination.latitude != null && destination.longitude != null
    && hasVerifiedCoordinates(destination.latitude, destination.longitude)
    ? mapUrl(destination.latitude, destination.longitude)
    : null;
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-6">
      {multiple ? <h2 className="mb-3 text-base font-semibold text-white">Destination {index + 1}</h2> : null}
      <address className="space-y-1 text-sm not-italic leading-6 text-slate-200">
        {destination.addressLine1 ? <p>{destination.addressLine1}</p> : null}
        {destination.addressLine2 ? <p>{destination.addressLine2}</p> : null}
        {[destination.city, destination.state, destination.postalCode].filter(Boolean).length ? <p>{[destination.city, destination.state, destination.postalCode].filter(Boolean).join(', ')}</p> : null}
        {destination.country ? <p>{destination.country}</p> : null}
      </address>
      {destination.scheduledDeliveryDate ? <p className="mt-3 text-sm text-slate-400">Scheduled delivery: {destination.scheduledDeliveryDate}</p> : null}
      {directions
        ? <a href={directions} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">View on OpenStreetMap</a>
        : <p className="mt-4 text-sm text-amber-200">Map directions are unavailable for this destination.</p>}
    </article>
  );
}

export function DeliverySharePage() {
  const { token } = useParams();
  const [state, setState] = useState<PageState>({ status: 'loading' });

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

  return (
    <main className="min-h-[100dvh] bg-slate-950 px-4 py-6 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <SectionShell title="Delivery destinations" subtitle="Address details shared for this delivery">
          {state.status === 'loading' ? <p role="status" className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">Loading delivery details...</p>
            : state.status === 'expired' ? <div role="status" className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5"><h2 className="font-semibold text-amber-100">This delivery link has expired</h2><p className="mt-2 text-sm text-amber-100/80">Ask the sender for a current delivery link.</p></div>
              : state.status === 'revoked' ? <div role="status" className="rounded-2xl border border-slate-400/20 bg-slate-700/30 p-5"><h2 className="font-semibold text-white">This delivery link is no longer available</h2><p className="mt-2 text-sm text-slate-300">It may have been revoked or is no longer valid. Ask the sender for a current link.</p></div>
                : state.status === 'error' ? <div role="alert" className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5"><h2 className="font-semibold text-rose-100">Unable to open delivery link</h2><p className="mt-2 text-sm text-rose-100/80">{state.message}</p></div>
                  : (() => {
                    const destinations = destinationFromShare(state.share);
                    return destinations.length === 0
                      ? <p role="status" className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 text-sm text-slate-300">No delivery destinations are available in this link.</p>
                      : <div className="space-y-4">{destinations.map((destination, index) => <DestinationCard key={index} destination={destination} index={index} multiple={destinations.length > 1} />)}</div>;
                  })()}
        </SectionShell>
      </div>
    </main>
  );
}
