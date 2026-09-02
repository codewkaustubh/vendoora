import crypto from 'node:crypto';
import { Response } from 'express';
import Razorpay from 'razorpay';
import { prisma } from '../config/db';
import { createNotification } from './notifications';
import { ensureOrderForPaidBooking } from './orders';

const CURRENCY = 'INR';

type RazorpayClient = {
  orders: { create: (options: Record<string, unknown>) => Promise<any> };
  payments: { fetch: (id: string) => Promise<any>; refund: (id: string, options?: Record<string, unknown>) => Promise<any> };
};

let razorpayClient: RazorpayClient | null = null;

export function canAccessBooking(booking: { clientId: string } | null, userId: string): boolean {
  return Boolean(booking && booking.clientId === userId);
}

export function paymentAmountMatches(requestedAmount: unknown, expectedAmount: number): boolean {
  return requestedAmount === undefined || Number(requestedAmount) === expectedAmount;
}

export function shouldReusePendingPayment(payment: { status: string; amountPaise: number } | null, expectedAmount: number): boolean {
  return Boolean(payment && payment.status === 'PENDING' && payment.amountPaise === expectedAmount);
}

function getRazorpay(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay credentials are not configured');
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret }) as unknown as RazorpayClient;
  }
  return razorpayClient;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function amountInPaise(totalPrice: unknown): number | null {
  const amount = Number(totalPrice);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const paise = Math.round(amount * 100);
  return paise > 0 ? paise : null;
}

async function getOwnedBooking(bookingId: string, clientId: string) {
  return prisma.booking.findFirst({ where: { id: bookingId, clientId }, include: { payment: true } });
}

export async function createOrder(req: any, res: Response) {
  try {
    const { bookingId, amount, currency = CURRENCY } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'Missing bookingId' });
    if (currency !== CURRENCY) return res.status(400).json({ error: 'Only INR payments are supported' });

    const booking = await getOwnedBooking(String(bookingId), req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    const expectedAmount = amountInPaise(booking.totalPrice);
    if (!expectedAmount) return res.status(400).json({ error: 'Booking amount must be greater than zero' });
    if (!paymentAmountMatches(amount, expectedAmount)) {
      return res.status(400).json({ error: 'Payment amount does not match the booking amount' });
    }
    if (booking.payment?.status === 'PAID') {
      return res.status(409).json({ error: 'Booking has already been paid' });
    }
    if (shouldReusePendingPayment(booking.payment, expectedAmount)) {
      return res.status(200).json({ keyId: process.env.RAZORPAY_KEY_ID, order: { id: booking.payment.orderId, amount: expectedAmount, currency: CURRENCY }, payment: booking.payment, reused: true });
    }

    const provider = getRazorpay();
    const order = await provider.orders.create({ amount: expectedAmount, currency: CURRENCY, receipt: booking.id });
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: { bookingId: booking.id, orderId: order.id, amountPaise: expectedAmount, currency: CURRENCY, status: 'PENDING' },
      update: { orderId: order.id, amountPaise: expectedAmount, currency: CURRENCY, paymentId: null, signature: null, failureReason: null, refundId: null, paidAt: null, refundedAt: null, status: 'PENDING' },
    });
    return res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, order: { id: order.id, amount: expectedAmount, currency: CURRENCY }, payment });
  } catch (error: any) {
    if (error?.message === 'Razorpay credentials are not configured') return res.status(503).json({ error: error.message });
    return res.status(500).json({ error: error.message || 'Server error creating payment order' });
  }
}

export async function verifyPayment(req: any, res: Response) {
  try {
    const { bookingId, razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body;
    if (!bookingId || !orderId || !paymentId || !signature) return res.status(400).json({ error: 'Missing payment verification fields' });

    const booking = await getOwnedBooking(String(bookingId), req.user.id);
    if (!booking || !booking.payment) return res.status(404).json({ error: 'Payment order not found' });
    if (booking.payment.status === 'PAID') return res.status(200).json({ message: 'Payment already verified', booking, payment: booking.payment });
    if (booking.payment.orderId !== orderId) return res.status(400).json({ error: 'Payment order does not match the booking' });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !verifyRazorpaySignature(orderId, paymentId, String(signature), secret)) {
      await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'FAILED', failureReason: 'Invalid payment signature' } });
      await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const providerPayment = await getRazorpay().payments.fetch(String(paymentId));
    if (providerPayment.order_id !== orderId || providerPayment.amount !== booking.payment.amountPaise || providerPayment.currency !== CURRENCY) {
      await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'FAILED', failureReason: 'Payment amount or currency mismatch' } });
      await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(400).json({ error: 'Payment amount or currency does not match the booking' });
    }
    if (!['captured', 'authorized'].includes(providerPayment.status)) {
      await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'FAILED', failureReason: `Provider status: ${providerPayment.status}` } });
      await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'FAILED' } });
      return res.status(400).json({ error: 'Payment was not captured by Razorpay' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({ where: { id: booking.payment!.id }, data: { paymentId, signature: String(signature), status: 'PAID', paidAt: new Date(), failureReason: null } });
      const updatedBooking = await tx.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'PAID' } });
      const order = await ensureOrderForPaidBooking(tx, booking.id);
      return { payment, booking: updatedBooking, order };
    });
    await createNotification(booking.clientId, 'Payment successful', `Payment for "${booking.eventName}" was verified successfully.`, 'payment');
    return res.status(200).json({ message: 'Payment verified successfully', ...updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error verifying payment' });
  }
}

export async function markFailed(req: any, res: Response) {
  try {
    const booking = await getOwnedBooking(String(req.body.bookingId), req.user.id);
    if (!booking || !booking.payment) return res.status(404).json({ error: 'Payment order not found' });
    if (booking.payment.status === 'PAID') return res.status(409).json({ error: 'Paid payments cannot be marked failed' });
    const reason = String(req.body.reason || 'Payment failed or was cancelled');
    const payment = await prisma.payment.update({ where: { id: booking.payment.id }, data: { status: 'FAILED', failureReason: reason } });
    await prisma.booking.update({ where: { id: booking.id }, data: { paymentStatus: 'FAILED' } });
    await createNotification(booking.clientId, 'Payment failed', `Payment for "${booking.eventName}" was not completed. You can retry.`, 'payment');
    return res.status(200).json({ payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error recording payment failure' });
  }
}

export async function getBookingPayment(req: any, res: Response) {
  try {
    const booking = await getOwnedBooking(req.params.bookingId, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    return res.status(200).json({ booking, payment: booking.payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching payment status' });
  }
}

export async function refundPayment(req: any, res: Response) {
  try {
    const booking = await getOwnedBooking(String(req.body.bookingId), req.user.id);
    if (!booking || !booking.payment) return res.status(404).json({ error: 'Payment not found' });
    if (booking.status !== 'PENDING' && booking.status !== 'SCHEDULED') return res.status(400).json({ error: 'Only pending or scheduled bookings can be cancelled' });
    if (booking.eventDate <= new Date()) return res.status(400).json({ error: 'Past bookings cannot be cancelled' });
    const order = await prisma.order.findUnique({ where: { bookingId: booking.id } });
    if (order && !['CONFIRMED', 'PREPARING', 'READY'].includes(order.status)) return res.status(400).json({ error: 'This fulfillment order can no longer be cancelled' });
    if (booking.payment.status === 'REFUNDED') return res.status(200).json({ message: 'Payment already refunded', booking, payment: booking.payment });

    if (booking.payment.status === 'PAID') {
      if (!booking.payment.paymentId) return res.status(400).json({ error: 'Paid payment is missing provider reference' });
      const refund = await getRazorpay().payments.refund(booking.payment.paymentId, { amount: booking.payment.amountPaise });
      const updated = await prisma.$transaction(async (tx) => {
        const payment = await tx.payment.update({ where: { id: booking.payment!.id }, data: { status: 'REFUNDED', refundId: refund.id, refundedAt: new Date() } });
        const updatedBooking = await tx.booking.update({ where: { id: booking.id }, data: { status: 'DECLINED', paymentStatus: 'REFUNDED', cancellationReason: String(req.body.reason || 'Cancelled by customer') } });
        const refundedOrder = await tx.order.findUnique({ where: { bookingId: booking.id } });
        if (refundedOrder) await tx.order.update({ where: { id: refundedOrder.id }, data: { status: 'CANCELLED' } });
        return { payment, booking: updatedBooking };
      });
        await createNotification(booking.clientId, 'Booking cancelled', `Your booking for "${booking.eventName}" was cancelled and refunded.`, 'booking');
      return res.status(200).json({ message: 'Booking cancelled and payment refunded', ...updated });
    }

    const updatedBooking = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'DECLINED', cancellationReason: String(req.body.reason || 'Cancelled by customer') } });
    const cancelledOrder = await prisma.order.findUnique({ where: { bookingId: booking.id } });
    if (cancelledOrder) await prisma.order.update({ where: { id: cancelledOrder.id }, data: { status: 'CANCELLED' } });
    await createNotification(booking.clientId, 'Booking cancelled', `Your booking for "${booking.eventName}" was cancelled.`, 'booking');
    return res.status(200).json({ message: 'Booking cancelled', booking: updatedBooking, payment: booking.payment });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error cancelling booking' });
  }
}

export async function vendorSummary(req: any, res: Response) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    const payments = await prisma.payment.findMany({ where: { booking: { vendorId: vendor.id } }, select: { amountPaise: true, status: true } });
    const paid = payments.filter((payment) => payment.status === 'PAID');
    const refunded = payments.filter((payment) => payment.status === 'REFUNDED');
    const pending = payments.filter((payment) => payment.status === 'PENDING');
    return res.status(200).json({ paidBookings: paid.length, paidAmountPaise: paid.reduce((sum, payment) => sum + payment.amountPaise, 0), refundedAmountPaise: refunded.reduce((sum, payment) => sum + payment.amountPaise, 0), pendingPayments: pending.length, currency: CURRENCY });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching vendor payment summary' });
  }
}