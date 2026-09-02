import { Response } from 'express';
import { prisma } from '../config/db';
import { createNotification } from './notifications';

export function validRating(rating: unknown): boolean {
  return Number.isInteger(Number(rating)) && Number(rating) >= 1 && Number(rating) <= 5;
}

export function canReviewOrder(order: { status: string; booking: { status: string; clientId: string } } | null, userId: string): boolean {
  return Boolean(order && order.status === 'COMPLETED' && order.booking.status === 'COMPLETED' && order.booking.clientId === userId);
}

export function isDuplicateReview(review: { id: string } | null): boolean {
  return Boolean(review);
}

const reviewInclude = {
  user: { select: { id: true, name: true } },
  vendor: { select: { id: true, businessName: true } },
  order: { select: { id: true, bookingId: true, status: true } },
} as const;

export async function create(req: any, res: Response) {
  try {
    const { orderId, rating, comment } = req.body;
    if (!orderId || !validRating(rating)) return res.status(400).json({ error: 'Order ID and rating from 1 to 5 are required' });

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
      include: { booking: true, review: true },
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!canReviewOrder(order, req.user.id)) return res.status(403).json({ error: 'Only the customer can review their completed order' });
    if (isDuplicateReview(order.review)) return res.status(409).json({ error: 'This order has already been reviewed' });

    const review = await prisma.review.create({
      data: { orderId: order.id, userId: req.user.id, vendorId: order.booking.vendorId, rating: Number(rating), comment: comment ? String(comment) : undefined },
      include: reviewInclude,
    });
    const vendor = await prisma.vendor.findUnique({ where: { id: order.booking.vendorId }, select: { userId: true } });
    if (vendor) await createNotification(vendor.userId, 'Review received', `A customer rated your completed booking ${rating}/5.`, 'review');
    return res.status(201).json({ review });
  } catch (error: any) {
    if (error?.code === 'P2002') return res.status(409).json({ error: 'This order has already been reviewed' });
    return res.status(500).json({ error: error.message || 'Server error creating review' });
  }
}

export async function getMine(req: any, res: Response) {
  try {
    const reviews = await prisma.review.findMany({ where: { userId: req.user.id }, include: reviewInclude, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ reviews });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching customer reviews' });
  }
}

export async function getVendorReviews(req: any, res: Response) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { userId: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    const reviews = await prisma.review.findMany({ where: { vendorId: vendor.id }, include: reviewInclude, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ reviews });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching vendor reviews' });
  }
}

export async function getPublicVendorReviews(req: any, res: Response) {
  try {
    const reviews = await prisma.review.findMany({ where: { vendorId: req.params.vendorId }, include: reviewInclude, orderBy: { createdAt: 'desc' } });
    return res.status(200).json({ reviews });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching reviews' });
  }
}