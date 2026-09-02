import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { canAccessBooking, paymentAmountMatches, shouldReusePendingPayment, verifyRazorpaySignature } from './payments';

test('verifies a Razorpay signature and rejects tampering', () => {
  const secret = 'test-secret';
  const orderId = 'order_123';
  const paymentId = 'pay_123';
  const signature = createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

  assert.equal(verifyRazorpaySignature(orderId, paymentId, signature, secret), true);
  assert.equal(verifyRazorpaySignature(orderId, paymentId, `${signature.slice(0, -1)}0`, secret), false);
});

test('enforces booking ownership', () => {
  assert.equal(canAccessBooking({ clientId: 'client-1' }, 'client-1'), true);
  assert.equal(canAccessBooking({ clientId: 'client-1' }, 'client-2'), false);
  assert.equal(canAccessBooking(null, 'client-1'), false);
});

test('rejects payment amount mismatches', () => {
  assert.equal(paymentAmountMatches(150000, 150000), true);
  assert.equal(paymentAmountMatches(undefined, 150000), true);
  assert.equal(paymentAmountMatches(149999, 150000), false);
});

test('reuses only a matching pending payment order for idempotency', () => {
  assert.equal(shouldReusePendingPayment({ status: 'PENDING', amountPaise: 150000 }, 150000), true);
  assert.equal(shouldReusePendingPayment({ status: 'PENDING', amountPaise: 149999 }, 150000), false);
  assert.equal(shouldReusePendingPayment({ status: 'FAILED', amountPaise: 150000 }, 150000), false);
});