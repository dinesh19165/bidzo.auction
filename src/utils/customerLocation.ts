import { useEffect, useState } from 'react';

export interface CustomerLocation {
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

const STORAGE_KEY = 'bidzo_customer_location';
const RECENT_STORAGE_KEY = 'bidzo_recent_customer_locations';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
export const CUSTOMER_LOCATION_CHANGED_EVENT = 'bidzo:customer-location-changed';

function normalizeLocation(address: Record<string, string | undefined>, latitude: number, longitude: number, displayName?: string): CustomerLocation {
  const city = address.city || address.town || address.village || address.municipality || address.county || '';
  const state = address.state || address.state_district || '';
  const pincode = address.postcode || '';
  return {
    city,
    state,
    pincode,
    latitude,
    longitude,
    displayName: displayName || [city, state, pincode].filter(Boolean).join(', '),
  };
}

async function geocodeRequest(url: string): Promise<any> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Unable to search locations right now.');
  return response.json();
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CustomerLocation> {
  const params = new URLSearchParams({ format: 'jsonv2', lat: String(latitude), lon: String(longitude), addressdetails: '1' });
  const result = await geocodeRequest(`${NOMINATIM_URL}/reverse?${params.toString()}`);
  if (!result?.address) throw new Error('We could not identify that location. Please search manually.');
  return normalizeLocation(result.address, latitude, longitude, result.display_name);
}

export async function searchCustomerLocations(query: string): Promise<CustomerLocation[]> {
  const params = new URLSearchParams({ format: 'jsonv2', q: query, countrycodes: 'in', addressdetails: '1', limit: '5' });
  const results = await geocodeRequest(`${NOMINATIM_URL}/search?${params.toString()}`);
  return (Array.isArray(results) ? results : []).map((result) => normalizeLocation(
    result.address || {},
    Number(result.lat),
    Number(result.lon),
    result.display_name,
  )).filter((location) => location.city || location.state || location.pincode);
}

export function getStoredCustomerLocation(): CustomerLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as CustomerLocation : null;
  } catch {
    return null;
  }
}

export function getRecentCustomerLocations(): CustomerLocation[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) as CustomerLocation[] : [];
  } catch {
    return [];
  }
}

export function useCustomerLocation(): CustomerLocation | null {
  const [location, setLocation] = useState<CustomerLocation | null>(() => getStoredCustomerLocation());

  useEffect(() => {
    const handleLocationChange = () => setLocation(getStoredCustomerLocation());
    window.addEventListener(CUSTOMER_LOCATION_CHANGED_EVENT, handleLocationChange);
    window.addEventListener('storage', handleLocationChange);
    return () => {
      window.removeEventListener(CUSTOMER_LOCATION_CHANGED_EVENT, handleLocationChange);
      window.removeEventListener('storage', handleLocationChange);
    };
  }, []);

  return location;
}

export function saveCustomerLocation(location: CustomerLocation): void {
  const recent = [location, ...getRecentCustomerLocations().filter((item) => item.displayName !== location.displayName)].slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
  window.dispatchEvent(new CustomEvent<CustomerLocation>(CUSTOMER_LOCATION_CHANGED_EVENT, { detail: location }));
}

export function clearCustomerLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CUSTOMER_LOCATION_CHANGED_EVENT, { detail: null }));
}
