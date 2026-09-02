import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTime(value: unknown): number | null {
  if (typeof value !== 'string' || !TIME_PATTERN.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function dateRange(date: Date) {
  const key = dateKey(date);
  const start = new Date(`${key}T00:00:00.000Z`);
  return {
    gte: start,
    lt: new Date(start.getTime() + 24 * 60 * 60 * 1000),
  };
}

function getBookingWindow(startTime: unknown, endTime: unknown) {
  const start = parseTime(startTime);
  const end = endTime === undefined || endTime === null || endTime === '' ? start === null ? null : start + 1 : parseTime(endTime);
  if (start === null || end === null || end <= start) return null;
  return { start, end };
}

async function getVendorForUser(userId: string) {
  return prisma.vendor.findUnique({ where: { userId } });
}

async function getOwnedAvailability(id: string, userId: string) {
  return prisma.vendorAvailability.findFirst({
    where: { id, vendor: { userId } },
  });
}

async function getOwnedBlackout(id: string, userId: string) {
  return prisma.blackout.findFirst({
    where: { id, vendor: { userId } },
  });
}

export async function getMine(req: any, res: Response) {
  try {
    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const availability = await prisma.vendorAvailability.findMany({
      where: { vendorId: vendor.id },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    const blackouts = await prisma.blackout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { dateStart: 'asc' },
    });
    return res.status(200).json({ availability, blackouts, acceptingBookings: vendor.acceptingBookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching availability' });
  }
}

export async function getForVendor(req: any, res: Response) {
  try {
    const vendor = await prisma.vendor.findUnique({ where: { id: req.params.vendorId } });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const availability = await prisma.vendorAvailability.findMany({
      where: { vendorId: vendor.id, isAvailable: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return res.status(200).json({ availability, acceptingBookings: vendor.acceptingBookings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching availability' });
  }
}

export async function getBlackouts(req: any, res: Response) {
  try {
    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });

    const blackouts = await prisma.blackout.findMany({
      where: { vendorId: vendor.id },
      orderBy: { dateStart: 'asc' },
    });
    return res.status(200).json({ blackouts });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching blackouts' });
  }
}

export async function createAvailability(req: any, res: Response) {
  try {
    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    const date = parseDate(req.body.date);
    const window = getBookingWindow(req.body.startTime, req.body.endTime);
    if (!date || !window) return res.status(400).json({ error: 'Use date YYYY-MM-DD and valid non-overlapping HH:mm times' });

    const availability = await prisma.vendorAvailability.create({
      data: {
        vendorId: vendor.id,
        date,
        startTime: String(req.body.startTime),
        endTime: String(req.body.endTime),
        isAvailable: req.body.isAvailable !== false,
      },
    });
    return res.status(201).json({ availability });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error creating availability' });
  }
}

export async function updateAvailability(req: any, res: Response) {
  try {
    const current = await getOwnedAvailability(req.params.id, req.user.id);
    if (!current) return res.status(404).json({ error: 'Availability entry not found' });
    const date = parseDate(req.body.date ?? dateKey(current.date));
    const window = getBookingWindow(req.body.startTime ?? current.startTime, req.body.endTime ?? current.endTime);
    if (!date || !window) return res.status(400).json({ error: 'Use date YYYY-MM-DD and valid non-overlapping HH:mm times' });

    const availability = await prisma.vendorAvailability.update({
      where: { id: current.id },
      data: {
        date,
        startTime: String(req.body.startTime ?? current.startTime),
        endTime: String(req.body.endTime ?? current.endTime),
        isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : current.isAvailable,
      },
    });
    return res.status(200).json({ availability });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating availability' });
  }
}

export async function deleteAvailability(req: any, res: Response) {
  try {
    const current = await getOwnedAvailability(req.params.id, req.user.id);
    if (!current) return res.status(404).json({ error: 'Availability entry not found' });
    await prisma.vendorAvailability.delete({ where: { id: current.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error deleting availability' });
  }
}

export async function createBlackout(req: any, res: Response) {
  try {
    const vendor = await getVendorForUser(req.user.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    const dateStart = parseDate(req.body.dateStart);
    const dateEnd = parseDate(req.body.dateEnd ?? req.body.dateStart);
    if (!dateStart || !dateEnd || dateEnd < dateStart) return res.status(400).json({ error: 'Use a valid blackout date range' });

    const blackout = await prisma.blackout.create({
      data: { vendorId: vendor.id, dateStart, dateEnd, reason: req.body.reason ? String(req.body.reason) : undefined },
    });
    return res.status(201).json({ blackout });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error creating blackout' });
  }
}

export async function updateBlackout(req: any, res: Response) {
  try {
    const current = await getOwnedBlackout(req.params.id, req.user.id);
    if (!current) return res.status(404).json({ error: 'Blackout not found' });
    const dateStart = parseDate(req.body.dateStart ?? dateKey(current.dateStart));
    const dateEnd = parseDate(req.body.dateEnd ?? dateKey(current.dateEnd));
    if (!dateStart || !dateEnd || dateEnd < dateStart) return res.status(400).json({ error: 'Use a valid blackout date range' });

    const blackout = await prisma.blackout.update({
      where: { id: current.id },
      data: { dateStart, dateEnd, reason: req.body.reason !== undefined ? String(req.body.reason) : current.reason },
    });
    return res.status(200).json({ blackout });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating blackout' });
  }
}

export async function deleteBlackout(req: any, res: Response) {
  try {
    const current = await getOwnedBlackout(req.params.id, req.user.id);
    if (!current) return res.status(404).json({ error: 'Blackout not found' });
    await prisma.blackout.delete({ where: { id: current.id } });
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error deleting blackout' });
  }
}

export async function checkBookingConflict(tx: Prisma.TransactionClient, vendorId: string, eventDate: Date, startTime: string, endTime?: string) {
  const window = getBookingWindow(startTime, endTime);
  if (!window) return 'Use valid non-overlapping HH:mm booking times';
  const eventDay = new Date(`${dateKey(eventDate)}T00:00:00.000Z`);

  const vendor = await tx.vendor.findUnique({ where: { id: vendorId }, select: { acceptingBookings: true } });
  if (!vendor) return 'Vendor profile not found';
  if (!vendor.acceptingBookings) return 'Vendor is not accepting bookings';

  const blackout = await tx.blackout.findFirst({
    where: { vendorId, dateStart: { lte: eventDay }, dateEnd: { gte: eventDay } },
  });
  if (blackout) return blackout.reason ? `Vendor unavailable: ${blackout.reason}` : 'Vendor is unavailable on this date';

  const slots = await tx.vendorAvailability.findMany({ where: { vendorId, date: dateRange(eventDay), isAvailable: true } });
  const hasSlot = slots.some((slot) => {
    const slotStart = parseTime(slot.startTime);
    const slotEnd = parseTime(slot.endTime);
    return slotStart !== null && slotEnd !== null && slotStart <= window.start && slotEnd >= window.end;
  });
  if (!hasSlot) return 'Requested time is outside the vendor availability';

  const existing = await tx.booking.findMany({
    where: { vendorId, eventDate: dateRange(eventDay), status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] } },
    select: { startTime: true, endTime: true },
  });
  const overlaps = existing.some((booking) => {
    const existingWindow = getBookingWindow(booking.startTime, booking.endTime);
    return existingWindow && window.start < existingWindow.end && existingWindow.start < window.end;
  });
  return overlaps ? 'Vendor already has an overlapping booking' : null;
}