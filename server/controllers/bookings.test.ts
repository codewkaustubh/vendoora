import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBookingInquiryMessage, parseGuestCount, parseNonNegativeAmount } from './bookings';

test('booking inquiry notification uses the persisted event date and start time', () => {
  const message = buildBookingInquiryMessage('Asha', 'Wedding Decor', new Date('2026-10-10T00:00:00.000Z'), '18:00');
  assert.equal(message, 'Asha requested services for "Wedding Decor" on 2026-10-10 at 18:00.');
  assert.equal(message.includes('undefined'), false);
});

test('booking inquiry notification stays readable for an unparseable date', () => {
  assert.equal(
    buildBookingInquiryMessage('A client', 'Corporate Gala', 'not-a-date', '09:30'),
    'A client requested services for "Corporate Gala" on not-a-date at 09:30.',
  );
});

test('accepts only booking amounts of at least 1', () => {
  assert.equal(parseNonNegativeAmount(undefined), 0);
  assert.equal(parseNonNegativeAmount(null), 0);
  assert.equal(parseNonNegativeAmount(''), 0);
  assert.equal(parseNonNegativeAmount('45000'), 45000);
  assert.equal(parseNonNegativeAmount(1200.5), 1200.5);
  assert.equal(parseNonNegativeAmount(0), null, '0 is below the 1 minimum');
  assert.equal(parseNonNegativeAmount(-1), null);
  assert.equal(parseNonNegativeAmount('abc'), null);
  assert.equal(parseNonNegativeAmount(Number.POSITIVE_INFINITY), null);
  assert.equal(parseNonNegativeAmount(Number.NaN), null);
  assert.equal(parseNonNegativeAmount({ amount: 10 }), null);
});

test('accepts only guest counts of at least 1', () => {
  assert.equal(parseGuestCount(undefined), undefined);
  assert.equal(parseGuestCount(null), undefined);
  assert.equal(parseGuestCount(''), undefined);
  assert.equal(parseGuestCount('150'), 150);
  assert.equal(parseGuestCount(0), null, '0 is below the 1 minimum');
  assert.equal(parseGuestCount(-5), null);
  assert.equal(parseGuestCount(12.5), null);
  assert.equal(parseGuestCount('many'), null);
});