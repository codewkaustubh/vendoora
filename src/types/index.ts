/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
