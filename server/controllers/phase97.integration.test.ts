import assert from 'node:assert/strict';
import test from 'node:test';
import { Prisma } from '@prisma/client';
import { ensureOrderForPaidBooking, canTransitionOrderStatus } from './orders';

test('customer paid booking becomes a confirmed order with fulfillment data', async () => {
  let createdOrder: any;
  const tx = {
    order: {
      findUnique: async () => null,
      create: async ({ data }: any) => {
        createdOrder = { id: 'order-1', ...data };
        return createdOrder;
      },
    },
    booking: {
      findUnique: async () => ({
        id: 'booking-1',
        paymentStatus: 'PAID',
        payment: { status: 'PAID' },
        venue: 'Customer venue',
        eventDate: new Date('2026-10-10T00:00:00.000Z'),
        startTime: '18:00',
        endTime: '20:00',
        specialRequest: 'Outdoor setup',
      }),
    },
  } as unknown as Prisma.TransactionClient;

  const order = await ensureOrderForPaidBooking(tx, 'booking-1');
  assert.equal(order.status, 'CONFIRMED');
  assert.equal(createdOrder.bookingId, 'booking-1');
  assert.equal(createdOrder.venueAddress, 'Customer venue');
});

test('vendor fulfillment lifecycle progresses only through valid states', () => {
  const lifecycle = ['CONFIRMED', 'PREPARING', 'READY', 'IN_PROGRESS', 'COMPLETED'] as const;
  for (let index = 0; index < lifecycle.length - 1; index += 1) {
    assert.equal(canTransitionOrderStatus(lifecycle[index], lifecycle[index + 1]), true);
  }
  assert.equal(canTransitionOrderStatus('CONFIRMED', 'READY'), false);
  assert.equal(canTransitionOrderStatus('IN_PROGRESS', 'CANCELLED'), false);
});