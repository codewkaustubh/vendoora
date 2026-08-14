import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getAll(req: Request, res: Response) {
  try {
    const { category, search, location, city, state, minRating, sortBy, page = '1', limit = '20' } = req.query;

    const whereClause: any = {};
    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));
    const skip = (pageNum - 1) * pageSize;

    // Category filter
    if (category) {
      whereClause.category = {
        contains: String(category),
        mode: 'insensitive',
      };
    }

    // Location filters (city/state)
    if (city) {
      whereClause.city = {
        contains: String(city),
        mode: 'insensitive',
      };
    }
    if (state) {
      whereClause.state = {
        contains: String(state),
        mode: 'insensitive',
      };
    }

    // Rating filter
    const minRatingVal = parseFloat(String(minRating || '0'));
    if (minRatingVal > 0) {
      whereClause.rating = {
        gte: minRatingVal,
      };
    }

    // Text search
    const orConditions: any[] = [];
    if (search) {
      const searchTerm = String(search);
      orConditions.push(
        { businessName: { contains: searchTerm, mode: 'insensitive' } },
        { ownerName: { contains: searchTerm, mode: 'insensitive' } },
        { businessDescription: { contains: searchTerm, mode: 'insensitive' } },
      );
    }
    if (location && !city && !state) {
      const locationTerm = String(location);
      orConditions.push(
        { city: { contains: locationTerm, mode: 'insensitive' } },
        { state: { contains: locationTerm, mode: 'insensitive' } },
      );
    }
    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }

    // Sorting
    const orderByClause: any = { rating: 'desc' };
    switch (String(sortBy)) {
      case 'rating':
        Object.assign(orderByClause, { rating: 'desc' });
        break;
      case 'newest':
        Object.assign(orderByClause, { createdAt: 'desc' });
        break;
      case 'oldest':
        Object.assign(orderByClause, { createdAt: 'asc' });
        break;
      case 'reviews':
        Object.assign(orderByClause, { totalReviews: 'desc' });
        break;
      case 'bookings':
        Object.assign(orderByClause, { totalBookings: 'desc' });
        break;
    }

    // Get total count for pagination
    const total = await prisma.vendor.count({ where: whereClause });

    const vendors = await prisma.vendor.findMany({
      where: whereClause,
      include: {
        inventory: true,
      },
      orderBy: orderByClause,
      skip,
      take: pageSize,
    });

    return res.status(200).json({
      vendors,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
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
    const {
      name,
      category,
      location,
      image,
      acceptingBookings,
      businessName,
      ownerName,
      city,
      state,
      logo,
      coverImage,
      verificationStatus,
      verified,
      businessDescription,
    } = req.body;

    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor profile not found' });
    }

    const locationParts =
      typeof location === 'string'
        ? location
            .split(',')
            .map((segment: string) => segment.trim())
            .filter(Boolean)
        : [];

    const resolvedCity = city ?? locationParts[0] ?? vendor.city;
    const resolvedState = state ?? locationParts[1] ?? vendor.state;
    const resolvedBusinessName = businessName ?? name ?? vendor.businessName;
    const resolvedOwnerName = ownerName ?? vendor.ownerName;
    const resolvedLogo = logo ?? image ?? vendor.logo;
    const resolvedCoverImage = coverImage ?? image ?? vendor.coverImage;
    const resolvedVerificationStatus =
      verificationStatus ?? (verified === undefined ? vendor.verificationStatus : verified ? 'VERIFIED' : 'REJECTED');

    const updated = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        businessName: resolvedBusinessName,
        ownerName: resolvedOwnerName,
        category: category !== undefined ? category : vendor.category,
        city: resolvedCity,
        state: resolvedState,
        logo: resolvedLogo,
        coverImage: resolvedCoverImage,
        verificationStatus: resolvedVerificationStatus,
        acceptingBookings: acceptingBookings !== undefined ? acceptingBookings : vendor.acceptingBookings,
        ...(businessDescription !== undefined ? { businessDescription } : {}),
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
