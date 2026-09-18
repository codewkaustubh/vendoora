import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { checkBookingConflict } from './availability';
import { createNotification } from './notifications';

export function buildBookingInquiryMessage(clientName: string, eventName: string, eventDate: Date | string, startTime: string): string {
  const parsed = new Date(eventDate);
  const day = Number.isNaN(parsed.getTime()) ? String(eventDate) : parsed.toISOString().slice(0, 10);
  return `${clientName} requested services for "${eventName}" on ${day} at ${startTime}.`;
}

/** Server-side guard: booking amounts must be finite and never negative. */
export function parseNonNegativeAmount(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return 0;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return amount;
}

/** `null` signals an invalid payload; `undefined` means the caller omitted it. */
export function parseGuestCount(value: unknown): number | null | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0 || !Number.isInteger(count)) return null;
  return count;
}

export async function create(req: any, res: Response) {
  try {
    const {
      vendorId,
      eventName,
      date,
      time,
      location,
      eventDate,
      startTime,
      endTime,
      venue,
      guestCount,
      totalPrice,
      serviceId,
      specialRequest,
      bookingOtp,
      otpVerified,
    } = req.body;

    const bookingDate = eventDate ?? date;
    const bookingStartTime = startTime ?? time;
    const bookingVenue = venue ?? location;

    if (!vendorId || !eventName || !bookingDate || !bookingStartTime || !bookingVenue) {
      return res.status(400).json({ error: 'Missing vendorId, eventName, date, time, or venue' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: { user: true },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const bookingServiceId = serviceId ? String(serviceId) : undefined;
    if (bookingServiceId) {
      const service = await prisma.service.findFirst({ where: { id: bookingServiceId, vendorId } });
      if (!service) return res.status(400).json({ error: 'Service does not belong to the selected vendor' });
    }

    const parsedBookingDate = new Date(bookingDate);
    if (Number.isNaN(parsedBookingDate.getTime())) {
      return res.status(400).json({ error: 'Invalid booking date' });
    }

    const parsedTotalPrice = parseNonNegativeAmount(totalPrice);
    if (parsedTotalPrice === null) {
      return res.status(400).json({ error: 'totalPrice must be a non-negative number' });
    }

    const parsedGuestCount = parseGuestCount(guestCount);
    if (parsedGuestCount === null) {
      return res.status(400).json({ error: 'guestCount must be a non-negative whole number' });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const conflict = await checkBookingConflict(
        tx,
        vendorId,
        parsedBookingDate,
        String(bookingStartTime),
        endTime ? String(endTime) : undefined,
      );
      if (conflict) return { conflict };

      return tx.booking.create({
        data: {
          clientId: req.user.id,
          vendorId,
          serviceId: bookingServiceId,
          eventName,
          eventDate: parsedBookingDate,
          startTime: String(bookingStartTime),
          endTime: endTime ? String(endTime) : undefined,
          venue: String(bookingVenue),
          guestCount: parsedGuestCount,
          specialRequest: specialRequest ? String(specialRequest) : undefined,
          totalPrice: parsedTotalPrice,
          bookingOtp: bookingOtp ? String(bookingOtp) : undefined,
          otpVerified: otpVerified === true,
          status: 'PENDING',
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if ('conflict' in booking) {
      return res.status(409).json({ error: booking.conflict });
    }

    // Notify the vendor
    await createNotification(vendor.userId, 'New Client Inquiry', buildBookingInquiryMessage(req.user.name || 'A client', eventName, booking.eventDate, booking.startTime), 'inquiry');

    return res.status(201).json({
      message: 'Inquiry placed successfully',
      booking,
    });
  } catch (error: any) {
    if (error?.code === 'P2034') {
      return res.status(409).json({ error: 'Another booking was created for this vendor at the same time' });
    }
    return res.status(500).json({ error: error.message || 'Server error creating booking' });
  }
}

export async function getVendorBookings(req: any, res: Response) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: { vendorId: vendor.id },
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ bookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching bookings' });
  }
}

export async function getClientBookings(req: any, res: Response) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.id },
      include: {
        vendor: {
          select: { businessName: true, ownerName: true, category: true, logo: true, coverImage: true },
        },
        payment: true,
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ bookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching bookings' });
  }
}

export async function updateStatus(req: any, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, DECLINED

    if (!status) {
      return res.status(400).json({ error: 'Missing status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { vendor: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure the updating user is the vendor for this booking
    if (booking.vendor.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to manage this booking' });
    }

    if (!['SCHEDULED', 'DECLINED'].includes(status)) {
      return res.status(400).json({ error: 'Use fulfillment orders to manage paid bookings' });
    }
    if (booking.status === status) return res.status(200).json({ booking });
    if (booking.status !== 'PENDING' || booking.paymentStatus === 'PAID') {
      return res.status(409).json({ error: 'Only unpaid pending inquiries can be accepted or declined' });
    }
    const changed = await prisma.booking.updateMany({
      where: { id, status: 'PENDING', paymentStatus: 'PENDING' }, data: { status },
    });
    if (!changed.count) return res.status(409).json({ error: 'Booking changed; refresh and retry' });
    const updated = await prisma.booking.findUnique({ where: { id } });

    // Notify the client about status update
    await createNotification(booking.clientId, `Inquiry ${status.toLowerCase()}`, `Your booking request for "${booking.eventName}" has been updated to "${status}".`, 'system');

    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating booking status' });
  }
}
