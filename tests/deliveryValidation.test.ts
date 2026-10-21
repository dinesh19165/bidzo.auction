import assert from 'node:assert/strict';
import test from 'node:test';
import { validateDeliveryPincode, validateDeliveryRadius } from '../src/utils/deliveryValidation';

test('accepts only six-digit Indian PIN codes beginning with a non-zero digit', () => {
  assert.equal(validateDeliveryPincode('500001'), true);
  assert.equal(validateDeliveryPincode(''), false);
  assert.equal(validateDeliveryPincode('050001'), false);
  assert.equal(validateDeliveryPincode('50001'), false);
  assert.equal(validateDeliveryPincode('50A001'), false);
});

test('validates delivery radius range and precision', () => {
  assert.equal(validateDeliveryRadius('400'), null);
  assert.equal(validateDeliveryRadius('0.01'), null);
  assert.equal(validateDeliveryRadius('5000'), null);
  assert.match(validateDeliveryRadius('0') ?? '', /greater than 0/);
  assert.match(validateDeliveryRadius('5000.01') ?? '', /no more than 5,000/);
  assert.match(validateDeliveryRadius('1.234') ?? '', /two decimal places/);
});
