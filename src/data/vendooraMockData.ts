/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Vendor, Product, Reel, UpcomingEvent, InventoryItem } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'venues', label: 'Venues', iconName: 'MapPinHouse', gradient: 'from-blue-500/10 to-indigo-500/10' },
  { id: 'catering', label: 'Catering', iconName: 'UtensilsCrossed', gradient: 'from-amber-500/10 to-orange-500/10' },
  { id: 'decor', label: 'Decor', iconName: 'Sparkles', gradient: 'from-pink-500/10 to-rose-500/10' },
  { id: 'tent-house', label: 'Tent House', iconName: 'Tent', gradient: 'from-emerald-500/10 to-teal-500/10' },
  { id: 'cooling', label: 'Cooling', iconName: 'Snowflake', gradient: 'from-cyan-500/10 to-blue-500/10' },
  { id: 'sound-dj', label: 'Sound/DJ', iconName: 'Music', gradient: 'from-purple-500/10 to-violet-500/10' },
  { id: 'lighting', label: 'Lighting', iconName: 'Lightbulb', gradient: 'from-yellow-500/10 to-amber-500/10' },
  { id: 'manpower', label: 'Manpower', iconName: 'Users', gradient: 'from-indigo-500/10 to-sky-500/10' },
  { id: 'photo-video', label: 'Photo/Video', iconName: 'Camera', gradient: 'from-violet-500/10 to-fuchsia-500/10' },
  { id: 'mehendi', label: 'Mehendi', iconName: 'Palette', gradient: 'from-orange-500/10 to-red-500/10' },
  { id: 'disposables', label: 'Disposables', iconName: 'Flame', gradient: 'from-slate-500/10 to-zinc-500/10' },
  { id: 'transport', label: 'Transport', iconName: 'Truck', gradient: 'from-teal-500/10 to-green-500/10' },
];

export const VENDORS: Vendor[] = [
  {
    id: 'v-1',
    name: 'The Royal Palace Banquet & Lawns',
    category: 'Venues',
    rating: 4.8,
    startingPrice: 120000,
    distance: 2.4,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    reviewsCount: 142,
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'v-2',
    name: 'Zaika Shahi Caterers',
    category: 'Catering',
    rating: 4.7,
    startingPrice: 850, // Per plate
    distance: 3.1,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    reviewsCount: 96,
    location: 'Delhi NCR'
  },
  {
    id: 'v-3',
    name: 'Dreamscape Floral & Theme Decors',
    category: 'Decor',
    rating: 4.9,
    startingPrice: 45000,
    distance: 1.8,
    image: 'https://images.unsplash.com/photo-1519225495810-7517c296517a?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    reviewsCount: 204,
    location: 'Bangalore, Karnataka'
  },
  {
    id: 'v-4',
    name: 'Sharma Tent & Light House',
    category: 'Tent House',
    rating: 4.4,
    startingPrice: 25000,
    distance: 4.5,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    isVerified: false,
    reviewsCount: 38,
    location: 'Jaipur, Rajasthan'
  },
  {
    id: 'v-5',
    name: 'FreezeFlow Event Air Conditioning & Cooling',
    category: 'Cooling',
    rating: 4.6,
    startingPrice: 15000,
    distance: 5.2,
    image: 'https://images.unsplash.com/photo-1585338111557-14cb2c002256?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    reviewsCount: 55,
    location: 'Udaipur, Rajasthan'
  },
  {
    id: 'v-6',
    name: 'Decibel Pro DJ & Arena Sound System',
    category: 'Sound/DJ',
    rating: 4.9,
    startingPrice: 35000,
    distance: 0.9,
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
    isVerified: true,
    reviewsCount: 189,
    location: 'Goa'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'JBL VRX Line Array Sound System (Set of 4)',
    price: 185000,
    condition: 'Excellent',
    location: 'Mumbai, MH',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p-2',
    name: 'Waterproof German Hanger Tent structure (100x60ft)',
    price: 420000,
    condition: 'Mint',
    location: 'Delhi, NCR',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p-3',
    name: 'Heavy Duty 5-Ton Ductable AC Units for Banquets',
    price: 65000,
    condition: 'Good',
    location: 'Ahmedabad, GJ',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p-4',
    name: 'Pixel LED Dance Floor Tiles (64 Pcs Bundle)',
    price: 120000,
    condition: 'Fair',
    location: 'Bangalore, KA',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800'
  }
];

export const REELS: Reel[] = [
  {
    id: 'r-1',
    thumbnail: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=500',
    title: 'Grand Maharaja Wedding Entrance Setup 🌸✨',
    views: '45.2K',
    duration: '0:15'
  },
  {
    id: 'r-2',
    thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
    title: 'Sufi Night Stage Lighting & Fog Effects 🧊🔥',
    views: '28.9K',
    duration: '0:12'
  },
  {
    id: 'r-3',
    thumbnail: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=500',
    title: '1200 Guest Live Catering Dessert Island Setup 🍨🍰',
    views: '89.1K',
    duration: '0:15'
  },
  {
    id: 'r-4',
    thumbnail: 'https://images.unsplash.com/photo-1519225495810-7517c296517a?auto=format&fit=crop&q=80&w=500',
    title: 'Pastel Themed Outdoor Mehendi Ceremony Decors 🌸🎈',
    views: '12.4K',
    duration: '0:14'
  }
];

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: 'e-1',
    eventName: 'Mehta Grand Wedding Reception',
    clientName: 'Rajesh Mehta',
    date: '2026-07-10',
    time: '18:00',
    location: 'Royal Palace Lawns, Mumbai',
    status: 'in_progress'
  },
  {
    id: 'e-2',
    eventName: 'Corporate Excellence Gala 2026',
    clientName: 'Tata Consultancy Services',
    date: '2026-07-12',
    time: '19:30',
    location: 'Grand Ballroom, Taj Lands End',
    status: 'pending'
  },
  {
    id: 'e-3',
    eventName: 'Sharma Anniversary Celebration',
    clientName: 'Anil Sharma',
    date: '2026-07-15',
    time: '20:00',
    location: 'Emerald Hall, Powai',
    status: 'pending'
  }
];

export const INVENTORY: InventoryItem[] = [
  {
    id: 'i-1',
    name: 'Premium White Royal Sofas (Cushioned)',
    units: 50,
    hourlyRate: 250,
    dailyRate: 1500,
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-2',
    name: 'High-Power LED Par Lights (RGBWA+UV)',
    units: 120,
    hourlyRate: 80,
    dailyRate: 400,
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'i-3',
    name: 'Chafing Dishes for Buffet (Stainless Steel)',
    units: 80,
    hourlyRate: 50,
    dailyRate: 300,
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400'
  }
];
