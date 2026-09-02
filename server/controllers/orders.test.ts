import assert from 'node:assert/strict';
import test from 'node:test';
import { Prisma } from '@prisma/client';
import { canCreateOrderForBooking, canManageOrder, canTransitionOrderStatus, ensureOrderForPaidBooking } from './orders';

test('creates orders only for paid booking and payment states', () => {
  assert.equal(canCreateOrderForBooking({ paymentStatus: 'PAID', payment: { status: 'PAID' } }), true);
  assert.equal(canCreateOrderForBooking({ paymentStatus: 'PENDING', payment: { status: 'PAID' } }), false);
  assert.equal(canCreateOrderForBooking({ paymentStatus: 'PAID', payment: { status: 'PENDING' } }), false);
  assert.equal(canCreateOrderForBooking(null), false);
});

test('authorizes only the owning vendor', () => {
  const order = { booking: { vendor: { userId: 'vendor-1' } } };
  assert.equal(canManageOrder(order, 'vendor-1'), true);
  assert.equal(canManageOrder(order, 'vendor-2'), false);
  assert.equal(canManageOrder(null, 'vendor-1'), false);
});

test('allows only valid fulfillment lifecycle transitions', () => {
  assert.equal(canTransitionOrderStatus('CONFIRMED', 'PREPARING'), true);
  assert.equal(canTransitionOrderStatus('PREPARING', 'READY'), true);
  assert.equal(canTransitionOrderStatus('READY', 'IN_PROGRESS'), true);
  assert.equal(canTransitionOrderStatus('IN_PROGRESS', 'COMPLETED'), true);
  assert.equal(canTransitionOrderStatus('CONFIRMED', 'COMPLETED'), false);
  assert.equal(canTransitionOrderStatus('COMPLETED', 'CANCELLED'), false);
  assert.equal(canTransitionOrderStatus('CANCELLED', 'PREPARING'), false);
});

test('creates a confirmed order from the paid booking logistics fields', async () => {
  let createdData: any;
  const tx = {
    order: {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        createdData = data;
        return { id: 'order-1', ...data };
      },
    },
    booking: {
      findUnique: async () => ({
        id: 'booking-1',
        paymentStatus: 'PAID',
        payment: { status: 'PAID' },
        venue: 'Venue A',
        eventDate: new Date('2026-10-01T00:00:00.000Z'),
        startTime: '10:00',
        endTime: '12:00',
        specialRequest: 'Stage setup',
      }),
    },
  } as unknown as Prisma.TransactionClient;

  const order = await ensureOrderForPaidBooking(tx, 'booking-1');
  assert.equal(order.status, 'CONFIRMED');
  assert.equal(createdData.bookingId, 'booking-1');
  assert.equal(createdData.venueAddress, 'Venue A');
  assert.equal(createdData.notes, 'Stage setup');
});