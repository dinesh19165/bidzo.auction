import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buildAddressPayload } from '../src/api/addressApi';
import { reverseGeocode, searchCustomerLocations } from '../src/utils/customerLocation';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const form = {
  fullName: 'Customer Name',
  phone: '9876543210',
  addressLine1: '12 Market Road',
  addressLine2: 'Central locality',
  city: 'Pune',
  state: 'Maharashtra',
  postalCode: '411001',
  country: 'India',
  latitude: 18.5204,
  longitude: 73.8567,
};

test('address payload requires a selected map location and preserves the entered customer details', () => {
  const withoutLocation = buildAddressPayload({ ...form, latitude: null, longitude: null });
  assert.match(typeof withoutLocation === 'string' ? withoutLocation : '', /delivery location/i);

  const payload = buildAddressPayload(form);
  assert.equal(typeof payload, 'object');
  if (typeof payload === 'string') return;
  assert.equal(payload.fullName, form.fullName);
  assert.equal(payload.phone, form.phone);
  assert.equal(payload.latitude, form.latitude);
  assert.equal(payload.longitude, form.longitude);
  assert.equal(payload.addressLine1, form.addressLine1);
  assert.equal(payload.addressLine2, form.addressLine2);
});

test('reverse geocoding returns address fields for the exact selected coordinates', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, 'nominatim.openstreetmap.org');
    assert.equal(url.searchParams.get('lat'), String(form.latitude));
    assert.equal(url.searchParams.get('lon'), String(form.longitude));
    return new Response(JSON.stringify({
      display_name: '12 Market Road, Central locality, Pune, Maharashtra, India',
      address: {
        house_number: '12',
        road: 'Market Road',
        suburb: 'Central locality',
        city: 'Pune',
        state: 'Maharashtra',
        postcode: '411001',
        country: 'India',
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const place = await reverseGeocode(form.latitude, form.longitude);
  assert.deepEqual(
    [place.addressLine1, place.addressLine2, place.city, place.state, place.pincode, place.country],
    ['12 Market Road', 'Central locality', 'Pune', 'Maharashtra', '411001', 'India'],
  );
  assert.equal(place.latitude, form.latitude);
  assert.equal(place.longitude, form.longitude);
});

test('place search returns selectable coordinates and readable results', async () => {
  globalThis.fetch = async (input) => {
    const url = new URL(String(input));
    assert.equal(url.hostname, 'nominatim.openstreetmap.org');
    assert.equal(url.searchParams.get('q'), 'Market Road, Pune');
    return new Response(JSON.stringify([{
      lat: String(form.latitude),
      lon: String(form.longitude),
      display_name: 'Market Road, Pune, Maharashtra, India',
      address: { road: 'Market Road', city: 'Pune', state: 'Maharashtra', postcode: '411001', country: 'India' },
    }]), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const results = await searchCustomerLocations('Market Road, Pune');
  assert.equal(results.length, 1);
  assert.equal(results[0].latitude, form.latitude);
  assert.equal(results[0].longitude, form.longitude);
  assert.equal(results[0].displayName, 'Market Road, Pune, Maharashtra, India');
});
