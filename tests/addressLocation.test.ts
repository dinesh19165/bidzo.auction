import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { buildAddressPayload } from '../src/api/addressApi';
import { reverseGeocode, searchCustomerLocations, getVerifiedPostalCode } from '../src/utils/customerLocation';
import { mergeCheckoutAddressAutofill } from '../src/components/checkout/DeliveryAddressSelector';

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

test('autofills only a valid postal code explicitly marked as not requiring confirmation', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    postalCode: '411001',
    postalCodeRequiresConfirmation: false,
    providerPostalCode: '999999',
    postalCodeCandidate: '888888',
    address: { postcode: '777777', city: 'Pune', state: 'Maharashtra', country: 'India' },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const place = await reverseGeocode(form.latitude, form.longitude);
  assert.equal(place.postalCode, '411001');
  assert.equal(getVerifiedPostalCode(place.postalCode, place.postalCodeRequiresConfirmation), '411001');
  assert.equal(place.pincode, '777777');
});

test('does not autofill an unverified postal code or provider/candidate alternatives', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    postalCode: '411001',
    postalCodeRequiresConfirmation: true,
    providerPostalCode: '999999',
    postalCodeCandidate: '888888',
    address: { postcode: '777777', city: 'Pune', state: 'Maharashtra', country: 'India' },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const place = await reverseGeocode(form.latitude, form.longitude);
  assert.equal(place.postalCode, '');
  assert.equal(getVerifiedPostalCode(place.postalCode, place.postalCodeRequiresConfirmation), '');
  assert.equal(getVerifiedPostalCode('411001', undefined), '');
  assert.equal(getVerifiedPostalCode('41100', false), '');
});

test('keeps a manually entered checkout PIN when a later location lookup autofills other fields', () => {
  const current = {
    label: 'Home',
    fullName: 'Customer Name',
    phone: '9876543210',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    latitude: form.latitude,
    longitude: form.longitude,
    isDefault: true,
  };
  const unverifiedLookup = mergeCheckoutAddressAutofill(current, { postalCode: '' }, false);
  assert.equal(unverifiedLookup.postalCode, '');

  const manuallyEntered = { ...unverifiedLookup, postalCode: '411001' };
  const laterLookup = mergeCheckoutAddressAutofill(manuallyEntered, {
    addressLine1: '12 Market Road',
    city: 'Pune',
    postalCode: '999999',
  }, true);
  assert.equal(laterLookup.postalCode, '411001');
  assert.equal(laterLookup.city, 'Pune');
});

test('reverse geocoding uses the most specific available locality and preserves regional-language values', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    address: {
      road: 'MDR070',
      city: 'రామరాజులంక',
      state: 'Andhra Pradesh',
      postcode: '533253',
      country: 'India',
      suburb: 'Broader area',
      neighbourhood: 'Local neighbourhood',
      locality: 'Local place',
    },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const place = await reverseGeocode(form.latitude, form.longitude);

  assert.deepEqual(
    [place.addressLine1, place.addressLine2, place.city, place.state, place.pincode, place.country],
    ['MDR070', 'Local neighbourhood', 'రామరాజులంక', 'Andhra Pradesh', '533253', 'India'],
  );
  const payload = buildAddressPayload({
    ...form,
    addressLine1: place.addressLine1,
    addressLine2: place.addressLine2,
    city: place.city,
    state: place.state,
    postalCode: place.pincode,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  });
  assert.equal(typeof payload, 'object');
  if (typeof payload === 'string') return;
  assert.deepEqual(
    [payload.addressLine1, payload.addressLine2, payload.city, payload.state, payload.postalCode, payload.country, payload.latitude, payload.longitude],
    ['MDR070', 'Local neighbourhood', 'రామరాజులంక', 'Andhra Pradesh', '533253', 'India', form.latitude, form.longitude],
  );
});

test('reverse geocoding falls back to village or hamlet for locality and reports fields absent from Nominatim', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    address: { road: 'MDR070', village: 'Village area', country: 'India' },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const villagePlace = await reverseGeocode(form.latitude, form.longitude);
  assert.equal(villagePlace.addressLine2, 'Village area');
  assert.equal(villagePlace.city, 'Village area');
  assert.deepEqual(villagePlace.missingAddressFields, ['State', 'PIN code']);

  globalThis.fetch = async () => new Response(JSON.stringify({
    address: { hamlet: 'Hamlet area', town: 'Nearby town' },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  const hamletPlace = await reverseGeocode(form.latitude, form.longitude);
  assert.equal(hamletPlace.addressLine2, 'Hamlet area');
  assert.equal(hamletPlace.city, 'Nearby town');
  assert.deepEqual(hamletPlace.missingAddressFields, ['House / street address', 'State', 'PIN code', 'Country']);
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
