import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function add(req: any, res: Response) {
  try {
    const { title, thumbnail, duration } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing title' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const reel = await prisma.vibeReel.create({
      data: {
        vendorId: vendor.id,
        title,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
        views: 0,
        duration: duration || '0:15',
      },
    });

    return res.status(201).json({
      message: 'Vibe reel published successfully',
      reel,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error publishing reel' });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const reels = await prisma.vibeReel.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: {
          select: { businessName: true, ownerName: true, category: true, logo: true },
        },
      },
    });

    return res.status(200).json({ reels });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching reels' });
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

    const reel = await prisma.vibeReel.findUnique({
      where: { id },
    });

    if (!reel || reel.vendorId !== vendor.id) {
      return res.status(403).json({ error: 'Forbidden: You do not own this vibe reel' });
    }

    await prisma.vibeReel.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Vibe reel deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error deleting reel' });
  }
}
