import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { downloadInvoice, downloadInvoiceByOrderId } from '../src/api/invoiceApi';
import { InvoiceDocument } from '../src/components/invoices/InvoiceDocument';
import { VendorPackingSlipActions } from '../src/components/vendor/VendorPackingSlipActions';
import { printPdfBlobInWindow, runWithPdfActionLock } from '../src/utils/pdfFile';
import { downloadVendorPackingSlip } from '../src/api/vendorOrderApi';
import type { OrderResponseDto } from '../src/types';
import type { InvoiceResponse } from '../src/api/invoiceApi';

const originalFetch = globalThis.fetch;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

function mockBrowser() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => JSON.stringify({ token: 'test-token' }), removeItem: () => undefined },
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://bidzo.example' } },
  });
}

const pdfBytes = new TextEncoder().encode('%PDF-1.7\ninvoice');

test('downloads invoice PDF by ID as an authenticated blob and preserves its server filename', async () => {
  mockBrowser();
  const requests: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requests.push(url);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-token');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': "attachment; filename*=UTF-8''BIDZO-Invoice-12.pdf",
      },
    });
  };

  const result = await downloadInvoice(12);
  assert.equal(result.filename, 'BIDZO-Invoice-12.pdf');
  assert.equal(await result.blob.slice(0, 5).text(), '%PDF-');
  assert.equal(requests.length, 1);
  assert.match(requests[0], /\/api\/customer\/invoices\/12\/download$/);
});

test('downloads invoice PDF by order ID from its confirmed backend route', async () => {
  mockBrowser();
  let requestedPath = '';
  globalThis.fetch = async (input, init) => {
    requestedPath = String(input);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-token');
    return new Response(pdfBytes, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="order-7491-invoice.pdf"' },
    });
  };
  const result = await downloadInvoiceByOrderId(7491);
  assert.match(requestedPath, /\/api\/customer\/invoices\/order\/7491\/download$/);
  assert.equal(result.filename, 'order-7491-invoice.pdf');
});

test('surfaces failed download responses and rejects non-PDF content', async () => {
  mockBrowser();
  let returnError = false;
  globalThis.fetch = async () => {
    return returnError
      ? new Response(JSON.stringify({ message: 'Invoice is not ready yet.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
      : new Response('<html>not a pdf</html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
  };

  await assert.rejects(downloadInvoice(12), /valid PDF/);
  returnError = true;
  await assert.rejects(downloadInvoice(12), /Invoice is not ready yet/);
});

test('fetches a vendor-authorized packing slip without sending a vendor ID', async () => {
  mockBrowser();
  let requestedPath = '';
  let requestBody = '';
  globalThis.fetch = async (input, init) => {
    requestedPath = String(input);
    requestBody = String(init?.body ?? '');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-token');
    return new Response(pdfBytes, {
      status: 200,
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="BIDZO-7491-packing-slip.pdf"' },
    });
  };
  const result = await downloadVendorPackingSlip(7491);
  assert.match(requestedPath, /\/api\/vendor\/orders\/7491\/packing-slip$/);
  assert.equal(requestBody, '');
  assert.equal(result.filename, 'BIDZO-7491-packing-slip.pdf');
});

test('surfaces vendor packing-slip API and network failures', async () => {
  mockBrowser();
  globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Packing slip is not available yet.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
  await assert.rejects(downloadVendorPackingSlip(7491), /Packing slip is not available yet/);

  globalThis.fetch = async () => {
    throw new TypeError('Network unavailable');
  };
  await assert.rejects(downloadVendorPackingSlip(7491), /Network unavailable/);
});

test('renders vendor packing-slip actions on the order card', () => {
  const markup = renderToStaticMarkup(
    <article>
      <h2>BIDZO-7491</h2>
      <VendorPackingSlipActions orderId={7491} orderNumber="BIDZO-7491" />
    </article>,
  );
  assert.match(markup, /Download Packing Slip/);
  assert.match(markup, /Print Packing Slip/);
  assert.match(markup, /BIDZO-7491/);
});

test('keeps packing-slip actions available and independently rendered for multiple orders', () => {
  const markup = renderToStaticMarkup(
    <div>
      <article><h2>BIDZO-7491</h2><VendorPackingSlipActions orderId={7491} orderNumber="BIDZO-7491" /></article>
      <article><h2>BIDZO-7492</h2><VendorPackingSlipActions orderId={7492} orderNumber="BIDZO-7492" /></article>
    </div>,
  );
  assert.equal((markup.match(/Download Packing Slip/g) ?? []).length, 2);
  assert.equal((markup.match(/Print Packing Slip/g) ?? []).length, 2);
  assert.match(markup, /BIDZO-7491/);
  assert.match(markup, /BIDZO-7492/);
});

test('prevents duplicate PDF actions per action lock', async () => {
  const lock = { current: false };
  let release: (() => void) | undefined;
  let calls = 0;
  const first = runWithPdfActionLock(lock, async () => {
    calls += 1;
    await new Promise<void>((resolve) => { release = resolve; });
  });
  await runWithPdfActionLock(lock, async () => {
    calls += 1;
  });
  assert.equal(calls, 1);
  release?.();
  await first;
  assert.equal(lock.current, false);
});

test('opens the returned PDF in the print window and invokes its print action', () => {
  const timers: Array<() => void> = [];
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; } },
  });
  let loadHandler: (() => void) | undefined;
  let focused = false;
  let printed = false;
  const printWindow = {
    closed: false,
    location: { href: '' },
    addEventListener: (_type: string, callback: () => void) => { loadHandler = callback; },
    focus: () => { focused = true; },
    print: () => { printed = true; },
  } as unknown as Window;
  printPdfBlobInWindow(printWindow, new Blob([pdfBytes], { type: 'application/pdf' }));
  assert.match(printWindow.location.href, /^blob:/);
  loadHandler?.();
  timers[0]();
  assert.equal(focused, true);
  assert.equal(printed, true);
  timers[1]();
});

test('prints a complete invoice document and applies print-only A4 layout', () => {
  const order: OrderResponseDto = {
    id: 12,
    orderNumber: 'BIDZO-7491',
    orderDate: '2026-10-26',
    orderStatus: 'CONFIRMED',
    totalAmount: 950,
    customerId: 7,
    deliveryAddress: {
      fullName: 'Customer Name',
      addressLine1: '12 Market Road',
      addressLine2: 'Central locality',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      country: 'India',
      phone: '9876543210',
    },
    items: [{
      id: 3,
      orderId: 12,
      productId: 41,
      productName: 'Market sample',
      quantity: 2,
      price: 500,
    }],
  };
  const invoice: InvoiceResponse = {
    id: 8,
    orderId: 12,
    invoiceNumber: 'INV-2026-0008',
    invoiceDate: '2026-10-26',
    totalAmount: 950,
    taxAmount: 50,
    discountAmount: 100,
    status: 'PAID',
    createdAt: '2026-10-26',
  };
  const markup = renderToStaticMarkup(
    <InvoiceDocument order={order} invoice={invoice} paymentStatus="Paid" onDownload={async () => ({ blob: new Blob(), filename: 'invoice.pdf' })} />,
  );
  assert.match(markup, /class="invoice-print-area/);
  assert.match(markup, /BIDZO-Invoice|BIDZO/);
  assert.match(markup, /INV-2026-0008/);
  assert.match(markup, /BIDZO-7491/);
  assert.match(markup, /Customer Name/);
  assert.match(markup, /12 Market Road/);
  assert.match(markup, /Central locality/);
  assert.match(markup, /Pune/);
  assert.match(markup, /Maharashtra/);
  assert.match(markup, /411001 India/);
  assert.match(markup, /9876543210/);
  assert.match(markup, /Market sample/);
  assert.match(markup, />2<\/td>/);
  assert.match(markup, /Discount/);
  assert.match(markup, /Tax/);
  assert.doesNotMatch(markup, /Shipping/);
  assert.match(markup, /Print Invoice/);

  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.match(css, /@page invoice\s*\{\s*size:\s*A4/);
  assert.match(css, /body \* \{\s*visibility:\s*hidden/);
  assert.match(css, /\.invoice-print-area,\s*\.invoice-print-area \*/);
  assert.match(css, /\.invoice-actions\s*\{\s*display:\s*none/);
});
