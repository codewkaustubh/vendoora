import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getAll(req: Request, res: Response) {
  try {
    const { category, search, location } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = {
        equals: String(category),
        mode: 'insensitive',
      };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { category: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (location) {
      whereClause.location = {
        contains: String(location),
        mode: 'insensitive',
      };
    }

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        inventory: true,
      },
      orderBy: { rating: 'desc' },
    });

    return res.status(200).json({ vendors });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching vendors' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        inventory: true,
        reels: true,
      },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    return res.status(200).json({ vendor });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching vendor' });
  }
}

export async function updateProfile(req: any, res: Response) {
  try {
    const { name, category, location, image, acceptingBookings } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        name: name !== undefined ? name : vendor.name,
        category: category !== undefined ? category : vendor.category,
        location: location !== undefined ? location : vendor.location,
        image: image !== undefined ? image : vendor.image,
        acceptingBookings: acceptingBookings !== undefined ? acceptingBookings : vendor.acceptingBookings,
      },
    });

    return res.status(200).json({
      message: 'Vendor profile updated successfully',
      vendor: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error updating profile' });
  }
}
