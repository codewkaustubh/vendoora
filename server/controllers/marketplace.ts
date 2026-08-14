import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function listProduct(req: any, res: Response) {
  try {
    const { name, description, price, aiSuggestedPrice, condition, location, image, available } = req.body;

    if (!name || price === undefined || !condition || !location) {
      return res.status(400).json({ error: 'Missing name, price, condition, or location' });
    }

    const product = await prisma.product.create({
      data: {
        sellerId: req.user.id,
        name,
        description: description ?? null,
        price: parseFloat(price),
        aiSuggestedPrice: aiSuggestedPrice !== undefined ? parseFloat(aiSuggestedPrice) : null,
        condition,
        location,
        image: image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
        available: available !== undefined ? Boolean(available) : true,
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
    const { search, condition, minPrice, maxPrice, location, sortBy, available = 'true', page = '1', limit = '20' } = req.query;

    const whereClause: any = { available: available !== 'false' };
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Condition filter
    if (condition) {
      whereClause.condition = String(condition);
    }

    // Location filter
    if (location) {
      whereClause.location = {
        contains: String(location),
        mode: 'insensitive',
      };
    }

    // Price range filter
    const minPriceVal = minPrice ? parseFloat(String(minPrice)) : undefined;
    const maxPriceVal = maxPrice ? parseFloat(String(maxPrice)) : undefined;
    if (minPriceVal !== undefined || maxPriceVal !== undefined) {
      whereClause.price = {};
      if (minPriceVal !== undefined) whereClause.price.gte = minPriceVal;
      if (maxPriceVal !== undefined) whereClause.price.lte = maxPriceVal;
    }

    // Text search
    if (search) {
      const searchTerm = String(search);
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderByClause: any = { createdAt: 'desc' };
    switch (String(sortBy)) {
      case 'price-asc':
        Object.assign(orderByClause, { price: 'asc' });
        break;
      case 'price-desc':
        Object.assign(orderByClause, { price: 'desc' });
        break;
      case 'newest':
        Object.assign(orderByClause, { createdAt: 'desc' });
        break;
      case 'oldest':
        Object.assign(orderByClause, { createdAt: 'asc' });
        break;
    }

    const total = await prisma.product.count({ where: whereClause });

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        seller: {
          select: { name: true, email: true, id: true },
        },
      },
      skip,
      take: pageSize,
    });

    return res.status(200).json({
      products,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
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
