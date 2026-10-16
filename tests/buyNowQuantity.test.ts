import assert from 'node:assert/strict';
import test from 'node:test';
import { createBuyNowOrder } from '../src/api/productApi';

test('Buy Now sends quantity and address directly to its isolated order endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let requestUrl = '';
  let requestBody: Record<string, unknown> | null = null;
  let requestCount = 0;

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined, setItem: () => undefined },
  });
  globalThis.fetch = async (input, init) => {
    requestCount += 1;
    requestUrl = String(input);
    requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({ data: { id: 901, totalAmount: 150 } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const order = await createBuyNowOrder(42, 7, undefined, undefined, undefined, undefined, undefined, 3);
    assert.equal(order.id, 901);
    assert.equal(requestCount, 1);
    assert.match(requestUrl, /\/api\/products\/42\/buy-now$/);
    assert.equal(requestBody?.quantity, 3);
    assert.equal(requestBody?.addressId, 7);
    assert.equal('orderAmount' in (requestBody ?? {}), false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('Buy Now rejects invalid quantities before creating an order', async () => {
  await assert.rejects(() => createBuyNowOrder(42, 7, undefined, undefined, undefined, undefined, undefined, 0), /valid purchase quantity/);
});
