import { Response } from 'express';
import { prisma } from '../config/db';

export async function add(req: any, res: Response) {
  try {
    const { name, units, hourlyRate, dailyRate, image } = req.body;

    if (!name || hourlyRate === undefined || dailyRate === undefined) {
      return res.status(400).json({ error: 'Missing name, hourlyRate, or dailyRate' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found for authenticated user' });
    }

    const newItem = await prisma.inventoryItem.create({
      data: {
        vendorId: vendor.id,
        name,
        units: units !== undefined ? parseInt(units) : 1,
        hourlyRate: parseFloat(hourlyRate),
        dailyRate: parseFloat(dailyRate),
        image: image || 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400',
      },
    });

    return res.status(201).json({
      message: 'Inventory item added successfully',
      item: newItem,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error adding inventory' });
  }
}

export async function updateRates(req: any, res: Response) {
  try {
    const { id } = req.params;
    const { hourlyRate, dailyRate } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item || item.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this inventory item' });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id },
      data: {
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : item.hourlyRate,
        dailyRate: dailyRate !== undefined ? parseFloat(dailyRate) : item.dailyRate,
      },
    });

    return res.status(200).json({
      message: 'Inventory rates updated successfully',
      item: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating inventory rates' });
  }
}

export async function remove(req: any, res: Response) {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id },
    });

    if (!item || item.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this inventory item' });
    }

    await prisma.inventoryItem.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Inventory item removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error deleting inventory' });
  }
}
