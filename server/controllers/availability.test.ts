import assert from 'node:assert/strict';
import test from 'node:test';
import { Prisma } from '@prisma/client';
import { checkBookingConflict } from './availability';

type ConflictFixture = {
  acceptingBookings?: boolean;
  blackout?: object | null;
  slots?: Array<{ startTime: string; endTime: string }>;
  bookings?: Array<{ startTime: string; endTime?: string | null }>;
};

function transactionFixture(fixture: ConflictFixture = {}) {
  return {
    vendor: {
      findUnique: async () => ({ acceptingBookings: fixture.acceptingBookings ?? true }),
    },
    blackout: {
      findFirst: async () => fixture.blackout ?? null,
    },
    vendorAvailability: {
      findMany: async () => fixture.slots ?? [{ startTime: '09:00', endTime: '17:00' }],
    },
    booking: {
      findMany: async () => fixture.bookings ?? [],
    },
  } as unknown as Prisma.TransactionClient;
}

const bookingDate = new Date('2026-09-15T00:00:00.000Z');

test('rejects a partially overlapping booking', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ bookings: [{ startTime: '10:00', endTime: '12:00' }] }),
    'vendor-1',
    bookingDate,
    '11:00',
    '13:00',
  );

  assert.equal(result, 'Vendor already has an overlapping booking');
});

test('rejects an exact double-booking', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ bookings: [{ startTime: '10:00', endTime: '12:00' }] }),
    'vendor-1',
    bookingDate,
    '10:00',
    '12:00',
  );

  assert.equal(result, 'Vendor already has an overlapping booking');
});

test('rejects a booking on a blackout date', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ blackout: { reason: 'Private event' } }),
    'vendor-1',
    bookingDate,
    '10:00',
    '12:00',
  );

  assert.equal(result, 'Vendor unavailable: Private event');
});

test('rejects a booking outside configured availability', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ slots: [{ startTime: '09:00', endTime: '12:00' }] }),
    'vendor-1',
    bookingDate,
    '12:00',
    '13:00',
  );

  assert.equal(result, 'Requested time is outside the vendor availability');
});

test('rejects a booking when the vendor is not accepting bookings', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ acceptingBookings: false }),
    'vendor-1',
    bookingDate,
    '10:00',
    '12:00',
  );

  assert.equal(result, 'Vendor is not accepting bookings');
});

test('allows a valid booking in an available slot', async () => {
  const result = await checkBookingConflict(
    transactionFixture({ slots: [{ startTime: '09:00', endTime: '17:00' }] }),
    'vendor-1',
    bookingDate,
    '13:00',
    '15:00',
  );

  assert.equal(result, null);
});