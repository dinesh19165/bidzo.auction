import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { updateScheduledDeliveryDate } from '../src/api/vendorOrderApi';
import { DeliveryScheduleControl } from '../src/pages/extra/CustomerVendorExtras';

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

function renderControl({
  inputId,
  loading = false,
  feedback,
}: {
  inputId: string;
  loading?: boolean;
  feedback?: { type: 'success' | 'error'; message: string };
}) {
  return renderToStaticMarkup(
    <DeliveryScheduleControl
      inputId={inputId}
      selectedDate="2026-11-05"
      scheduledDate="2026-11-01"
      eligible
      loading={loading}
      feedback={feedback}
      onDateChange={() => undefined}
      onSubmit={() => undefined}
    />,
  );
}

test('confirms a schedule update only after a successful API response', async () => {
  let requestBody = '';
  let requestMethod = '';
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined },
  });
  globalThis.fetch = async (_input, init) => {
    requestBody = String(init?.body);
    requestMethod = String(init?.method);
    return new Response(JSON.stringify({ success: true, message: 'Updated' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  await updateScheduledDeliveryDate(6531, '2026-11-05');
  assert.equal(requestMethod, 'PUT');
  assert.deepEqual(JSON.parse(requestBody), { scheduledDeliveryDate: '2026-11-05' });
});

test('rejects backend and HTTP failures instead of treating them as successful updates', async () => {
  mockJsonResponse({ success: false, message: 'This order cannot be scheduled.' });
  await assert.rejects(
    updateScheduledDeliveryDate(6531, '2026-11-05'),
    /This order cannot be scheduled/,
  );

  mockJsonResponse({ message: 'Unavailable' }, 503);
  await assert.rejects(
    updateScheduledDeliveryDate(6531, '2026-11-05'),
    /Unavailable/,
  );

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined },
  });
  globalThis.fetch = async () => {
    throw new DOMException('Request timed out', 'TimeoutError');
  };
  await assert.rejects(updateScheduledDeliveryDate(6531, '2026-11-05'));
});

test('shows a loading indicator and disables the schedule button while updating', () => {
  const markup = renderControl({ inputId: 'schedule-6531', loading: true });
  assert.match(markup, /Updating…/);
  assert.match(markup, /<button[^>]*disabled=""/);
  assert.match(markup, /animate-spin/);
});

test('shows success feedback inline and keeps distinct loading and error states per order', () => {
  const success = renderControl({
    inputId: 'schedule-6531',
    feedback: { type: 'success', message: 'Delivery date updated successfully for order BIDZO-6531.' },
  });
  assert.match(success, /role="status"/);
  assert.match(success, /Delivery date updated successfully for order BIDZO-6531/);

  const firstOrder = renderControl({ inputId: 'schedule-6531', loading: true });
  const secondOrder = renderControl({
    inputId: 'schedule-6532',
    feedback: { type: 'error', message: 'Unable to update the delivery date. Please try again.' },
  });
  assert.match(firstOrder, /Updating…/);
  assert.doesNotMatch(firstOrder, /Unable to update the delivery date/);
  assert.doesNotMatch(secondOrder, /Updating…/);
  assert.match(secondOrder, /role="alert"/);
  assert.match(secondOrder, /Unable to update the delivery date/);
});
