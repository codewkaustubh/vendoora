import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getAll(req: Request, res: Response) {
  try {
    const { category, search, location } = req.query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = {
        contains: String(category),
        mode: 'insensitive',
      };
    }

    const orConditions: any[] = [];

    if (search) {
      const searchTerm = String(search);
      orConditions.push(
        { businessName: { contains: searchTerm, mode: 'insensitive' } },
        { ownerName: { contains: searchTerm, mode: 'insensitive' } },
        { category: { contains: searchTerm, mode: 'insensitive' } },
      );
    }

    if (location) {
      const locationTerm = String(location);
      orConditions.push(
        { city: { contains: locationTerm, mode: 'insensitive' } },
        { state: { contains: locationTerm, mode: 'insensitive' } },
      );
    }

    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
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
