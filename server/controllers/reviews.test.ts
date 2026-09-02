import assert from 'node:assert/strict';
import test from 'node:test';
import { canReviewOrder, isDuplicateReview, validRating } from './reviews';

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