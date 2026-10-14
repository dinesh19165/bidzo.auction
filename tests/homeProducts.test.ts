import assert from 'node:assert/strict';
import test from 'node:test';
import { mapHomeProductListing } from '../src/api/homeApi';
import { buildHomeProductSections } from '../src/utils/homeProducts';

function product(id: number, sellingType = 'DIRECT_BUY') {
  return { id, name: `Product ${id}`, sellingType };
}

test('maps marketplace product listings into the homepage product shape', () => {
  const mapped = mapHomeProductListing({
    id: 42,
    type: 'PRODUCT',
    title: 'Desk',
    price: 120,
    image: '/desk.jpg',
    category: { id: 8, name: 'Furniture' },
    vendor: { id: 12, name: 'Seller' },
    availableQuantity: 3,
  });

  assert.equal(mapped.id, 42);
  assert.equal(mapped.name, 'Desk');
  assert.equal(mapped.sellingType, 'DIRECT_BUY');
  assert.equal(mapped.categoryId, 8);
  assert.equal(mapped.categoryName, 'Furniture');
  assert.equal(mapped.vendorId, 12);
  assert.equal(mapped.vendorName, 'Seller');
  assert.equal(mapped.imageUrl, '/desk.jpg');
  assert.equal(mapped.availableQuantity, 3);
});

test('selects up to five unique Direct Buy products per section without overlap', () => {
  const featuredCandidates = [
    product(20, 'AUCTION'),
    product(1),
    product(1),
    product(2),
    product(3),
    product(4),
    product(5),
    product(6),
  ];
  const recentCandidates = [
    product(1),
    product(2),
    product(7),
    product(8),
    product(9),
    product(10),
    product(11),
  ];

  const sections = buildHomeProductSections(featuredCandidates, recentCandidates);

  assert.deepEqual(sections.featuredProducts.map(({ id }) => id), [1, 2, 3, 4, 5]);
  assert.deepEqual(sections.recentProducts.map(({ id }) => id), [7, 8, 9, 10, 11]);
  assert.equal(sections.featuredProducts.some(({ sellingType }) => sellingType === 'AUCTION'), false);
});

test('keeps fewer products when fewer eligible unique items are available', () => {
  const sections = buildHomeProductSections([product(1)], [product(1), product(2, 'AUCTION')]);

  assert.deepEqual(sections.featuredProducts.map(({ id }) => id), [1]);
  assert.deepEqual(sections.recentProducts, []);
});
