import { useEffect, useState } from 'react';

export interface CustomerLocation {
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  displayName: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  missingAddressFields: string[];
}

const STORAGE_KEY = 'bidzo_customer_location';
const RECENT_STORAGE_KEY = 'bidzo_recent_customer_locations';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
export const CUSTOMER_LOCATION_CHANGED_EVENT = 'bidzo:customer-location-changed';

function firstAddressValue(...values: Array<string | undefined>): string {
  return values.find((value) => value?.trim()) || '';
}

function normalizeLocation(address: Record<string, string | undefined>, latitude: number, longitude: number, displayName?: string): CustomerLocation {
  const city = firstAddressValue(address.city, address.town, address.village, address.municipality, address.hamlet, address.county);
  const state = firstAddressValue(address.state, address.state_district);
  const pincode = firstAddressValue(address.postcode);
  const road = firstAddressValue(address.road, address.pedestrian, address.residential, address.footway, address.path);
  const houseNumber = firstAddressValue(address.house_number);
  const locality = firstAddressValue(address.neighbourhood, address.locality, address.suburb, address.quarter, address.village, address.hamlet);
  const addressLine1 = [houseNumber, road].filter(Boolean).join(' ') || firstAddressValue(address.building, address.amenity, houseNumber);
  const missingAddressFields = [
    !addressLine1 && 'House / street address',
    !locality && 'Locality / area',
    !city && 'City',
    !state && 'State',
    !pincode && 'PIN code',
    !address.country?.trim() && 'Country',
  ].filter((field): field is string => Boolean(field));
  return {
    city,
    state,
    pincode,
    latitude,
    longitude,
    displayName: displayName || [city, state, pincode].filter(Boolean).join(', '),
    addressLine1,
    addressLine2: locality,
    country: firstAddressValue(address.country),
    missingAddressFields,
  };
}

async function geocodeRequest(url: string): Promise<unknown> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Unable to search locations right now.');
  return response.json();
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CustomerLocation> {
  const params = new URLSearchParams({ format: 'jsonv2', lat: String(latitude), lon: String(longitude), addressdetails: '1' });
  const result = await geocodeRequest(`${NOMINATIM_URL}/reverse?${params.toString()}`) as { address?: Record<string, string | undefined>; display_name?: string };
  if (!result?.address) throw new Error('We could not identify that location. Please retry or enter the address manually.');
  return normalizeLocation(result.address, latitude, longitude, result.display_name);
}

export async function searchCustomerLocations(query: string): Promise<CustomerLocation[]> {
  const params = new URLSearchParams({ format: 'jsonv2', q: query, countrycodes: 'in', addressdetails: '1', limit: '5' });
  const results = await geocodeRequest(`${NOMINATIM_URL}/search?${params.toString()}`);
  return (Array.isArray(results) ? results : []).map((item) => {
    const result = item as { address?: Record<string, string | undefined>; lat?: string; lon?: string; display_name?: string };
    return normalizeLocation(
    result.address || {},
    Number(result.lat),
    Number(result.lon),
    result.display_name,
  ); }).filter((location) => location.city || location.state || location.pincode);
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
