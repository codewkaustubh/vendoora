import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function listProduct(req: any, res: Response) {
  try {
    const { name, price, condition, location, image } = req.body;

    if (!name || price === undefined || !condition || !location) {
      return res.status(400).json({ error: 'Missing name, price, condition, or location' });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: req.user.id,
        name,
        price: parseInt(price),
        condition,
        location,
        image: image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
      },
    });

    return res.status(201).json({
      message: 'Marketplace product listed successfully',
      product,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error listing product' });
  }
}

export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { name: true, email: true },
        },
      },
    });

    return res.status(200).json({ products });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching marketplace products' });
  }
}

export async function deleteProduct(req: any, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product listing not found' });
    }

    if (product.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this listing' });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Marketplace product listing deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error deleting marketplace product' });
  }
}
