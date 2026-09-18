import { ApiService, ApiVendor, VendorCardModel } from '../types';

/**
 * Maps vendor API records onto the display model used by the vendor cards.
 * Only real API fields are surfaced: `distance` is never fabricated and
 * `startingPrice` reflects the vendor's cheapest published service.
 */
export function toVendorCardModel(vendor: ApiVendor, services: ApiService[] = []): VendorCardModel {
  const prices = services
    .filter((service) => service.vendorId === vendor.id)
    .map((service) => Number(service.startingPrice))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    id: vendor.id,
    name: vendor.businessName,
    category: vendor.category,
    rating: Number(vendor.rating || 0),
    reviewsCount: vendor.totalReviews || 0,
    isVerified: vendor.verificationStatus === 'VERIFIED',
    image: vendor.logo || vendor.coverImage || '',
    location: [vendor.city, vendor.state].filter(Boolean).join(', '),
    ...(prices.length ? { startingPrice: Math.min(...prices) } : {}),
  };
}

export function toVendorCardModels(vendors: ApiVendor[], services: ApiService[] = []): VendorCardModel[] {
  return vendors.map((vendor) => toVendorCardModel(vendor, services));
}