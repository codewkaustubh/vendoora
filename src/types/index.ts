/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Prototype/offline shapes kept for reference. Live API-driven views use the
 * `Api*` interfaces and `VendorCardModel` below.
 */
export interface Category {
  id: string;
  label: string;
  iconName: string;
  gradient: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  startingPrice: number;
  distance: number;
  image: string;
  isVerified: boolean;
  reviewsCount: number;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair';
  location: string;
  image: string;
}

export interface Reel {
  id: string;
  thumbnail: string;
  title: string;
  views: string;
  duration?: string;
}

export interface UpcomingEvent {
  id: string;
  eventName: string;
  clientName: string;
  date: string;
  time: string; // e.g. "14:00"
  location: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface InventoryItem {
  id: string;
  name: string;
  units: number;
  hourlyRate: number;
  dailyRate: number;
  image: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'CLIENT' | 'VENDOR' | 'ADMIN';
  vendorId?: string | null;
  vendor?: {
    id: string;
    businessName?: string;
    ownerName?: string;
    category?: string;
    city?: string;
    state?: string;
    logo?: string | null;
    coverImage?: string | null;
    rating?: number;
    totalReviews?: number;
    totalBookings?: number;
    verificationStatus?: string;
    acceptingBookings?: boolean;
    [key: string]: any;
  } | null;
}

/* -------------------------------------------------------------------------
 * API response shapes. These mirror the Prisma models returned by the
 * Express controllers (see docs/API_SPEC.md) and are the canonical shapes
 * for everything fetched from /api.
 * ---------------------------------------------------------------------- */

/** Prisma `ProductCondition` enum, returned verbatim by the marketplace API. */
export type ProductCondition = 'MINT' | 'EXCELLENT' | 'GOOD' | 'FAIR';

/** Prisma `VerificationStatus` enum. */
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

/** Prisma `BookingStatus` enum. */
export type BookingStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';

/** Prisma `PaymentStatus` enum. */
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

/** Prisma `OrderStatus` enum. */
export type OrderStatus = 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/** `GET /api/vendors`, `GET /api/vendors/:id`, `GET /api/search?type=vendors` */
export interface ApiVendor {
  id: string;
  userId?: string;
  businessName: string;
  businessDescription?: string | null;
  ownerName: string;
  category: string;
  phone?: string | null;
  email?: string | null;
  gstNumber?: string | null;
  city: string;
  state: string;
  address?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  verificationStatus: VerificationStatus;
  acceptingBookings: boolean;
  createdAt?: string;
  updatedAt?: string;
  inventory?: ApiInventoryItem[];
}

/** `GET /api/services`, `GET /api/services/:id` */
export interface ApiService {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  description?: string | null;
  startingPrice: number;
  priceType?: 'FIXED' | 'HOURLY' | 'DAILY';
  duration?: string | null;
  location?: string | null;
  coverImage?: string | null;
  isAvailable: boolean;
  vendor?: Pick<ApiVendor, 'businessName' | 'ownerName' | 'category' | 'logo' | 'city' | 'state'>;
  category?: { id: string; name: string };
}

/** `GET /api/marketplace/products`, `GET /api/search?type=products` */
export interface ApiProduct {
  id: string;
  sellerId: string;
  name: string;
  description?: string | null;
  price: number;
  aiSuggestedPrice?: number | null;
  condition: ProductCondition;
  location: string;
  image: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
  seller?: { id: string; name: string; email: string };
}

/** `GET /api/reels`, `GET /api/search?type=reels` — note `views` is numeric. */
export interface ApiReel {
  id: string;
  vendorId: string;
  title: string;
  thumbnail: string;
  views: number;
  duration?: string | null;
  createdAt?: string;
  vendor?: { businessName: string; ownerName: string; category: string; logo?: string | null };
}

/** `GET /api/inventory` is nested under a vendor response as `inventory`. */
export interface ApiInventoryItem {
  id: string;
  vendorId: string;
  name: string;
  units: number;
  hourlyRate: number;
  dailyRate: number;
  image: string;
}

/** `GET /api/categories` — Prisma `Category` rows returned verbatim. */
export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
}

/**
 * Display model consumed by the vendor card components. Derived from
 * {@link ApiVendor} plus its cheapest service price, so the cards never
 * fabricate fields the API does not return.
 */
export interface VendorCardModel {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  image: string;
  location: string;
  /** Lowest `Service.startingPrice` for the vendor, when one exists. */
  startingPrice?: number;
  /** Only present when the API genuinely exposes a distance. */
  distance?: number;
}
