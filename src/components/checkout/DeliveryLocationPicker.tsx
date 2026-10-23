import { useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Crosshair, MapPin, Search, X } from 'lucide-react';
import { reverseGeocode, searchCustomerLocations, type CustomerLocation } from '../../utils/customerLocation';

type AddressFields = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Props = {
  latitude?: number | null;
  longitude?: number | null;
  selectedAddress?: string;
  onChange: (selection: { latitude: number | null; longitude: number | null; address?: Partial<AddressFields> }) => void;
};

type Coordinates = { latitude: number; longitude: number };
type MapTile = { key: string; left: number; top: number; url: string };
const TILE_SIZE = 256;
const MAP_ZOOM = 16;

function validCoordinates(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

function mapUrl({ latitude, longitude }: Coordinates): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

function toWorldPixel({ latitude, longitude }: Coordinates, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const latitudeRadians = latitude * Math.PI / 180;
  return {
    x: (longitude + 180) / 360 * scale,
    y: (1 - Math.asinh(Math.tan(latitudeRadians)) / Math.PI) / 2 * scale,
  };
}

function fromWorldPixel(x: number, y: number, zoom: number): Coordinates {
  const scale = TILE_SIZE * 2 ** zoom;
  const wrappedX = ((x % scale) + scale) % scale;
  const latitude = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / scale))) * 180 / Math.PI;
  return { latitude, longitude: wrappedX / scale * 360 - 180 };
}

function tileCoordinate(value: number, max: number) {
  return ((value % max) + max) % max;
}

export function hasVerifiedCoordinates(latitude?: number | null, longitude?: number | null): latitude is number {
  return latitude != null && longitude != null && validCoordinates(latitude, longitude);
}

export function DirectionsLink({ latitude, longitude, className = '' }: { latitude?: number | null; longitude?: number | null; className?: string }) {
  if (longitude == null || !hasVerifiedCoordinates(latitude, longitude)) return null;
  const url = mapUrl({ latitude, longitude });
  return <a className={className} href={url} target="_blank" rel="noopener noreferrer">View on OpenStreetMap</a>;
}

export default function DeliveryLocationPicker({ latitude, longitude, selectedAddress, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [candidate, setCandidate] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [addressLookupStatus, setAddressLookupStatus] = useState<'looked-up' | 'manual' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerLocation[]>([]);
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(() => hasVerifiedCoordinates(latitude, longitude)
    ? { latitude, longitude: longitude! }
    : null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });

  const selected = hasVerifiedCoordinates(latitude, longitude);
  const centerPixel = mapCenter ? toWorldPixel(mapCenter, MAP_ZOOM) : null;
  const mapOrigin = centerPixel ? {
    x: centerPixel.x - mapSize.width / 2,
    y: centerPixel.y - mapSize.height / 2,
  } : null;
  const tiles = useMemo(() => {
    if (!mapOrigin || mapSize.width === 0 || mapSize.height === 0) return [];
    const tileCount = 2 ** MAP_ZOOM;
    const firstX = Math.floor(mapOrigin.x / TILE_SIZE) - 1;
    const lastX = Math.floor((mapOrigin.x + mapSize.width) / TILE_SIZE) + 1;
    const firstY = Math.max(0, Math.floor(mapOrigin.y / TILE_SIZE) - 1);
    const lastY = Math.min(tileCount - 1, Math.floor((mapOrigin.y + mapSize.height) / TILE_SIZE) + 1);
    const result: MapTile[] = [];
    for (let y = firstY; y <= lastY; y += 1) {
      for (let x = firstX; x <= lastX; x += 1) {
        const wrappedX = tileCoordinate(x, tileCount);
        result.push({
          key: `${wrappedX}-${y}`,
          left: x * TILE_SIZE - mapOrigin.x,
          top: y * TILE_SIZE - mapOrigin.y,
          url: `https://tile.openstreetmap.org/${MAP_ZOOM}/${wrappedX}/${y}.png`,
        });
      }
    }
    return result;
  }, [mapOrigin?.x, mapOrigin?.y, mapSize.height, mapSize.width]);

  useEffect(() => {
    if (!open || !mapCenter) return undefined;
    const map = mapRef.current;
    if (!map) return undefined;
    const updateSize = () => setMapSize({ width: map.clientWidth, height: map.clientHeight });
    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
    const observer = new ResizeObserver(updateSize);
    observer.observe(map);
    return () => observer.disconnect();
  }, [open, Boolean(mapCenter)]);

  const openPicker = () => {
    setLocationError('');
    setSearchResults([]);
    const current = hasVerifiedCoordinates(latitude, longitude) ? { latitude, longitude: longitude! } : null;
    setCandidate(current);
    setMapCenter(current);
    setOpen(true);
  };

  const locate = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Location services are not available. Search for a place or select a location manually on the map.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { latitude: coords.latitude, longitude: coords.longitude };
        if (!validCoordinates(point.latitude, point.longitude)) {
          setLocationError('The browser returned an invalid location. Search for a place or try again.');
        } else {
          setCandidate(point);
          setMapCenter(point);
          setSearchResults([]);
        }
        setLocating(false);
      },
      (error) => {
        setLocationError(error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Search for a place or choose the location manually on the map.'
          : 'Unable to determine your location. Search for a place or try again.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const searchPlaces = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setLocationError('Enter a place, street, or locality to search.');
      return;
    }
    setSearching(true);
    setLocationError('');
    setSearchResults([]);
    try {
      const results = await searchCustomerLocations(query);
      if (results.length === 0) {
        setLocationError('No matching places found. Try a nearby landmark or move the map pin manually.');
        return;
      }
      setSearchResults(results);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Place search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result: CustomerLocation) => {
    const point = { latitude: result.latitude, longitude: result.longitude };
    if (!validCoordinates(point.latitude, point.longitude)) {
      setLocationError('That search result did not provide a valid location. Choose another result.');
      return;
    }
    setLocationError('');
    setCandidate(point);
    setMapCenter(point);
    setSearchResults([]);
  };

  const selectMapPoint = (event: MouseEvent<HTMLDivElement>) => {
    if (!mapOrigin || !mapRef.current) return;
    const bounds = mapRef.current.getBoundingClientRect();
    const point = fromWorldPixel(mapOrigin.x + event.clientX - bounds.left, mapOrigin.y + event.clientY - bounds.top, MAP_ZOOM);
    if (validCoordinates(point.latitude, point.longitude)) {
      setLocationError('');
      setCandidate(point);
      setMapCenter(point);
    }
  };

  const confirmPin = async () => {
    if (!candidate) return;
    setLocationError('');
    setGeocoding(true);
    try {
      const place = await reverseGeocode(candidate.latitude, candidate.longitude);
      onChange({
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        address: {
          addressLine1: place.addressLine1,
          addressLine2: place.addressLine2,
          city: place.city,
          state: place.state,
          postalCode: place.pincode,
          country: place.country,
        },
      });
      setAddressLookupStatus('looked-up');
      setOpen(false);
      setCandidate(null);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Address lookup failed. Retry or enter the address manually.');
    } finally {
      setGeocoding(false);
    }
  };

  const usePinForManualAddress = () => {
    if (!candidate) return;
    onChange({
      latitude: candidate.latitude,
      longitude: candidate.longitude,
      address: { addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '' },
    });
    setAddressLookupStatus('manual');
    setLocationError('');
    setOpen(false);
    setCandidate(null);
  };

  const statusText = selected
    ? 'Location selected. Address details were looked up for this pin.'
    : 'Choose a delivery location to verify the address and enable checkout.';

  return (
    <section className="w-full min-w-0 space-y-3 rounded-2xl border border-white/10 bg-slate-950/40 p-3 sm:p-4" aria-label="Delivery location">
      <div className="flex min-w-0 flex-col items-stretch gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
          <div className="min-w-0 flex-1">
          <p className="font-medium text-white">Delivery location</p>
          <p role="status" aria-live="polite" className={`mt-1 break-words text-sm leading-5 ${selected ? 'text-emerald-300' : 'text-amber-200'}`}>{selected ? addressLookupStatus === 'manual' ? 'Location confirmed. Entered address manually; check that it matches the pin.' : addressLookupStatus === 'looked-up' ? statusText : 'Location selected.' : statusText}</p>
          {selected ? <>
            {selectedAddress ? <p className="mt-2 break-words text-sm leading-5 text-slate-200">{selectedAddress}</p> : null}
            <p className="mt-1 break-words text-xs text-slate-400">Latitude {latitude.toFixed(6)}, longitude {longitude?.toFixed(6)}</p>
          </> : null}
          </div>
        </div>
        <button type="button" onClick={openPicker} className="inline-flex min-h-12 w-full min-w-0 flex-wrap items-center justify-center gap-2 whitespace-normal rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-semibold leading-5 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:px-5">
          <MapPin aria-hidden="true" className="h-4 w-4" />{selected ? 'Change Location' : 'Choose Delivery Location'}
        </button>
      </div>

      {open ? <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !geocoding) setOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="delivery-location-title" className="flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-slate-900 shadow-2xl sm:max-h-[90dvh] sm:rounded-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <div><h2 id="delivery-location-title" className="font-semibold text-white">Choose Delivery Location</h2><p className="mt-0.5 text-xs text-slate-400">Search for a place or move the map pin to your exact address.</p></div>
            <button type="button" aria-label="Close location picker" disabled={geocoding} onClick={() => setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-300 hover:bg-white/10 disabled:opacity-50"><X className="h-5 w-5" /></button>
          </header>
          <div className="space-y-3 overflow-y-auto p-4 sm:p-5">
            <form onSubmit={(event) => { void searchPlaces(event); }} className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="delivery-place-search">Search for a place or address</label>
              <input id="delivery-place-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search a place, street, or landmark" className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-400/50" />
              <button type="submit" disabled={searching} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-blue-400/30 px-4 text-sm font-medium text-blue-100 hover:bg-blue-500/10 disabled:opacity-50"><Search className="h-4 w-4" />{searching ? 'Searching...' : 'Search'}</button>
              <button type="button" onClick={locate} disabled={locating} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50"><Crosshair className="h-4 w-4" />{locating ? 'Locating...' : 'Current location'}</button>
            </form>
            {searchResults.length ? <ul className="max-h-44 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-slate-950/70 p-1" aria-label="Place search results">{searchResults.map((result, index) => <li key={`${result.latitude}:${result.longitude}:${index}`}><button type="button" onClick={() => selectSearchResult(result)} className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10">{result.displayName}</button></li>)}</ul> : null}
            {mapCenter ? <div className="space-y-2">
              <p className="text-sm text-slate-300">{candidate ? 'Tap or click the map to reposition the pin.' : 'Select a point on the map to place the delivery pin.'}</p>
              <div ref={mapRef} role="group" tabIndex={0} aria-label="Delivery map. Select a point to place the pin." onClick={selectMapPoint} onKeyDown={(event) => {
                if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                if (mapCenter) setCandidate(mapCenter);
              }} className="relative h-[min(42dvh,360px)] min-h-56 w-full cursor-crosshair touch-manipulation overflow-hidden rounded-xl border border-white/15 bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                {tiles.map((tile) => <img key={tile.key} src={tile.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE }} />)}
                <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-[85%] rounded-full rounded-bl-none border-[3px] border-white bg-rose-600 shadow-lg" style={{ rotate: '-45deg' }} />
                <span className="absolute bottom-1 left-1 z-20 rounded bg-white/90 px-1 text-[10px] text-slate-900"><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>© OpenStreetMap contributors</a></span>
              </div>
              {candidate ? <p className="break-all text-xs text-slate-400">Pin: {candidate.latitude.toFixed(6)}, {candidate.longitude.toFixed(6)}</p> : null}
            </div> : <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-white/15 bg-slate-950/50 p-6 text-center"><p className="max-w-sm text-sm leading-6 text-slate-400">Search for a place or use your current location to open the map. No location is selected until you confirm the pin.</p></div>}
            {locationError ? <div role="alert" className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">{locationError}</div> : null}
          </div>
          <footer className="flex flex-col-reverse gap-2 border-t border-white/10 p-4 sm:flex-row sm:justify-end sm:px-5">
            <button type="button" disabled={geocoding} onClick={() => setOpen(false)} className="min-h-11 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-50">Cancel</button>
            <button type="button" disabled={!candidate || geocoding} onClick={() => { void confirmPin(); }} className="min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">{geocoding ? 'Finding address...' : 'Confirm Pin & Fill Address'}</button>
            {locationError && candidate ? <button type="button" disabled={geocoding} onClick={usePinForManualAddress} className="min-h-11 rounded-xl border border-amber-400/30 px-4 text-sm font-medium text-amber-100 hover:bg-amber-500/10 disabled:opacity-50">Use Pin & Enter Address Manually</button> : null}
          </footer>
        </section>
      </div> : null}
      {!selected && locationError ? <p role="status" className="text-sm text-amber-200">{locationError}</p> : null}
      {!selected && !locationError ? <p className="text-xs leading-5 text-slate-400">A confirmed map location is required to save this address and continue checkout. Address fields can be reviewed and edited after the pin is confirmed.</p> : null}
      {selected ? <a href={mapUrl({ latitude, longitude: longitude! })} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-sm font-medium text-blue-300 underline">Preview selected location</a> : null}
    </section>
  );
}
