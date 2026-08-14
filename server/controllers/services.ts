import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function create(req: any, res: Response) {
  try {
    const {
      title,
      description,
      startingPrice,
      priceType,
      duration,
      location,
      coverImage,
      isAvailable,
      categoryId,
      category,
    } = req.body;

    if (!title || startingPrice === undefined) {
      return res.status(400).json({ error: 'Missing title or startingPrice' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    let resolvedCategoryId = categoryId as string | undefined;

    if (!resolvedCategoryId && category) {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          name: {
            equals: String(category),
            mode: 'insensitive',
          },
        },
      });

      if (categoryRecord) {
        resolvedCategoryId = categoryRecord.id;
      }
    }

    if (!resolvedCategoryId) {
      const fallbackCategory = await prisma.category.findFirst({
        where: { name: { equals: 'General', mode: 'insensitive' } },
      });

      if (!fallbackCategory) {
        const createdCategory = await prisma.category.create({
          data: {
            name: 'General',
            slug: 'general',
            description: 'General services',
          },
        });
        resolvedCategoryId = createdCategory.id;
      } else {
        resolvedCategoryId = fallbackCategory.id;
      }
    }

    const service = await prisma.service.create({
      data: {
        vendorId: vendor.id,
        categoryId: resolvedCategoryId,
        title,
        description: description ?? null,
        startingPrice: parseFloat(String(startingPrice)),
        priceType: priceType ?? 'FIXED',
        duration: duration ?? null,
        location: location ?? null,
        coverImage: coverImage ?? null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      },
    });

    return res.status(201).json({
      message: 'Service created successfully',
      service,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error creating service' });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const { search, category, location, city, minPrice, maxPrice, isAvailable, sortBy, page = '1', limit = '20' } = req.query;

    const whereClause: any = { isAvailable: isAvailable !== 'false' };
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Category filter
    if (category) {
      whereClause.category = {
        is: {
          name: {
            contains: String(category),
            mode: 'insensitive',
          },
        },
      };
    }

    // Location filter
    if (city || location) {
      const locTerm = String(city || location);
      whereClause.vendor = {
        is: {
          city: {
            contains: locTerm,
            mode: 'insensitive',
          },
        },
      };
    }

    // Price range filter
    const minPriceVal = minPrice ? parseFloat(String(minPrice)) : undefined;
    const maxPriceVal = maxPrice ? parseFloat(String(maxPrice)) : undefined;
    if (minPriceVal !== undefined || maxPriceVal !== undefined) {
      whereClause.startingPrice = {};
      if (minPriceVal !== undefined) whereClause.startingPrice.gte = minPriceVal;
      if (maxPriceVal !== undefined) whereClause.startingPrice.lte = maxPriceVal;
    }

    // Text search
    if (search) {
      const searchTerm = String(search);
      whereClause.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    // Sorting
    const orderByClause: any = { createdAt: 'desc' };
    switch (String(sortBy)) {
      case 'price-asc':
        Object.assign(orderByClause, { startingPrice: 'asc' });
        break;
      case 'price-desc':
        Object.assign(orderByClause, { startingPrice: 'desc' });
        break;
      case 'newest':
        Object.assign(orderByClause, { createdAt: 'desc' });
        break;
      case 'oldest':
        Object.assign(orderByClause, { createdAt: 'asc' });
        break;
    }

    const total = await prisma.service.count({ where: whereClause });

    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        vendor: {
          select: {
            businessName: true,
            ownerName: true,
            category: true,
            logo: true,
            city: true,
            state: true,
          },
        },
        category: true,
      },
    });

    return res.status(200).json({ services });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching services' });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            businessName: true,
            ownerName: true,
            category: true,
            logo: true,
            city: true,
            state: true,
          },
        },
        category: true,
      },
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    return res.status(200).json({ service });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error fetching service' });
  }
}
