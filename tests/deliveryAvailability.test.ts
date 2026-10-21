import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkDeliveryAvailability,
  configureDeliveryAvailabilityAdapter,
  mockDeliveryAvailabilityAdapter,
  type DeliveryAvailabilityAdapter,
} from '../src/api/deliveryAvailabilityApi';
import { validateIndianPincode } from '../src/utils/indianPincode';

test('validates Indian PIN codes before calling the availability adapter', async () => {
  assert.equal(validateIndianPincode(''), 'Enter a PIN code.');
  assert.equal(validateIndianPincode('12345'), 'PIN code must be exactly 6 digits.');
  assert.equal(validateIndianPincode('12A456'), 'PIN code must contain digits only.');
  assert.equal(validateIndianPincode('012345'), 'Enter a valid Indian PIN code starting with 1–9.');
  assert.equal(validateIndianPincode('560001'), null);

  await assert.rejects(checkDeliveryAvailability('12345'), /exactly 6 digits/);
});

test('returns availability and estimated delivery only from the configured adapter', async () => {
  const adapter: DeliveryAvailabilityAdapter = async (pincode) => ({
    available: pincode === '560001',
    estimatedDelivery: pincode === '560001' ? 'Provided by the adapter' : undefined,
  });
  const restore = configureDeliveryAvailabilityAdapter(adapter);

  try {
    assert.deepEqual(await checkDeliveryAvailability('560001'), {
      available: true,
      estimatedDelivery: 'Provided by the adapter',
    });
    assert.deepEqual(await checkDeliveryAvailability('110001'), {
      available: false,
      estimatedDelivery: undefined,
    });
  } finally {
    restore();
  }
});

test('default mock adapter explicitly reports that serviceability is not configured', async () => {
  const restore = configureDeliveryAvailabilityAdapter(mockDeliveryAvailabilityAdapter);
  try {
    await assert.rejects(checkDeliveryAvailability('560001'), /not configured yet/);
  } finally {
    restore();
  }
});

test('surfaces adapter failures without converting them into availability results', async () => {
  const restore = configureDeliveryAvailabilityAdapter(async () => {
    throw new Error('Service unavailable');
  });
  try {
    await assert.rejects(checkDeliveryAvailability('560001'), /Service unavailable/);
  } finally {
    restore();
  }
});
