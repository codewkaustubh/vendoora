import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBookingInquiryMessage } from './bookings';

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