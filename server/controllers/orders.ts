import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { createNotification } from './notifications';

export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const transitions: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  return current === next || transitions[current]?.includes(next) === true;
}

export function canManageOrder(order: { booking: { vendor: { userId: string } } } | null, userId: string): boolean {
  return Boolean(order && order.booking.vendor.userId === userId);
}

export function canCreateOrderForBooking(booking: { paymentStatus: string; payment: { status: string } | null } | null): boolean {
  return Boolean(booking && booking.paymentStatus === 'PAID' && booking.payment?.status === 'PAID');
}

export async function ensureOrderForPaidBooking(tx: Prisma.TransactionClient, bookingId: string) {
  const existing = await tx.order.findUnique({ where: { bookingId } });
  if (existing) return existing;

  const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
  if (!canCreateOrderForBooking(booking)) throw new Error('An order can only be created for a paid booking');

  return tx.order.create({
    data: {
      bookingId: booking.id,
      fulfillmentType: 'EVENT_SERVICE',
      venueAddress: booking.venue,
      scheduledDate: booking.eventDate,
      scheduledStartTime: booking.startTime,
      scheduledEndTime: booking.endTime,
      notes: booking.specialRequest,
      status: 'CONFIRMED',
    },
  });
}

const orderInclude = {
  booking: {
    include: {
      vendor: { select: { id: true, userId: true, businessName: true } },
      client: { select: { id: true, name: true } },
      service: { select: { id: true, title: true } },
      payment: true,
    },
  },
} as const;

export async function getCustomerOrders(req: any, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { booking: { clientId: req.user.id } },
      include: orderInclude,
      orderBy: { scheduledDate: 'asc' },
    });
    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching customer orders' });
  }
}

export async function getVendorOrders(req: any, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      where: { booking: { vendor: { userId: req.user.id } } },
      include: orderInclude,
      orderBy: { scheduledDate: 'asc' },
    });
    return res.status(200).json({ orders });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching vendor orders' });
  }
}

export async function updateStatus(req: any, res: Response) {
  try {
    const nextStatus = String(req.body.status || '') as OrderStatus;
    if (!transitions[nextStatus] && nextStatus !== 'COMPLETED') return res.status(400).json({ error: 'Invalid order status' });

    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canManageOrder(order, req.user.id)) return res.status(403).json({ error: 'Forbidden: You are not authorized to manage this order' });
    if (!canTransitionOrderStatus(order.status, nextStatus)) return res.status(409).json({ error: `Invalid order transition from ${order.status} to ${nextStatus}` });
    if (order.status === nextStatus) return res.status(200).json({ order });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        ...(req.body.notes !== undefined ? { notes: String(req.body.notes) } : {}),
        ...(req.body.trackingReference !== undefined ? { trackingReference: String(req.body.trackingReference) } : {}),
      },
    });
    await createNotification(order.booking.client.id, 'Order status updated', `Your order for "${order.booking.eventName}" is now ${nextStatus}.`, 'order');
    return res.status(200).json({ order: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating order status' });
  }
}