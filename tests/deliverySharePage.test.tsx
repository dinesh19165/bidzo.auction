import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { DeliveryDestinationList, DestinationCard } from '../src/pages/DeliverySharePage';
import { DeliverySharePage } from '../src/pages/DeliverySharePage';
import type { PublicDeliveryDestination } from '../src/api/deliveryShareApi';
import { DELIVERY_SHARE_ROUTE_PATH } from '../src/utils/deliveryShareLink';

function renderDestination(status: string) {
  const destination: PublicDeliveryDestination = {
    orderId: 97,
    orderNumber: 'BIDZO-7111',
    orderStatus: status,
    productNames: ['Sample product'],
    locationVerificationRequired: false,
  };
  return renderToStaticMarkup(
    <DestinationCard
      destination={destination}
      index={0}
      multiple={false}
      statusLoading={false}
      onUpdateStatus={() => undefined}
    />,
  );
}

test('renders the Out for Delivery action inside a SHIPPED destination card', () => {
  const markup = renderDestination('SHIPPED');

  assert.match(markup, /<article/);
  assert.match(markup, /#97/);
  assert.match(markup, />Shipped<\/span>/);
  assert.match(markup, /<button[^>]*>Out for Delivery<\/button>/);
});

test('renders a separate customer-facing order number on every destination card', () => {
  const destinations: PublicDeliveryDestination[] = [
    { orderId: 97, orderNumber: 'BIDZO-7111', orderStatus: 'SHIPPED', productNames: ['First product'], locationVerificationRequired: false },
    { orderId: 91, orderNumber: 'BIDZO-7112', orderStatus: 'CONFIRMED', productNames: ['Second product'], locationVerificationRequired: false },
  ];
  const markup = renderToStaticMarkup(
    <DeliveryDestinationList destinations={destinations} updatingOrderId={null} statusErrors={{}} onUpdateStatus={() => undefined} />,
  );

  assert.equal((markup.match(/<article/g) ?? []).length, 2);
  assert.match(markup, /BIDZO-7111/);
  assert.match(markup, /Internal order ID: #97/);
  assert.match(markup, /First product/);
  assert.match(markup, /BIDZO-7112/);
  assert.match(markup, /Internal order ID: #91/);
  assert.match(markup, /Second product/);
});

test('renders the next delivery action only for valid statuses', () => {
  assert.match(renderDestination('OUT_FOR_DELIVERY'), /<button[^>]*>Mark Delivered<\/button>/);
  assert.doesNotMatch(renderDestination('CONFIRMED'), /<button/);
  assert.match(renderDestination('DELIVERED'), /Delivery completed/);
  assert.doesNotMatch(renderDestination('DELIVERED'), /<button/);
});

test('React delivery route loads when opened directly with a token path', () => {
  const markup = renderToStaticMarkup(
    <MemoryRouter initialEntries={['/delivery-share/test-token']}>
      <Routes>
        <Route path={DELIVERY_SHARE_ROUTE_PATH} element={<DeliverySharePage />} />
      </Routes>
    </MemoryRouter>,
  );

  assert.match(markup, /Loading delivery details/);
});

test('production web rewrite serves the React app for direct delivery-link navigation and refresh', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')) as {
    rewrites: Array<{ source: string; destination: string }>;
  };

  assert.ok(config.rewrites.some(({ source, destination }) => (
    source.includes('.*') && destination === '/index.html'
  )));
});
