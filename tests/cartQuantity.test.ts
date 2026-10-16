import assert from 'node:assert/strict';
import test from 'node:test';
import { addOrUpdateCartItem, getNextCartQuantity, type CartItemResponse } from '../src/api/cartApi';

const cartItem: CartItemResponse = {
  id: 12,
  productId: 42,
  productName: 'Test product',
  unitPrice: 50,
  quantity: 2,
  subtotal: 100,
  availableQuantity: 5,
};

test('adding a product to an empty cart uses the requested quantity', () => {
  assert.equal(getNextCartQuantity(undefined, 3), 3);
});

test('adding a product already in the cart increments its quantity', () => {
  assert.equal(getNextCartQuantity(cartItem, 2), 4);
});

test('cart addition rejects a quantity that exceeds available stock', () => {
  assert.throws(() => getNextCartQuantity(cartItem, 4), /exceeds available stock/);
});

test('cart addition rejects non-positive or fractional quantities', () => {
  assert.throws(() => getNextCartQuantity(undefined, 0), /valid quantity/);
  assert.throws(() => getNextCartQuantity(cartItem, 1.5), /valid quantity/);
});

test('Add to Cart posts a product when the cart is empty and returns the refreshed cart', async () => {
  const restore = mockCartFetch([
    { data: { items: [], total: 0 } },
    { success: true },
    { data: { items: [{ ...cartItem, quantity: 3, subtotal: 150 }], total: 150 } },
  ]);
  try {
    const updatedCart = await addOrUpdateCartItem(42, 3);
    assert.equal(updatedCart.items.length, 1);
    assert.equal(updatedCart.items[0].quantity, 3);
    assert.equal(updatedCart.total, 150);
    assert.equal(mockedCartCalls[1].url.endsWith('/api/cart/items'), true);
    assert.deepEqual(JSON.parse(String(mockedCartCalls[1].init?.body)), { productId: 42, quantity: 3 });
  } finally {
    restore();
  }
});

test('Add to Cart updates an existing product line instead of posting a duplicate', async () => {
  const restore = mockCartFetch([
    {
      data: {
        items: [{
          id: cartItem.id,
          quantity: cartItem.quantity,
          product: {
            id: cartItem.productId,
            name: cartItem.productName,
            price: cartItem.unitPrice,
            imageUrl: '/product-image.jpg',
            seller: { name: 'Seller name' },
            availableQuantity: cartItem.availableQuantity,
          },
          subtotal: cartItem.subtotal,
        }],
        total: 100,
      },
    },
    { success: true },
    {
      data: {
        items: [{
          id: cartItem.id,
          quantity: 4,
          product: {
            id: cartItem.productId,
            name: cartItem.productName,
            price: cartItem.unitPrice,
            imageUrl: '/product-image.jpg',
            seller: { name: 'Seller name' },
            availableQuantity: cartItem.availableQuantity,
          },
          subtotal: 200,
        }],
        total: 200,
      },
    },
  ]);
  try {
    const updatedCart = await addOrUpdateCartItem(42, 2);
    assert.equal(updatedCart.items.length, 1);
    assert.equal(updatedCart.items[0].quantity, 4);
    assert.equal(updatedCart.items[0].subtotal, 200);
    assert.equal(updatedCart.items[0].productImageUrl, '/product-image.jpg');
    assert.equal(updatedCart.items[0].seller, 'Seller name');
    assert.equal(mockedCartCalls[1].url.endsWith('/api/cart/items/12'), true);
    assert.deepEqual(JSON.parse(String(mockedCartCalls[1].init?.body)), { quantity: 4 });
  } finally {
    restore();
  }
});

type MockCartCall = { url: string; init?: RequestInit };
let mockedCartCalls: MockCartCall[] = [];

function mockCartFetch(responses: unknown[]) {
  const originalFetch = globalThis.fetch;
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  mockedCartCalls = [];
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined, setItem: () => undefined },
  });
  globalThis.fetch = async (input, init) => {
    mockedCartCalls.push({ url: String(input), init });
    const body = responses.shift();
    if (body === undefined) throw new Error('Unexpected cart API request');
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  return () => {
    globalThis.fetch = originalFetch;
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  };
}
