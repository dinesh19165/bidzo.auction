import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeOfferRequest, type OfferRequest } from '../src/api/offerApi';

test('normalizes offer startAt and endAt to India OffsetDateTime', () => {
  const request: OfferRequest = {
    name: 'Test offer',
    description: 'Test description',
    offerType: 'ALL_PRODUCTS',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startAt: '2026-09-17T17:34',
    endAt: '30-09-2026 16:46',
    priority: 0,
    active: true,
    productIds: [],
    categoryIds: [],
  };

  const normalized = normalizeOfferRequest(request);

  assert.equal(normalized.startAt, '2026-09-17T17:34:00+05:30');
  assert.equal(normalized.endAt, '2026-09-30T16:46:00+05:30');
});

test('preserves seconds while adding India offset to local datetime values', () => {
  const request = { startAt: '2026-09-17T17:34:15', endAt: '2026-09-30T16:46:45' } as OfferRequest;
  const normalized = normalizeOfferRequest(request);

  assert.equal(normalized.startAt, '2026-09-17T17:34:15+05:30');
  assert.equal(normalized.endAt, '2026-09-30T16:46:45+05:30');
});
