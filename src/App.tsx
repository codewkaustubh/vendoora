/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import VendooraLandingPage from './pages/VendooraLandingPage';
import VendorCommandCenterPage from './pages/VendorCommandCenterPage';

// Import initial data arrays to seed state
import {
  REELS,
  INVENTORY,
  PRODUCTS,
  UPCOMING_EVENTS,
} from './data/vendooraMockData';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'inquiry' | 'payment' | 'system' | 'alert';
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    title: 'New Booking Inquiry',
    message: 'Rajesh Mehta has requested a booking for Royal Palace Lawns, Mumbai on 2026-07-10.',
    time: '2 mins ago',
    type: 'inquiry',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Payout Disbursed',
    message: 'Disbursement of ₹1,45,000 has been securely settled to your linked HDFC bank account.',
    time: '2 hours ago',
    type: 'payment',
    read: true,
  },
  {
    id: 'n-3',
    title: 'Profile Verified',
    message: 'Sharma Tent House profile has passed automatic GSTIN validation and verification checks.',
    time: '1 day ago',
    type: 'system',
    read: true,
  },
  {
    id: 'n-4',
    title: 'Low Inventory Alert',
    message: 'Premium White Royal Sofas is near-fully booked for upcoming peak dates (July 12-15).',
    time: '2 days ago',
    type: 'alert',
    read: false,
  }
];

export default function App() {
  const [vendorMode, setVendorMode] = useState(false);

  // Central Database / Shared State across Consumer & Vendor Mode
  const [reels, setReels] = useState<any[]>(REELS);
  const [inventory, setInventory] = useState<any[]>(INVENTORY);
  const [products, setProducts] = useState<any[]>(PRODUCTS);
  const [bookings, setBookings] = useState<any[]>(UPCOMING_EVENTS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Sync dark class on document element if needed, though pages maintain explicit base styling
  useEffect(() => {
    if (vendorMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Scroll window to top when switching modes
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [vendorMode]);

  const handleAddReel = (newReel: any) => {
    setReels((prev) => [newReel, ...prev]);
  };

  const handleDeleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
  };

  const handleAddInventoryItem = (newItem: any) => {
    setInventory((prev) => [...prev, newItem]);
  };

  const handleUpdateInventoryItemRates = (itemId: string, hourly: number, daily: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, hourlyRate: hourly, dailyRate: daily }
          : item
      )
    );
  };

  const handleAddProduct = (newProduct: any) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleAddBooking = (newBooking: any) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleUpdateBookings = (newBookings: any[]) => {
    setBookings(newBookings);
  };

  const handleAddNotification = (newNotification: any) => {
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div id="vendoora-app-root">
      {!vendorMode ? (
        <VendooraLandingPage
          id="consumer-landing"
          onSwitchToVendor={() => setVendorMode(true)}
          reels={reels}
          products={products}
          bookings={bookings}
          onAddBooking={handleAddBooking}
          onAddNotification={handleAddNotification}
        />
      ) : (
        <VendorCommandCenterPage
          id="vendor-dashboard"
          onBackToUserMode={() => setVendorMode(false)}
          reels={reels}
          onAddReel={handleAddReel}
          onDeleteReel={handleDeleteReel}
          inventory={inventory}
          onAddInventoryItem={handleAddInventoryItem}
          onUpdateInventoryItemRates={handleUpdateInventoryItemRates}
          products={products}
          onAddProduct={handleAddProduct}
          bookings={bookings}
          onUpdateBookings={handleUpdateBookings}
          onAddBooking={handleAddBooking}
          notifications={notifications}
          onAddNotification={handleAddNotification}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />
      )}
    </div>
  );
}
