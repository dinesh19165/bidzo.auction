import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { updateScheduledDeliveryDate } from '../src/api/vendorOrderApi';
import { createDeliveryShare } from '../src/api/deliveryShareApi';
import { copyDeliveryShareLink, DeliveryInlineFeedback, DeliveryScheduleControl, DeliveryShareControl, runWithOrderRequestLock } from '../src/pages/extra/CustomerVendorExtras';

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

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
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator);
  } else {
    Reflect.deleteProperty(globalThis, 'navigator');
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

test('creates a share link only after a successful backend response', async () => {
  const token = 'a'.repeat(43);
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, removeItem: () => undefined },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://bidzo.example' } },
  });
  let requestBody = '';
  globalThis.fetch = async (_input, init) => {
    requestBody = String(init?.body);
    return new Response(JSON.stringify({
      success: true,
      data: { shareUrl: `/api/public/delivery-shares/view/${token}`, destinationCount: 1 },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const response = await createDeliveryShare({ scope: 'SINGLE', orderId: 7491, expiresInHours: 48 });
  assert.equal(response.shareUrl, `https://bidzo.example/delivery-share/${token}`);
  assert.deepEqual(JSON.parse(requestBody), { scope: 'SINGLE', orderId: 7491, expiresInHours: 48 });

  globalThis.fetch = async () => {
    throw new TypeError('Network unavailable');
  };
  await assert.rejects(createDeliveryShare({ scope: 'SINGLE', orderId: 7491, expiresInHours: 48 }), /Network unavailable/);

  globalThis.fetch = async () => new Response(JSON.stringify({ success: false, message: 'Sharing is not allowed.' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  await assert.rejects(createDeliveryShare({ scope: 'SINGLE', orderId: 7491, expiresInHours: 48 }), /Sharing is not allowed/);
});

test('reports clipboard copy failures without claiming the link was shared', async () => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { clipboard: { writeText: async () => { throw new Error('Clipboard denied'); } } },
  });
  await assert.rejects(copyDeliveryShareLink('https://bidzo.example/delivery-share/token'), /Clipboard denied/);

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {},
  });
  await assert.rejects(copyDeliveryShareLink('https://bidzo.example/delivery-share/token'), /Clipboard access is unavailable/);
});

test('uses the same inline feedback presentation for schedule and share actions', () => {
  const scheduleMarkup = renderToStaticMarkup(
    <DeliveryScheduleControl
      inputId="schedule-7491"
      selectedDate="2026-11-05"
      scheduledDate="2026-11-01"
      eligible
      loading={false}
      feedback={{ type: 'success', message: 'Delivery date updated successfully.' }}
      onDateChange={() => undefined}
      onSubmit={() => undefined}
    />,
  );
  const shareMarkup = renderToStaticMarkup(
    <DeliveryShareControl
      loading={false}
      feedback={{ type: 'success', message: 'Delivery link created successfully for order BIDZO-7491.' }}
      disabled={false}
      onShare={() => undefined}
    />,
  );
  const combinedMarkup = renderToStaticMarkup(
    <>
      <DeliveryScheduleControl
        inputId="schedule-7491"
        selectedDate="2026-11-05"
        scheduledDate="2026-11-01"
        eligible
        loading={false}
        feedback={{ type: 'success', message: 'Delivery date updated successfully for BIDZO-7491.' }}
        onDateChange={() => undefined}
        onSubmit={() => undefined}
      />
      <DeliveryShareControl
        loading={false}
        feedback={{ type: 'error', message: 'Unable to share delivery details.' }}
        disabled={false}
        onShare={() => undefined}
      />
    </>,
  );
  assert.match(shareMarkup, /Delivery link created successfully for order BIDZO-7491/);
  assert.match(shareMarkup, /lucide-circle-check/);
  assert.match(shareMarkup, /border-emerald-400\/20 bg-emerald-500\/10 text-emerald-200/);
  assert.match(scheduleMarkup, /border-emerald-400\/20 bg-emerald-500\/10 text-emerald-200/);
  assert.match(combinedMarkup, /Delivery date updated successfully for BIDZO-7491/);
  assert.match(combinedMarkup, /Unable to share delivery details/);

  const orderA = renderToStaticMarkup(
    <DeliveryShareControl loading onShare={() => undefined} disabled={false} feedback={{ type: 'success', message: 'Link created for BIDZO-7491.' }} />,
  );
  const orderB = renderToStaticMarkup(
    <DeliveryShareControl loading={false} onShare={() => undefined} disabled={false} feedback={{ type: 'error', message: 'Unable to share delivery details.' }} />,
  );
  assert.match(orderA, /Sharing…/);
  assert.match(orderA, /disabled=""/);
  assert.match(orderA, /Link created for BIDZO-7491/);
  assert.doesNotMatch(orderA, /Unable to share delivery details/);
  assert.match(orderB, /role="alert"/);
  assert.doesNotMatch(orderB, /Sharing…/);
});

test('prevents duplicate share submissions for the same order while allowing other orders', async () => {
  const locks = new Set<number>();
  let releaseFirst: (() => void) | undefined;
  let firstCalls = 0;
  const first = runWithOrderRequestLock(locks, 7491, async () => {
    firstCalls += 1;
    await new Promise<void>((resolve) => { releaseFirst = resolve; });
  });
  await runWithOrderRequestLock(locks, 7491, async () => {
    firstCalls += 1;
  });
  let secondOrderCalls = 0;
  await runWithOrderRequestLock(locks, 7492, async () => {
    secondOrderCalls += 1;
  });
  assert.equal(firstCalls, 1);
  assert.equal(secondOrderCalls, 1);
  releaseFirst?.();
  await first;
  assert.equal(locks.size, 0);
});
