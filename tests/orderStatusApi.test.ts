import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getPublicDeliveryShare, updatePublicDeliveryOrderStatus } from '../src/api/deliveryShareApi';
import { updateVendorOrderStatus } from '../src/api/vendorOrderApi';
import { createDeliveryShare } from '../src/api/deliveryShareApi';
import { getNextDeliveryPersonStatus } from '../src/utils/deliveryOrderStatus';
import { toFrontendDeliveryShareUrl } from '../src/utils/deliveryShareLink';

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }
  if (originalWindow) {
    Object.defineProperty(globalThis, 'window', originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

function mockJsonResponse(body: unknown, capture?: (input: RequestInfo | URL, init?: RequestInit) => void, status = 200) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => key === 'bidzo_user' ? JSON.stringify({ token: 'test-session-token' }) : null,
      removeItem: () => undefined,
    },
  });
  globalThis.fetch = async (input, init) => {
    capture?.(input, init);
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

test('updates vendor order status using the verified PUT payload', async () => {
  let request: { input?: RequestInfo | URL; init?: RequestInit } = {};
  mockJsonResponse({ success: true }, (input, init) => {
    request = { input, init };
  });

  test('converts backend-generated share URLs to the frontend route and preserves the token', () => {
    const token = 'A'.repeat(43);
    assert.equal(
      toFrontendDeliveryShareUrl(`http://localhost:8080/api/public/delivery-shares/view/${token}`, 'http://localhost:5173'),
      `http://localhost:5173/delivery-share/${token}`,
    );
    assert.equal(
      toFrontendDeliveryShareUrl(`/api/public/delivery-shares/view/${token}`, 'https://bidzo.auction'),
      `https://bidzo.auction/delivery-share/${token}`,
    );
  });

  test('newly created delivery shares return the React route URL for copy/share actions', async () => {
    const token = 'B'.repeat(43);
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { location: { origin: 'http://localhost:5173' } },
    });
    mockJsonResponse({
      success: true,
      data: {
        shareUrl: `http://localhost:8080/api/public/delivery-shares/view/${token}`,
        id: 22,
      },
    });

    const share = await createDeliveryShare({ scope: 'SINGLE', orderId: 97, expiresInHours: 48 });
    assert.equal(share.shareUrl, `http://localhost:5173/delivery-share/${token}`);
  });

  test('rejects an unrecognized backend delivery share URL rather than copying it', () => {
    assert.throws(
      () => toFrontendDeliveryShareUrl('https://api.bidzo.auction/unexpected/path/not-a-token', 'https://bidzo.auction'),
      /recognized delivery token URL/,
    );
  });

  await updateVendorOrderStatus(123, 'PACKING');
  assert.equal(new URL(String(request.input)).pathname, '/api/vendor/orders/123/status');
  assert.equal(request.init?.method, 'PUT');
  assert.deepEqual(JSON.parse(String(request.init?.body)), { status: 'PACKING' });
});

test('updates public delivery status with the token and does not require authentication', async () => {
  let request: { input?: RequestInfo | URL; init?: RequestInit } = {};
  mockJsonResponse({ success: true, data: { orderId: 456, orderStatus: 'OUT_FOR_DELIVERY' } }, (input, init) => {
    request = { input, init };
  });

  assert.deepEqual(
    await updatePublicDeliveryOrderStatus('share/token', 456, 'OUT_FOR_DELIVERY'),
    { orderId: 456, orderStatus: 'OUT_FOR_DELIVERY' },
  );
  assert.equal(new URL(String(request.input)).pathname, '/api/public/delivery-shares/share%2Ftoken/orders/456/status');
  assert.equal(request.init?.method, 'PUT');
  assert.deepEqual(JSON.parse(String(request.init?.body)), { status: 'OUT_FOR_DELIVERY' });
  assert.equal(new Headers(request.init?.headers).has('Authorization'), false);
});

test('reads order metadata and the backend map fields from each public destination', async () => {
  mockJsonResponse({
    success: true,
    data: {
      scope: 'SINGLE',
      destinations: [{
        orderId: 456,
        orderNumber: 'BIDZO-7111',
        orderStatus: 'SHIPPED',
        productNames: ['Blue shirt', 'Canvas bag'],
        addressLine1: '1 Example Street',
        locationVerificationRequired: true,
        mapUrl: 'https://maps.example/directions',
      }],
    },
  });

  const share = await getPublicDeliveryShare('valid-token');
  assert.equal(share.destinations[0].orderId, 456);
  assert.equal(share.destinations[0].orderNumber, 'BIDZO-7111');
  assert.equal(share.destinations[0].orderStatus, 'SHIPPED');
  assert.deepEqual(share.destinations[0].productNames, ['Blue shirt', 'Canvas bag']);
  assert.equal(share.destinations[0].locationVerificationRequired, true);
  assert.equal(share.destinations[0].mapUrl, 'https://maps.example/directions');
});

test('does not silently accept an old public response without per-destination order fields', async () => {
  mockJsonResponse({
    success: true,
    data: {
      scope: 'SINGLE',
      destinations: [{ addressLine1: '1 Example Street' }],
    },
  });

  await assert.rejects(getPublicDeliveryShare('valid-token'), /missing order details.*API may need to be updated/i);
});

test('surfaces an invalid delivery status transition from the backend', async () => {
  mockJsonResponse({ message: 'Invalid order status transition' }, undefined, 400);

  await assert.rejects(
    updatePublicDeliveryOrderStatus('valid-token', 456, 'DELIVERED'),
    /Invalid order status transition/,
  );
});

test('maps delivery order statuses to the exact next public status action', () => {
  assert.equal(getNextDeliveryPersonStatus('SHIPPED'), 'OUT_FOR_DELIVERY');
  assert.equal(getNextDeliveryPersonStatus('OUT_FOR_DELIVERY'), 'DELIVERED');
  assert.equal(getNextDeliveryPersonStatus('DELIVERED'), null);
  assert.equal(getNextDeliveryPersonStatus(' shipped '), 'OUT_FOR_DELIVERY');
});
