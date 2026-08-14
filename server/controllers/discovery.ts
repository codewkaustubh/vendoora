import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function searchDiscovery(req: Request, res: Response) {
  try {
    const {
      q = '',
      type = 'all', // all, vendors, services, products
      category,
      city,
      state,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'rating',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(String(page)) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(limit)) || 12));
    const skip = (pageNum - 1) * pageSize;
    const searchTerm = String(q).trim();

    const results: any = {
      vendors: null,
      services: null,
      products: null,
    };

    // Search vendors
    if (type === 'all' || type === 'vendors') {
      const vendorWhere: any = {};

      if (category) {
        vendorWhere.category = {
          contains: String(category),
          mode: 'insensitive',
        };
      }

      if (city) {
        vendorWhere.city = {
          contains: String(city),
          mode: 'insensitive',
        };
      }

      if (state) {
        vendorWhere.state = {
          contains: String(state),
          mode: 'insensitive',
        };
      }

      const minRatingVal = minRating ? parseFloat(String(minRating)) : 0;
      if (minRatingVal > 0) {
        vendorWhere.rating = { gte: minRatingVal };
      }

      if (searchTerm) {
        vendorWhere.OR = [
          { businessName: { contains: searchTerm, mode: 'insensitive' } },
          { ownerName: { contains: searchTerm, mode: 'insensitive' } },
          { businessDescription: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const vendorOrder: any = { rating: 'desc' };
      if (sortBy === 'newest') vendorOrder.createdAt = 'desc';
      if (sortBy === 'bookings') vendorOrder.totalBookings = 'desc';

      const vendorTotal = await prisma.vendor.count({ where: vendorWhere });
      const vendors = await prisma.vendor.findMany({
        where: vendorWhere,
        orderBy: vendorOrder,
        skip,
        take: pageSize,
        include: { inventory: true },
      });

      results.vendors = {
        items: vendors,
        total: vendorTotal,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(vendorTotal / pageSize),
      };
    }

    // Search services
    if (type === 'all' || type === 'services') {
      const serviceWhere: any = { isAvailable: true };

      if (category) {
        serviceWhere.category = {
          is: {
            name: { contains: String(category), mode: 'insensitive' },
          },
        };
      }

      if (city) {
        serviceWhere.vendor = {
          is: {
            city: { contains: String(city), mode: 'insensitive' },
          },
        };
      }

      const minPriceVal = minPrice ? parseFloat(String(minPrice)) : undefined;
      const maxPriceVal = maxPrice ? parseFloat(String(maxPrice)) : undefined;
      if (minPriceVal !== undefined || maxPriceVal !== undefined) {
        serviceWhere.startingPrice = {};
        if (minPriceVal !== undefined) serviceWhere.startingPrice.gte = minPriceVal;
        if (maxPriceVal !== undefined) serviceWhere.startingPrice.lte = maxPriceVal;
      }

      if (searchTerm) {
        serviceWhere.OR = [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const serviceOrder: any = { createdAt: 'desc' };
      if (sortBy === 'price-asc') serviceOrder.startingPrice = 'asc';
      if (sortBy === 'price-desc') serviceOrder.startingPrice = 'desc';

      const serviceTotal = await prisma.service.count({ where: serviceWhere });
      const services = await prisma.service.findMany({
        where: serviceWhere,
        orderBy: serviceOrder,
        skip,
        take: pageSize,
        include: {
          vendor: {
            select: { businessName: true, rating: true, city: true },
          },
          category: { select: { name: true } },
        },
      });

      results.services = {
        items: services,
        total: serviceTotal,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(serviceTotal / pageSize),
      };
    }

    // Search products
    if (type === 'all' || type === 'products') {
      const productWhere: any = { available: true };

      if (searchTerm) {
        productWhere.OR = [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      if (location) {
        productWhere.location = {
          contains: String(location),
          mode: 'insensitive',
        };
      }

      const minPriceVal = minPrice ? parseFloat(String(minPrice)) : undefined;
      const maxPriceVal = maxPrice ? parseFloat(String(maxPrice)) : undefined;
      if (minPriceVal !== undefined || maxPriceVal !== undefined) {
        productWhere.price = {};
        if (minPriceVal !== undefined) productWhere.price.gte = minPriceVal;
        if (maxPriceVal !== undefined) productWhere.price.lte = maxPriceVal;
      }

      const productOrder: any = { createdAt: 'desc' };
      if (sortBy === 'price-asc') productOrder.price = 'asc';
      if (sortBy === 'price-desc') productOrder.price = 'desc';

      const productTotal = await prisma.product.count({ where: productWhere });
      const products = await prisma.product.findMany({
        where: productWhere,
        orderBy: productOrder,
        skip,
        take: pageSize,
        include: { seller: { select: { name: true, email: true, id: true } } },
      });

      results.products = {
        items: products,
        total: productTotal,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(productTotal / pageSize),
      };
    }

    return res.status(200).json(results);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Server error searching discovery' });
  }
}
