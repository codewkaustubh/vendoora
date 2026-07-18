import { Response } from 'express';
import { prisma } from '../config/db';

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

    const booking = await prisma.booking.create({
      data: {
        clientId: req.user.id,
        vendorId,
        eventName,
        eventDate: new Date(bookingDate),
        startTime: String(bookingStartTime),
        endTime: endTime ? String(endTime) : undefined,
        venue: String(bookingVenue),
        guestCount: guestCount !== undefined ? Number(guestCount) : undefined,
        totalPrice: Number(totalPrice ?? 0),
        bookingOtp: bookingOtp ? String(bookingOtp) : undefined,
        otpVerified: otpVerified === true,
        status: 'PENDING',
      },
    });

    // Notify the vendor
    await prisma.notification.create({
      data: {
        userId: vendor.userId,
        title: 'New Client Inquiry',
        message: `${req.user.name || 'A client'} requested services for "${eventName}" on ${date} at ${time}.`,
        time: 'Just now',
        type: 'inquiry',
        read: false,
      },
    });

    return res.status(201).json({
      message: 'Inquiry placed successfully',
      booking,
    });
  } catch (error: any) {
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

    const updated = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    // Notify the client about status update
    await prisma.notification.create({
      data: {
        userId: booking.clientId,
        title: `Inquiry ${status.toLowerCase()}`,
        message: `Your booking request for "${booking.eventName}" has been updated to "${status}".`,
        time: 'Just now',
        type: 'system',
        read: false,
      },
    });

    return res.status(200).json({
      message: 'Booking status updated successfully',
      booking: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating booking status' });
  }
}
