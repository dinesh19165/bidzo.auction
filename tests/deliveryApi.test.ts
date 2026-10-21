import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { checkDeliveryAvailability } from '../src/api/deliveryApi';

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

function mockJsonResponse(body: unknown, status = 200) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined },
  });
  globalThis.fetch = async () => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('reads an available result from the standard success/data envelope', async () => {
  mockJsonResponse({
    success: true,
    data: {
      deliveryAvailable: true,
      distanceKm: 10.48,
      configuredRadiusKm: 100,
    },
    message: 'Delivery is available',
  });

  assert.deepEqual(await checkDeliveryAvailability({ productId: 123, pincode: '500001' }), {
    success: true,
    deliveryAvailable: true,
    distanceKm: 10.48,
    configuredRadiusKm: 100,
    message: 'Delivery is available',
  });
});

test('reads an unavailable result without treating it as an API failure', async () => {
  mockJsonResponse({
    success: true,
    data: { deliveryAvailable: false, distanceKm: 410, configuredRadiusKm: 100 },
    message: 'Delivery is outside the configured radius',
  });

  const result = await checkDeliveryAvailability({ productId: 456, pincode: '500001' });
  assert.equal(result.success, true);
  assert.equal(result.deliveryAvailable, false);
  assert.equal(result.distanceKm, 410);
  assert.equal(result.configuredRadiusKm, 100);
});

test('rejects failed backend envelopes and HTTP failures', async () => {
  mockJsonResponse({ success: false, data: null, message: 'PIN code could not be verified' });
  await assert.rejects(
    checkDeliveryAvailability({ productId: 123, pincode: '500001' }),
    /PIN code could not be verified/,
  );

  mockJsonResponse({ message: 'Temporarily unavailable' }, 503);
  await assert.rejects(
    checkDeliveryAvailability({ productId: 123, pincode: '500001' }),
    /Temporarily unavailable/,
  );
});
