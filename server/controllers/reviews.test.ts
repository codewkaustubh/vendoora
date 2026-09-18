import assert from 'node:assert/strict';
import test from 'node:test';
import { canReviewOrder, computeVendorRating, isDuplicateReview, syncVendorRating, validRating } from './reviews';

test('allows reviews only for the owning completed order', () => {
  const order = { status: 'COMPLETED', booking: { status: 'COMPLETED', clientId: 'client-1' } };
  assert.equal(canReviewOrder(order, 'client-1'), true);
  assert.equal(canReviewOrder(order, 'client-2'), false);
  assert.equal(canReviewOrder({ ...order, status: 'READY' }, 'client-1'), false);
  assert.equal(canReviewOrder({ ...order, booking: { ...order.booking, status: 'SCHEDULED' } }, 'client-1'), false);
});

test('detects duplicate reviews and validates rating range', () => {
  assert.equal(isDuplicateReview({ id: 'review-1' }), true);
  assert.equal(isDuplicateReview(null), false);
  assert.equal(validRating(1), true);
  assert.equal(validRating(5), true);
  assert.equal(validRating(0), false);
  assert.equal(validRating(6), false);
  assert.equal(validRating(3.5), false);
});

test('aggregates a vendor rating average from persisted review values', async () => {
  const updates: any[] = [];
  const db = {
    review: { findMany: async () => [{ rating: 5 }, { rating: 4 }, { rating: 4 }] },
    vendor: { update: async (args: any) => { updates.push(args); return {}; } },
  };

  const result = await syncVendorRating(db as any, 'vendor-1');
  assert.deepEqual(result, { rating: 4.33, totalReviews: 3 });
  assert.deepEqual(updates, [{ where: { id: 'vendor-1' }, data: { rating: 4.33, totalReviews: 3 } }]);
});

test('leaves the vendor rating untouched when a vendor has no persisted reviews', async () => {
  let updates = 0;
  const db = {
    review: { findMany: async () => [] },
    vendor: { update: async () => { updates += 1; return {}; } },
  };

  const result = await syncVendorRating(db as any, 'vendor-1');
  assert.deepEqual(result, { rating: 0, totalReviews: 0 });
  assert.equal(updates, 0);
  assert.deepEqual(computeVendorRating([5]), { rating: 5, totalReviews: 1 });
});