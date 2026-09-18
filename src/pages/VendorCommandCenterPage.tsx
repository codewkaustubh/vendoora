/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiRequest } from '../lib/api';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarClock,
  CalendarDays,
  Boxes,
  Coins,
  Recycle,
  Video,
  BellRing,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Star,
  Award,
  ArrowLeft,
  Timer,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Check,
  AlertCircle,
  Filter,
  Pencil,
} from 'lucide-react';
import HeaderBar from '../components/layout/HeaderBar';
import { Button, Input, Badge, Card, Toggle } from '../components/design-system';
import { computeSuggestedPrice } from '../components/command-center/aiPricing';
import VendorAnalyticsRow from '../components/command-center/VendorAnalyticsRow';
import type { AuthUser } from '../types';

// Types for local support
interface VendorCommandCenterPageProps {
  currentUser: AuthUser | null;
  id?: string;
  onBackToUserMode: () => void;
  reels: any[];
  onAddReel: (reel: any) => void;
  onDeleteReel: (reelId: string) => void;
  inventory: any[];
  onAddInventoryItem: (item: any) => void;
  onUpdateInventoryItemRates: (itemId: string, hourly: number, daily: number) => void;
  products: any[];
  onAddProduct: (prod: any) => void;
    onOpenAuth?: (mode?: 'login' | 'register', role?: 'CLIENT' | 'VENDOR') => void;
  onLogout?: () => void;
}

export default function VendorCommandCenterPage({
  currentUser: incomingCurrentUser,
  id,
  onBackToUserMode,
  reels,
  onAddReel,
  onDeleteReel,
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItemRates,
    products,
  onAddProduct,
  onOpenAuth,
  onLogout,
}: VendorCommandCenterPageProps) {
  // Navigation & Control States
  const [activeTab, setActiveTab] = useState<'analytics' | 'bookings' | 'availability' | 'inventory' | 'pricing' | 'seller' | 'reels' | 'notifications'>('analytics');
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const [availability, setAvailability] = useState<any[]>([]);
  const [blackouts, setBlackouts] = useState<any[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().slice(0, 10));
  const [availabilityStart, setAvailabilityStart] = useState('09:00');
  const [availabilityEnd, setAvailabilityEnd] = useState('17:00');
  const [blackoutStart, setBlackoutStart] = useState(new Date().toISOString().slice(0, 10));
  const [blackoutEnd, setBlackoutEnd] = useState(new Date().toISOString().slice(0, 10));
  const [blackoutReason, setBlackoutReason] = useState('');
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [editingBlackoutId, setEditingBlackoutId] = useState<string | null>(null);

  // New Inventory Form State
  const [newInvName, setNewInvName] = useState('');
  const [newInvUnits, setNewInvUnits] = useState(10);
  const [newInvHourly, setNewInvHourly] = useState(150);
  const [newInvDaily, setNewInvDaily] = useState(1000);
  const [newInvImagePreset, setNewInvImagePreset] = useState('sofa');
  const [newInvUploadFile, setNewInvUploadFile] = useState<File | null>(null);
  const [newInvUploadPreview, setNewInvUploadPreview] = useState<string | null>(null);
  const [newInvUploadLoading, setNewInvUploadLoading] = useState(false);
  const [newInvUploadError, setNewInvUploadError] = useState<string | null>(null);

  // New Used Gear Form State
  const [newGearName, setNewGearName] = useState('');
  const [newGearRetail, setNewGearRetail] = useState(30000);
  const [newGearCondition, setNewGearCondition] = useState<'Mint' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [newGearAge, setNewGearAge] = useState(6);
  const [newGearUploadFile, setNewGearUploadFile] = useState<File | null>(null);
  const [newGearUploadPreview, setNewGearUploadPreview] = useState<string | null>(null);
  const [newGearUploadLoading, setNewGearUploadLoading] = useState(false);
  const [newGearUploadError, setNewGearUploadError] = useState<string | null>(null);

  // Reels form state
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelUploadFile, setNewReelUploadFile] = useState<File | null>(null);
  const [newReelUploadPreview, setNewReelUploadPreview] = useState<string | null>(null);
  const [newReelUploadLoading, setNewReelUploadLoading] = useState(false);
  const [newReelUploadError, setNewReelUploadError] = useState<string | null>(null);

  // Dynamic AI Pricing Tool States
  const [calcBase, setCalcBase] = useState(15000);
  const [calcSeason, setCalcSeason] = useState<'Standard' | 'Peak' | 'Off'>('Standard');
  const [calcDistance, setCalcDistance] = useState(15);
  const [calcCrew, setCalcCrew] = useState(4);

  // Real authenticated user/vendor context for media uploads
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(incomingCurrentUser);
  const [currentVendor, setCurrentVendor] = useState<any>(null);
  const [currentVendorServices, setCurrentVendorServices] = useState<any[]>([]);

  // Profile / vendor / service media upload state
  const [profileUploadFile, setProfileUploadFile] = useState<File | null>(null);
  const [profileUploadPreview, setProfileUploadPreview] = useState<string | null>(null);
  const [profileUploadLoading, setProfileUploadLoading] = useState(false);
  const [profileUploadError, setProfileUploadError] = useState<string | null>(null);
  const [vendorLogoUploadFile, setVendorLogoUploadFile] = useState<File | null>(null);
  const [vendorLogoUploadPreview, setVendorLogoUploadPreview] = useState<string | null>(null);
  const [vendorLogoUploadLoading, setVendorLogoUploadLoading] = useState(false);
  const [vendorLogoUploadError, setVendorLogoUploadError] = useState<string | null>(null);
  const [vendorCoverUploadFile, setVendorCoverUploadFile] = useState<File | null>(null);
  const [vendorCoverUploadPreview, setVendorCoverUploadPreview] = useState<string | null>(null);
  const [vendorCoverUploadLoading, setVendorCoverUploadLoading] = useState(false);
  const [vendorCoverUploadError, setVendorCoverUploadError] = useState<string | null>(null);
  const [serviceCoverUploadFile, setServiceCoverUploadFile] = useState<File | null>(null);
  const [serviceCoverUploadPreview, setServiceCoverUploadPreview] = useState<string | null>(null);
  const [serviceCoverUploadLoading, setServiceCoverUploadLoading] = useState(false);
  const [serviceCoverUploadError, setServiceCoverUploadError] = useState<string | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [receivedReviews, setReceivedReviews] = useState<any[]>([]);
  const [persistedNotifications, setPersistedNotifications] = useState<any[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [notificationsSaving, setNotificationsSaving] = useState(false);
  const markNotificationsRead = async (id?: string) => {
    setNotificationError(null);
    setNotificationsSaving(true);
    try {
      await apiRequest(id ? `/api/notifications/${id}/read` : '/api/notifications/read-all', { method: 'PUT' });
      setPersistedNotifications((current) => current.map((item) => !id || item.id === id ? { ...item, read: true } : item));
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Unable to mark notifications read');
    } finally { setNotificationsSaving(false); }
  };
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const bookings = vendorBookings.map((booking) => ({ ...booking,
    status: booking.status.toLowerCase(), clientName: booking.client?.name || 'Customer',
    date: String(booking.eventDate).slice(0, 10), time: booking.startTime, location: booking.venue,
  }));
  const [bookingError, setBookingError] = useState<string | null>(null);

  const profileUploadTargetId = currentUser?.id || null;
  const vendorUploadTargetId = currentVendor?.id || null;
  const serviceCoverTargetId = currentVendorServices[0]?.id || null;

  const [notifFilter, setNotifFilter] = useState<'all' | 'inquiry' | 'payment' | 'system' | 'alert'>('all');

  useEffect(() => {
    const loadAuthenticatedSession = async () => {
      const token = localStorage.getItem('vendoora_token');
      if (!token) return;

      try {
        const meResponse = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meResponse.ok) return;

        const mePayload = await meResponse.json();
        const user = mePayload?.user;

        if (!user) return;

        setCurrentUser(user);

        const vendorId = user?.vendor?.id || user?.vendorId || null;
        if (vendorId) {
          const vendorResponse = await fetch(`/api/vendors/${vendorId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const vendorPayload = await vendorResponse.json();
          if (vendorPayload?.vendor) {
            setCurrentVendor(vendorPayload.vendor);
            setAcceptingBookings(vendorPayload.vendor.acceptingBookings !== false);
          }
          const availabilityResponse = await fetch('/api/availability', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const availabilityPayload = await availabilityResponse.json();
          setAvailability(Array.isArray(availabilityPayload?.availability) ? availabilityPayload.availability : []);
          setBlackouts(Array.isArray(availabilityPayload?.blackouts) ? availabilityPayload.blackouts : []);
          setAcceptingBookings(availabilityPayload?.acceptingBookings !== false);
          const paymentSummaryResponse = await fetch('/api/payments/vendor/summary', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (paymentSummaryResponse.ok) setPaymentSummary(await paymentSummaryResponse.json());
          const ordersResponse = await fetch('/api/orders/vendor', { headers: { Authorization: `Bearer ${token}` } });
          const ordersPayload = await ordersResponse.json().catch(() => ({}));
          if (ordersResponse.ok) setOrders(Array.isArray(ordersPayload?.orders) ? ordersPayload.orders : []);
          const reviewsResponse = await fetch('/api/reviews/vendor', { headers: { Authorization: `Bearer ${token}` } });
          const reviewsPayload = await reviewsResponse.json().catch(() => ({}));
          if (reviewsResponse.ok) setReceivedReviews(Array.isArray(reviewsPayload?.reviews) ? reviewsPayload.reviews : []);
          const notificationsResponse = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
          const notificationsPayload = await notificationsResponse.json().catch(() => ({}));
          if (notificationsResponse.ok) setPersistedNotifications(Array.isArray(notificationsPayload?.notifications) ? notificationsPayload.notifications : []);
          const bookingsResponse = await fetch('/api/bookings/vendor', { headers: { Authorization: `Bearer ${token}` } });
          const bookingsPayload = await bookingsResponse.json().catch(() => ({}));
          if (bookingsResponse.ok) setVendorBookings(Array.isArray(bookingsPayload?.bookings) ? bookingsPayload.bookings : []);
        }

        const servicesResponse = await fetch('/api/services');
        const servicesPayload = await servicesResponse.json();
        const vendorServices = Array.isArray(servicesPayload?.services)
          ? servicesPayload.services.filter((service: any) => service.vendorId === vendorId || service.vendor?.id === vendorId)
          : [];
        setCurrentVendorServices(vendorServices);
      } catch (error) {
        console.warn('Unable to load authenticated media context:', error);
      }
    };

    loadAuthenticatedSession();
  }, []);

  const updateAcceptingBookings = async (value: boolean) => {
    const previousValue = acceptingBookings;
    setAcceptingBookings(value);
    const token = localStorage.getItem('vendoora_token');
    if (!token) return;

    try {
      const response = await fetch('/api/vendors/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ acceptingBookings: value }),
      });
      if (!response.ok) throw new Error('Unable to persist booking availability');
    } catch (error) {
      setAcceptingBookings(previousValue);
      window.alert(error instanceof Error ? error.message : 'Unable to persist booking availability');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) return;
    setOrderError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Unable to update order status');
      setOrders((current) => current.map((order) => order.id === orderId ? { ...order, ...payload.order } : order));
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Unable to update order status');
    }
  };

  const nextOrderStatus: Record<string, string | undefined> = {
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'IN_PROGRESS',
    IN_PROGRESS: 'COMPLETED',
  };

  const availabilityRequest = async (path: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) throw new Error('Vendor authentication required');
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const payload = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Availability request failed');
    return payload;
  };

  const handleAddAvailability = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingAvailabilityId);
      const payload = await availabilityRequest(isEditing ? `/api/availability/${editingAvailabilityId}` : '/api/availability', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({ date: availabilityDate, startTime: availabilityStart, endTime: availabilityEnd }),
      });
      setAvailability((current) => {
        const next = isEditing
          ? current.map((entry) => entry.id === editingAvailabilityId ? payload.availability : entry)
          : [...current, payload.availability];
        return next.sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
      });
      setEditingAvailabilityId(null);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to add availability');
    }
  };

  const editAvailability = (entry: any) => {
    setEditingAvailabilityId(entry.id);
    setAvailabilityDate(String(entry.date).slice(0, 10));
    setAvailabilityStart(entry.startTime);
    setAvailabilityEnd(entry.endTime);
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await availabilityRequest(`/api/availability/${id}`, { method: 'DELETE' });
      setAvailability((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete availability');
    }
  };

  const handleAddBlackout = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingBlackoutId);
      const payload = await availabilityRequest(isEditing ? `/api/blackouts/${editingBlackoutId}` : '/api/blackouts', {
        method: isEditing ? 'PUT' : 'POST',
        body: JSON.stringify({ dateStart: blackoutStart, dateEnd: blackoutEnd, reason: blackoutReason }),
      });
      setBlackouts((current) => {
        const next = isEditing
          ? current.map((entry) => entry.id === editingBlackoutId ? payload.blackout : entry)
          : [...current, payload.blackout];
        return next.sort((a, b) => a.dateStart.localeCompare(b.dateStart));
      });
      setEditingBlackoutId(null);
      setBlackoutReason('');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to add blackout');
    }
  };

  const editBlackout = (entry: any) => {
    setEditingBlackoutId(entry.id);
    setBlackoutStart(String(entry.dateStart).slice(0, 10));
    setBlackoutEnd(String(entry.dateEnd).slice(0, 10));
    setBlackoutReason(entry.reason || '');
  };

  const handleDeleteBlackout = async (id: string) => {
    try {
      await availabilityRequest(`/api/blackouts/${id}`, { method: 'DELETE' });
      setBlackouts((current) => current.filter((entry) => entry.id !== id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to delete blackout');
    }
  };

  // Derive active items & counts
  const visibleNotifications = persistedNotifications;
  const unreadNotifCount = visibleNotifications.filter((n) => !n.read).length;
    const pendingBookingsCount = vendorBookings.filter((b) => b.status === 'PENDING').length;

  // Add new inventory handler
  const handleAddNewInventorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) return;

    let imageUrl = 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=400';
    if (newInvImagePreset === 'lights') {
      imageUrl = 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=400';
    } else if (newInvImagePreset === 'catering') {
      imageUrl = 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400';
    } else if (newInvImagePreset === 'tent') {
      imageUrl = 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=400';
    }

    try {
      const uploadedUrl = await uploadMediaFile({
        resourceType: 'inventoryImage',
        file: newInvUploadFile,
        targetId: vendorUploadTargetId,
        fallbackUrl: imageUrl,
        onError: setNewInvUploadError,
        onLoading: setNewInvUploadLoading,
      });
      const newItem = {
        id: `i-${Date.now()}`,
        name: newInvName,
        units: newInvUnits,
        hourlyRate: newInvHourly,
        dailyRate: newInvDaily,
        image: uploadedUrl,
      };

                  await onAddInventoryItem(newItem);

      setPersistedNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Inventory Feed Expanded',
          message: `Successfully listed "${newInvName}" (${newInvUnits} Units) in your live customer catalog.`,
          time: 'Just now',
          type: 'system',
          read: false,
        },
        ...prev,
      ]);

      setNewInvName('');
      setNewInvUploadFile(null);
      setNewInvUploadPreview(null);
      setNewInvUploadError(null);
      alert(`Success! "${newInvName}" has been added to your live inventory feed.`);
    } catch (error: any) {
      setNewInvUploadError(error?.message || 'Unable to upload the inventory image.');
    }
  };

  // Add used gear product
  const handleAddUsedGearSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newGearName.trim()) return;

    const suggestedPrice = computeSuggestedPrice(newGearRetail, newGearCondition, newGearAge);
    const fallbackImage = 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800';

    try {
      const uploadedImage = await uploadMediaFile({
        resourceType: 'productImage',
        file: newGearUploadFile,
        targetId: currentUser?.id || vendorUploadTargetId,
        fallbackUrl: fallbackImage,
        onError: setNewGearUploadError,
        onLoading: setNewGearUploadLoading,
      });

      const newProd = {
        id: `p-${Date.now()}`,
        name: newGearName,
        price: suggestedPrice,
        condition: newGearCondition,
        location: [currentVendor?.city, currentVendor?.state].filter(Boolean).join(', '),
        image: uploadedImage,
      };

      await onAddProduct(newProd);

      setPersistedNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Secondary Listing Published',
          message: `Pre-owned "${newGearName}" is now active in the Vendoora equipment marketplace. Resale Price: ₹${suggestedPrice.toLocaleString('en-IN')}.`,
          time: 'Just now',
          type: 'system',
          read: false,
        },
        ...prev,
      ]);

      setNewGearName('');
      setNewGearUploadFile(null);
      setNewGearUploadPreview(null);
      setNewGearUploadError(null);
      alert(`Success! Your equipment "${newGearName}" has been published to the secondary marketplace for users!`);
    } catch (error: any) {
      setNewGearUploadError(error?.message || 'Unable to upload marketplace image.');
    }
  };

  // Add vibe reel handler
  const handlePublishReelSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newReelTitle.trim()) return;

    const fallbackThumbnail = 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500';

    try {
      const uploadedThumbnail = await uploadMediaFile({
        resourceType: 'reelThumbnail',
        file: newReelUploadFile,
        targetId: vendorUploadTargetId,
        fallbackUrl: fallbackThumbnail,
        onError: setNewReelUploadError,
        onLoading: setNewReelUploadLoading,
      });

      const newReel = {
        id: `r-${Date.now()}`,
        title: newReelTitle,
        thumbnail: uploadedThumbnail,
        views: 0,
        duration: '0:15',
      };

      await onAddReel(newReel);

      setPersistedNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title: 'Vibe Reel Published',
          message: `Your new 15s visual showcase "${newReelTitle}" is now live on the Vendoora exploration tray.`,
          time: 'Just now',
          type: 'system',
          read: false,
        },
        ...prev,
      ]);

      setNewReelTitle('');
      setNewReelUploadFile(null);
      setNewReelUploadPreview(null);
      setNewReelUploadError(null);
      alert('Prisitine 15-second reel published live to the user feed!');
    } catch (error: any) {
      setNewReelUploadError(error?.message || 'Unable to upload the reel thumbnail.');
    }
  };

  const updateBooking = async (bookingId: string, status: string) => {
    try {
      const payload = await availabilityRequest(`/api/bookings/${bookingId}/status`, {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      setVendorBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, ...payload.booking } : booking));
    } catch (error) { setBookingError(error instanceof Error ? error.message : 'Unable to update booking'); }
  };
  const handleRejectBooking = (bookingId: string) => updateBooking(bookingId, 'DECLINED');
  const handleAcceptBooking = (bookingId: string) => updateBooking(bookingId, 'SCHEDULED');

  // Filtered Notifications
  const filteredNotifs = visibleNotifications.filter((n) => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  // Dynamic AI Pricing Calculator Heuristics
  const calculateAiQuote = () => {
    const base = calcBase;
    const seasonMultiplier = calcSeason === 'Peak' ? 1.3 : calcSeason === 'Off' ? 0.9 : 1.0;
    const distanceCost = calcDistance * 50;
    const crewCost = calcCrew * 2000;
    return Math.round((base * seasonMultiplier) + distanceCost + crewCost);
  };

  const calculatedQuote = calculateAiQuote();

  const uploadMediaFile = async ({
    resourceType,
    file,
    targetId,
    fallbackUrl,
    onError,
    onLoading,
  }: {
    resourceType: 'userProfile' | 'vendorLogo' | 'vendorCover' | 'serviceCover' | 'inventoryImage' | 'productImage' | 'reelThumbnail';
    file: File | null;
    targetId: string | null;
    fallbackUrl: string;
    onError: (message: string | null) => void;
    onLoading: (state: boolean) => void;
  }): Promise<string> => {
    if (!file) {
      return fallbackUrl;
    }

    if (!targetId) {
      onError('No authenticated profile or vendor record is available for this upload.');
      return fallbackUrl;
    }

    const storedToken = localStorage.getItem('vendoora_token');

    onLoading(true);
    onError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('resourceType', resourceType);
      formData.append('targetId', targetId);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: storedToken ? { Authorization: `Bearer ${storedToken}` } : undefined,
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || 'Media upload failed.');
      }

      return payload?.media?.url || fallbackUrl;
    } catch (error: any) {
      const message = error?.message || 'Unable to upload the selected image.';
      onError(message);
      return fallbackUrl;
    } finally {
      onLoading(false);
    }
  };

  const handleProfileImageUpload = async () => {
    if (!profileUploadFile) return;

    const uploadedUrl = await uploadMediaFile({
      resourceType: 'userProfile',
      file: profileUploadFile,
      targetId: profileUploadTargetId,
      fallbackUrl: currentUser?.profileImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      onError: setProfileUploadError,
      onLoading: setProfileUploadLoading,
    });

    if (currentUser) {
      setCurrentUser({ ...currentUser, profileImage: uploadedUrl });
    }
    setProfileUploadFile(null);
    setProfileUploadPreview(null);
  };

  const handleVendorLogoUpload = async () => {
    if (!vendorLogoUploadFile) return;

    const uploadedUrl = await uploadMediaFile({
      resourceType: 'vendorLogo',
      file: vendorLogoUploadFile,
      targetId: vendorUploadTargetId,
      fallbackUrl: currentVendor?.logo || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      onError: setVendorLogoUploadError,
      onLoading: setVendorLogoUploadLoading,
    });

    if (currentVendor) {
      setCurrentVendor({ ...currentVendor, logo: uploadedUrl });
    }
    setVendorLogoUploadFile(null);
    setVendorLogoUploadPreview(null);
  };

  const handleVendorCoverUpload = async () => {
    if (!vendorCoverUploadFile) return;

    const uploadedUrl = await uploadMediaFile({
      resourceType: 'vendorCover',
      file: vendorCoverUploadFile,
      targetId: vendorUploadTargetId,
      fallbackUrl: currentVendor?.coverImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      onError: setVendorCoverUploadError,
      onLoading: setVendorCoverUploadLoading,
    });

    if (currentVendor) {
      setCurrentVendor({ ...currentVendor, coverImage: uploadedUrl });
    }
    setVendorCoverUploadFile(null);
    setVendorCoverUploadPreview(null);
  };

  const handleServiceCoverUpload = async () => {
    if (!serviceCoverUploadFile) return;

    const uploadedUrl = await uploadMediaFile({
      resourceType: 'serviceCover',
      file: serviceCoverUploadFile,
      targetId: serviceCoverTargetId,
      fallbackUrl: currentVendorServices[0]?.coverImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      onError: setServiceCoverUploadError,
      onLoading: setServiceCoverUploadLoading,
    });

    if (currentVendorServices[0]) {
      setCurrentVendorServices((prev) => prev.map((service, index) => (index === 0 ? { ...service, coverImage: uploadedUrl } : service)));
    }
    setServiceCoverUploadFile(null);
    setServiceCoverUploadPreview(null);
  };

  return (
    <div
      id={id || 'vendor-command-center'}
      className="min-h-screen bg-[#0C0C0E] text-zinc-300 flex flex-col relative overflow-x-hidden font-sans transition-all duration-300"
    >
      {/* Premium Decorative Glow Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Global dark styled HeaderBar */}
      <HeaderBar
        vendorMode={true}
        onVendorModeToggle={(enabled) => {
          if (!enabled) {
            onBackToUserMode();
          }
        }}
        currentUser={incomingCurrentUser}
        onLoginClick={() => onOpenAuth?.('login', 'VENDOR')}
        onLogoutClick={onLogout}
      />

      {/* Main Split Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Sidebar Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <Card
            variant="glass"
            padding="sm"
            className="border-zinc-800 bg-zinc-950/60 backdrop-blur-xl rounded-[28px] overflow-hidden shadow-2xl relative"
          >
            {/* Top Partner Branding Card */}
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#6366F1] uppercase">Vendoora Elite</span>
                <h3 className="font-heading font-black text-white text-base mt-0.5 uppercase tracking-tight">{currentVendor?.businessName || 'Vendor profile'}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-zinc-300">{currentVendor?.totalReviews ? currentVendor.rating.toFixed(2) : 'Not yet rated'}</span>
                  <Badge variant="secondary" size="sm">{currentVendor?.verificationStatus || 'PENDING'}</Badge>
                </div>
              </div>
            </div>

            <div className="p-4 border-b border-zinc-900 space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Media Uploads</h4>

              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Profile image</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProfileUploadFile(file);
                    setProfileUploadPreview(file ? URL.createObjectURL(file) : null);
                    setProfileUploadError(null);
                  }}
                  className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                />
                {profileUploadPreview && <img src={profileUploadPreview} alt="Profile preview" className="h-16 w-full rounded-lg object-cover border border-zinc-800" />}
                {profileUploadLoading && <p className="text-[10px] text-indigo-300">Uploading profile…</p>}
                {profileUploadError && <p className="text-[10px] text-red-400">{profileUploadError}</p>}
                <Button type="button" variant="secondary" size="sm" onClick={handleProfileImageUpload} className="w-full text-[10px] font-bold uppercase tracking-wide">Upload profile</Button>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Vendor logo</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setVendorLogoUploadFile(file);
                    setVendorLogoUploadPreview(file ? URL.createObjectURL(file) : null);
                    setVendorLogoUploadError(null);
                  }}
                  className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                />
                {vendorLogoUploadPreview && <img src={vendorLogoUploadPreview} alt="Vendor logo preview" className="h-16 w-full rounded-lg object-cover border border-zinc-800" />}
                {vendorLogoUploadLoading && <p className="text-[10px] text-indigo-300">Uploading logo…</p>}
                {vendorLogoUploadError && <p className="text-[10px] text-red-400">{vendorLogoUploadError}</p>}
                <Button type="button" variant="secondary" size="sm" onClick={handleVendorLogoUpload} className="w-full text-[10px] font-bold uppercase tracking-wide">Upload logo</Button>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Vendor cover</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setVendorCoverUploadFile(file);
                    setVendorCoverUploadPreview(file ? URL.createObjectURL(file) : null);
                    setVendorCoverUploadError(null);
                  }}
                  className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                />
                {vendorCoverUploadPreview && <img src={vendorCoverUploadPreview} alt="Vendor cover preview" className="h-16 w-full rounded-lg object-cover border border-zinc-800" />}
                {vendorCoverUploadLoading && <p className="text-[10px] text-indigo-300">Uploading cover…</p>}
                {vendorCoverUploadError && <p className="text-[10px] text-red-400">{vendorCoverUploadError}</p>}
                <Button type="button" variant="secondary" size="sm" onClick={handleVendorCoverUpload} className="w-full text-[10px] font-bold uppercase tracking-wide">Upload cover</Button>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Service cover</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setServiceCoverUploadFile(file);
                    setServiceCoverUploadPreview(file ? URL.createObjectURL(file) : null);
                    setServiceCoverUploadError(null);
                  }}
                  className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                />
                {serviceCoverUploadPreview && <img src={serviceCoverUploadPreview} alt="Service cover preview" className="h-16 w-full rounded-lg object-cover border border-zinc-800" />}
                {serviceCoverUploadLoading && <p className="text-[10px] text-indigo-300">Uploading service cover…</p>}
                {serviceCoverUploadError && <p className="text-[10px] text-red-400">{serviceCoverUploadError}</p>}
                <Button type="button" variant="secondary" size="sm" onClick={handleServiceCoverUpload} className="w-full text-[10px] font-bold uppercase tracking-wide">Upload service cover</Button>
              </div>
            </div>

            {/* Live Status Switcher */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/10">
              <Toggle
                checked={acceptingBookings}
                onChange={updateAcceptingBookings}
                label="Online Bookings"
                description={acceptingBookings ? "Active & receiving user leads" : "Paused on user marketplace"}
                variant="success"
              />
            </div>

            {/* Sidebar Navigation Buttons */}
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Analytics & Goals</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'bookings'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Bookings & Logistics</span>
                </div>
                {pendingBookingsCount > 0 && (
                  <Badge variant="danger" size="sm" className="rounded-full">{pendingBookingsCount}</Badge>
                )}
              </button>

              <button
                onClick={() => setActiveTab('availability')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'availability'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Availability & Blackouts</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Live Inventory Feed</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('pricing')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pricing'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Dynamic AI Pricing</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('seller')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'seller'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Recycle className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Seller Listing Suite</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('reels')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'reels'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Vibe Reels Manager</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-[#6366F1]/10 text-white border-l-4 border-[#6366F1]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Notifications</span>
                </div>
                {unreadNotifCount > 0 && (
                  <Badge variant="primary" size="sm" className="rounded-full bg-pink-600 border-none">{unreadNotifCount}</Badge>
                )}
              </button>
            </nav>

            {/* Sidebar Footer Back to User Mode Button */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-900/20">
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToUserMode}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 bg-transparent transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Switch to Consumer</span>
              </Button>
            </div>
          </Card>


        </aside>

        {/* Right Side: Active Workspace View */}
        <main className="lg:col-span-9 space-y-8 min-h-[70vh]">
          
          {bookingError && <p role="alert" className="text-red-400">{bookingError}</p>}
          {/* Active Tab rendering via AnimatePresence */}
          <AnimatePresence mode="wait">
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Performance Command Dashboard</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Real-time revenue metrics, response efficiencies, and seasonal metrics</p>
                </div>

                <VendorAnalyticsRow
                  monthlyEarnings={paymentSummary ? paymentSummary.paidAmountPaise / 100 : 0}
                  activeInquiries={pendingBookingsCount}
                  rating={currentVendor?.totalReviews ? currentVendor.rating : 0}
                />

                {paymentSummary && (
                  <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[28px] p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div><span className="block text-[9px] uppercase text-zinc-500 font-bold">Paid bookings</span><span className="text-lg font-mono text-emerald-400">{paymentSummary.paidBookings}</span></div>
                      <div><span className="block text-[9px] uppercase text-zinc-500 font-bold">Paid earnings</span><span className="text-lg font-mono text-white">₹{(paymentSummary.paidAmountPaise / 100).toLocaleString('en-IN')}</span></div>
                      <div><span className="block text-[9px] uppercase text-zinc-500 font-bold">Refunded</span><span className="text-lg font-mono text-amber-400">₹{(paymentSummary.refundedAmountPaise / 100).toLocaleString('en-IN')}</span></div>
                      <div><span className="block text-[9px] uppercase text-zinc-500 font-bold">Pending payments</span><span className="text-lg font-mono text-indigo-400">{paymentSummary.pendingPayments}</span></div>
                    </div>
                  </Card>
                )}

                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[28px] p-5 space-y-3">
                      <div className="flex items-center justify-between"><h4 className="font-heading font-semibold text-white text-base">Reviews received ({receivedReviews.length})</h4><span className="text-xs text-amber-400">{receivedReviews.length ? (receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length).toFixed(1) : '0.0'} / 5</span></div>
                      {receivedReviews.length === 0 ? <p className="text-xs text-zinc-500">Completed-order reviews will appear here.</p> : receivedReviews.slice(0, 8).map((review) => <div key={review.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3"><p className="text-xs font-bold text-white">{review.user?.name || 'Customer'} · {review.rating}/5</p><p className="text-xs text-zinc-400 mt-1">{review.comment || 'No comment provided.'}</p></div>)}
                    </Card>

              </motion.div>
            )}

            {activeTab === 'availability' && (
              <motion.div
                key="availability-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Availability & Blackouts</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Set the time slots customers can request and block dates for private commitments.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[28px] p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading font-semibold text-white text-base">Available time slots</h4>
                      <Badge variant={acceptingBookings ? 'success' : 'danger'}>{acceptingBookings ? 'Accepting' : 'Paused'}</Badge>
                    </div>
                    <form onSubmit={handleAddAvailability} className="grid grid-cols-2 gap-3">
                      <label className="col-span-2 text-[10px] uppercase font-bold text-zinc-500">Date<input type="date" value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white" required /></label>
                      <label className="text-[10px] uppercase font-bold text-zinc-500">Start<input type="time" value={availabilityStart} onChange={(event) => setAvailabilityStart(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white" required /></label>
                      <label className="text-[10px] uppercase font-bold text-zinc-500">End<input type="time" value={availabilityEnd} onChange={(event) => setAvailabilityEnd(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white" required /></label>
                      <div className="col-span-2 flex gap-2">
                        <Button type="submit" size="sm" className="flex-1">{editingAvailabilityId ? 'Update availability' : 'Add availability'}</Button>
                        {editingAvailabilityId && <Button type="button" size="sm" variant="secondary" onClick={() => setEditingAvailabilityId(null)}>Cancel</Button>}
                      </div>
                    </form>
                    <div className="space-y-2">
                      {availability.length === 0 ? <p className="text-xs text-zinc-500">No availability slots configured.</p> : availability.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
                          <span>{String(entry.date).slice(0, 10)} · {entry.startTime}–{entry.endTime}</span>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => editAvailability(entry)} className="text-zinc-500 hover:text-white" aria-label="Edit availability"><Pencil className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteAvailability(entry.id)} className="text-zinc-500 hover:text-red-400" aria-label="Delete availability"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[28px] p-6 space-y-5">
                    <h4 className="font-heading font-semibold text-white text-base">Blackout dates</h4>
                    <form onSubmit={handleAddBlackout} className="grid grid-cols-2 gap-3">
                      <label className="text-[10px] uppercase font-bold text-zinc-500">From<input type="date" value={blackoutStart} onChange={(event) => setBlackoutStart(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white" required /></label>
                      <label className="text-[10px] uppercase font-bold text-zinc-500">To<input type="date" value={blackoutEnd} onChange={(event) => setBlackoutEnd(event.target.value)} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white" required /></label>
                      <label className="col-span-2 text-[10px] uppercase font-bold text-zinc-500">Reason<input value={blackoutReason} onChange={(event) => setBlackoutReason(event.target.value)} placeholder="Private event" className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-700" /></label>
                      <div className="col-span-2 flex gap-2">
                        <Button type="submit" size="sm" variant="secondary" className="flex-1">{editingBlackoutId ? 'Update blackout' : 'Block dates'}</Button>
                        {editingBlackoutId && <Button type="button" size="sm" variant="secondary" onClick={() => setEditingBlackoutId(null)}>Cancel</Button>}
                      </div>
                    </form>
                    <div className="space-y-2">
                      {blackouts.length === 0 ? <p className="text-xs text-zinc-500">No blackout dates configured.</p> : blackouts.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-300">
                          <span>{String(entry.dateStart).slice(0, 10)}–{String(entry.dateEnd).slice(0, 10)}{entry.reason ? ` · ${entry.reason}` : ''}</span>
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => editBlackout(entry)} className="text-zinc-500 hover:text-white" aria-label="Edit blackout"><Pencil className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeleteBlackout(entry.id)} className="text-zinc-500 hover:text-red-400" aria-label="Delete blackout"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                key="bookings-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Active Bookings & Logistics Manager</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Manage customer inquiries and paid-order fulfillment</p>
                </div>

                {/* 1. Pending Inquiries Segment */}
                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                    <h4 className="font-heading font-semibold text-white text-base flex items-center gap-2">
                      <CalendarClock className="w-5 h-5 text-indigo-400 animate-pulse" />
                      Pending Customer Inquiries ({pendingBookingsCount})
                    </h4>
                    <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Requires Action</span>
                  </div>

                  {bookings.filter((b) => b.status === 'pending').length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                      <p className="text-sm text-zinc-400 font-medium">Inquiry queue cleared!</p>
                      <p className="text-xs text-zinc-500">New customer inquiries will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.filter((b) => b.status === 'pending').map((booking) => (
                        <div
                          key={booking.id}
                          className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-850 hover:border-zinc-800 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                        >
                          <div className="space-y-1">
                            <span className="text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-full">
                              New Live Lead
                            </span>
                            <h5 className="font-heading font-bold text-white text-sm sm:text-base">{booking.eventName}</h5>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-mono">
                              <span>Client: {booking.clientName}</span>
                              <span>•</span>
                              <span>Date: {booking.date} at {booking.time} hrs</span>
                              <span>•</span>
                              <span>Location: {booking.location}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0 w-full md:w-auto">
                            <button
                              onClick={() => handleRejectBooking(booking.id)}
                              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/20 text-xs font-bold uppercase transition-all"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleAcceptBooking(booking.id)}
                              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Accept & Schedule</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                      <h4 className="font-heading font-semibold text-white text-base">Fulfillment Orders ({orders.length})</h4>
                      <p className="text-zinc-500 text-xs mt-0.5">Update paid booking fulfillment through the controlled order lifecycle.</p>
                    </div>
                  </div>
                  {orderError && <p className="text-xs text-red-400">{orderError}</p>}
                  {orders.length === 0 ? <p className="text-xs text-zinc-500 py-4">Paid bookings will appear here as orders.</p> : orders.map((order) => (
                    <div key={order.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h5 className="font-heading font-bold text-white text-sm">{order.booking.eventName}</h5>
                        <p className="text-xs text-zinc-400">{order.booking.client?.name || 'Customer'} · {String(order.scheduledDate).slice(0, 10)} · {order.scheduledStartTime}</p>
                        <p className="text-[10px] text-zinc-500">{order.venueAddress}{order.trackingReference ? ` · Ref: ${order.trackingReference}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={order.status === 'COMPLETED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'primary'}>{order.status}</Badge>
                        {nextOrderStatus[order.status] && <Button size="sm" onClick={() => updateOrderStatus(order.id, nextOrderStatus[order.status] as string)}>Mark {nextOrderStatus[order.status]}</Button>}
                        {order.status === 'CONFIRMED' && <Button size="sm" variant="secondary" onClick={() => updateOrderStatus(order.id, 'CANCELLED')}>Cancel</Button>}
                      </div>
                    </div>
                  ))}
                </Card>

              </motion.div>
            )}

            {activeTab === 'inventory' && (
              <motion.div
                key="inventory-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Active Inventory & Rate Controller</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Adjust client rates dynamically on the marketplace or expand your service catalog live</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Form to Add New Inventory */}
                  <div className="lg:col-span-5">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-6">
                      <div>
                        <h4 className="font-heading font-semibold text-white text-base">Expand Service Catalog</h4>
                        <p className="text-zinc-500 text-xs mt-0.5">List a new equipment item live to the consumer-facing catalog</p>
                      </div>

                      <form onSubmit={handleAddNewInventorySubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Equipment Name</label>
                          <Input
                            type="text"
                            required
                            placeholder="e.g. Waterproof German Hangers..."
                            value={newInvName}
                            onChange={(e) => setNewInvName(e.target.value)}
                            className="bg-zinc-950 border-zinc-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Preset Category</label>
                            <select
                              value={newInvImagePreset}
                              onChange={(e) => setNewInvImagePreset(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="sofa">Furniture / Seating</option>
                              <option value="lights">LED Stage Lighting</option>
                              <option value="catering">Stainless Catering Ware</option>
                              <option value="tent">Tent structures</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Units Available</label>
                            <Input
                              type="number"
                              required
                              min="1"
                              max="500"
                              value={newInvUnits}
                              onChange={(e) => setNewInvUnits(parseInt(e.target.value) || 1)}
                              className="bg-zinc-950 border-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Inventory Image Upload</label>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setNewInvUploadFile(file);
                              setNewInvUploadPreview(file ? URL.createObjectURL(file) : null);
                              setNewInvUploadError(null);
                            }}
                            className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                          />
                          {newInvUploadPreview && (
                            <img src={newInvUploadPreview} alt="Inventory preview" className="h-20 w-full rounded-lg object-cover border border-zinc-800" />
                          )}
                          {newInvUploadLoading && <p className="text-[10px] text-indigo-300">Uploading image…</p>}
                          {newInvUploadError && <p className="text-[10px] text-red-400">{newInvUploadError}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Hourly Rate (₹/hr)</label>
                            <Input
                              type="number"
                              required
                              min="10"
                              value={newInvHourly}
                              onChange={(e) => setNewInvHourly(parseInt(e.target.value) || 10)}
                              className="bg-zinc-950 border-zinc-800 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Daily Rate (₹/day)</label>
                            <Input
                              type="number"
                              required
                              min="100"
                              value={newInvDaily}
                              onChange={(e) => setNewInvDaily(parseInt(e.target.value) || 100)}
                              className="bg-zinc-950 border-zinc-800 font-mono"
                            />
                          </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-3 uppercase tracking-wide font-bold">
                          Add Live Equipment Listing
                        </Button>
                      </form>
                    </Card>
                  </div>

                  {/* Right Column: Dynamic Price sliders of existing lists */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Active Inventory Rate Controls</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {inventory.map((item) => (
                        <Card
                          key={item.id}
                          className="border-zinc-850 bg-zinc-950/40 backdrop-blur-md p-5 flex flex-col justify-between rounded-[28px] overflow-hidden group shadow-lg"
                        >
                          <div>
                            <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 bg-zinc-900">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                              <div className="absolute bottom-2 left-2 bg-zinc-950/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[9px] font-bold text-zinc-300 border border-zinc-900 font-mono">
                                {item.units} Units Available
                              </div>
                            </div>
                            <h5 className="font-heading font-semibold text-white text-xs line-clamp-1">{item.name}</h5>
                          </div>

                          <div className="mt-3 space-y-3 pt-3 border-t border-zinc-900">
                            {/* Hourly rate */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
                                <span>Hourly Rate</span>
                                <span className="font-mono text-white text-xs">₹{item.hourlyRate}/hr</span>
                              </div>
                              <input
                                type="range"
                                min="20"
                                max="1000"
                                step="5"
                                value={item.hourlyRate}
                                onChange={(e) => onUpdateInventoryItemRates(item.id, parseInt(e.target.value), item.dailyRate)}
                                className="w-full accent-[#6366F1] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                              />
                            </div>

                            {/* Daily rate */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
                                <span>Daily Rate</span>
                                <span className="font-mono text-white text-xs">₹{item.dailyRate}/day</span>
                              </div>
                              <input
                                type="range"
                                min="100"
                                max="8000"
                                step="50"
                                value={item.dailyRate}
                                onChange={(e) => onUpdateInventoryItemRates(item.id, item.hourlyRate, parseInt(e.target.value))}
                                className="w-full accent-[#6366F1] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Dynamic AI Pricing & Surcharges</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Determine deterministic customer quotes dynamically with transport, season multipliers, and wages</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Interactive Calculator */}
                  <div className="lg:col-span-6">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-5">
                      <div>
                        <h4 className="font-heading font-semibold text-white text-base">Dynamic Quote Estimator</h4>
                        <p className="text-zinc-500 text-xs mt-0.5">Adjust inputs to calculate pre-vetted custom customer prices</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Base rental cost */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Base Rental/Service Cost (₹)</label>
                          <Input
                            type="number"
                            required
                            min="1000"
                            step="500"
                            value={calcBase}
                            onChange={(e) => setCalcBase(Math.max(0, parseInt(e.target.value) || 0))}
                            className="bg-zinc-950 border-zinc-800 font-mono text-sm"
                          />
                        </div>

                        {/* Season Tier dropdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Season Multiplier</label>
                            <select
                              value={calcSeason}
                              onChange={(e) => setCalcSeason(e.target.value as any)}
                              className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="Standard">Standard Season (1.0x)</option>
                              <option value="Peak">High Season Peak (+30% / 1.3x)</option>
                              <option value="Off">Off-Season (-10% / 0.9x)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Crew Size Wages</label>
                            <select
                              value={calcCrew}
                              onChange={(e) => setCalcCrew(parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="2">2 Men (₹4,000)</option>
                              <option value="4">4 Men (₹8,000)</option>
                              <option value="6">6 Men (₹12,000)</option>
                              <option value="10">10 Men (₹20,000)</option>
                            </select>
                          </div>
                        </div>

                        {/* Transport slider */}
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase">
                            <span>Truck Transport Distance</span>
                            <span className="text-white font-mono">{calcDistance} km</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="100"
                            step="5"
                            value={calcDistance}
                            onChange={(e) => setCalcDistance(parseInt(e.target.value))}
                            className="w-full accent-[#6366F1] h-1 bg-zinc-900 rounded-lg cursor-pointer"
                          />
                          <p className="text-[9px] text-zinc-500">Calculated at flat ₹50 per km fuel/driver surcharge.</p>
                        </div>
                      </div>

                      {/* Display pricing output */}
                      <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-indigo-300 font-bold">Dynamic Quote Recommended</span>
                            <span className="text-[10px] text-zinc-400">Pre-Vetted Customer Billing</span>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="block text-[9px] text-indigo-300 uppercase">Estimated price</span>
                          <span className="text-xl font-extrabold text-white">₹{calculatedQuote.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Column: Policy definitions */}
                  <div className="lg:col-span-6 space-y-6">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4">
                      <h4 className="font-heading font-semibold text-white text-base">Standard Professional Policies</h4>
                      <p className="text-zinc-500 text-xs">Standardized compliance regulations across the Vendoora professional networks</p>
                      
                      <div className="space-y-4 pt-2">
                        <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 flex gap-3 items-start">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h5 className="font-heading font-bold text-white text-xs">Security Deposits & Damages</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                              Collect flat 15% safety deposit prior to heavy structural rigs deployment on-site. Refunded instantly via Vendoora automated verification checklist.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 flex gap-3 items-start">
                          <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h5 className="font-heading font-bold text-white text-xs">Overtime Surcharges</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                              Slashed setup removals delayed beyond 4 hours of celebration completion are charged at ₹5,000/hr, deducted automatically from escrow balance.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900 flex gap-3 items-start">
                          <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <h5 className="font-heading font-bold text-white text-xs">Tax Compliance Requirements</h5>
                            <p className="text-[10px] text-zinc-500 leading-relaxed">
                              A flat 18% GST is automatically computed on each contract and recorded in your unified ledger for year-end filings.
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'seller' && (
              <motion.div
                key="seller-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Pre-Owned Equipment Seller Suite</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Sell decommissioned celebration sound boards, AC units, structures, and lighting sets directly to other vendors</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Post new listing */}
                  <div className="lg:col-span-5">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-6">
                      <div>
                        <h4 className="font-heading font-semibold text-white text-base">Publish Pre-Owned Gear</h4>
                        <p className="text-zinc-500 text-xs mt-0.5">Publishes an equipment card live to the secondary market</p>
                      </div>

                      <form onSubmit={handleAddUsedGearSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase block text-zinc-400">Equipment Name</label>
                          <Input
                            type="text"
                            required
                            placeholder="e.g. Stage Spotlights Trussing..."
                            value={newGearName}
                            onChange={(e) => setNewGearName(e.target.value)}
                            className="bg-zinc-950 border-zinc-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase block text-zinc-400">Condition</label>
                            <select
                              value={newGearCondition}
                              onChange={(e) => setNewGearCondition(e.target.value as any)}
                              className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500 font-sans"
                            >
                              <option value="Mint">Mint (Like New)</option>
                              <option value="Excellent">Excellent</option>
                              <option value="Good">Good</option>
                              <option value="Fair">Fair (Heavy Use)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase block text-zinc-400">Age (Months)</label>
                            <Input
                              type="number"
                              required
                              min="0"
                              value={newGearAge}
                              onChange={(e) => setNewGearAge(parseInt(e.target.value) || 0)}
                              className="bg-zinc-950 border-zinc-800"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase block text-zinc-400">Original Retail Price (₹)</label>
                          <Input
                            type="number"
                            required
                            min="1000"
                            value={newGearRetail}
                            onChange={(e) => setNewGearRetail(parseInt(e.target.value) || 0)}
                            className="bg-zinc-950 border-zinc-800 font-mono"
                          />
                        </div>

                        <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3">
                          <label className="text-[10px] font-bold uppercase block text-zinc-400">Marketplace Image Upload</label>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={(event) => {
                              const file = event.target.files?.[0] || null;
                              setNewGearUploadFile(file);
                              setNewGearUploadPreview(file ? URL.createObjectURL(file) : null);
                              setNewGearUploadError(null);
                            }}
                            className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                          />
                          {newGearUploadPreview && (
                            <img src={newGearUploadPreview} alt="Marketplace preview" className="h-20 w-full rounded-lg object-cover border border-zinc-800" />
                          )}
                          {newGearUploadLoading && <p className="text-[10px] text-indigo-300">Uploading image…</p>}
                          {newGearUploadError && <p className="text-[10px] text-red-400">{newGearUploadError}</p>}
                        </div>

                        {/* Suggested AI Price widget */}
                        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Suggested AI Resale</span>
                              <span className="text-[10px] text-zinc-400">Depreciated pricing</span>
                            </div>
                          </div>
                          <span className="text-sm font-extrabold font-mono text-purple-400">
                            ₹{computeSuggestedPrice(newGearRetail, newGearCondition, newGearAge).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-3 font-bold uppercase tracking-wide bg-gradient-to-r from-purple-500 to-indigo-500 border-none">
                          Publish to Marketplace
                        </Button>
                      </form>
                    </Card>
                  </div>

                  {/* Right Column: Listing scroll */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Your Published Pre-Owned Listings ({products.length})</h4>
                    
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                      {products.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-sm flex justify-between items-center"
                        >
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                              {item.condition || 'Good'} • 6 Mo Old
                            </span>
                            <h5 className="font-heading font-semibold text-white text-xs sm:text-sm">{item.name}</h5>
                            <p className="text-[10px] text-zinc-500">Live on pre-owned gear index</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[8px] uppercase text-zinc-500 font-bold">Sale Price</span>
                            <span className="text-sm sm:text-base font-extrabold font-mono text-white">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {activeTab === 'reels' && (
              <motion.div
                key="reels-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Vibe Reels Portfolio Manager</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Publish vertical 15-second visual portfolios. Double your consumer visibility and incoming inquiries instantly</p>
                </div>

                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
                    <h4 className="font-heading font-semibold text-white text-base">Your Active Reels Index ({reels.length})</h4>
                    
                    {/* Inline Form to Publish Reel */}
                    <form onSubmit={handlePublishReelSubmit} className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Input
                          type="text"
                          required
                          placeholder="Reel title (e.g. Wedding Canopy...)"
                          value={newReelTitle}
                          onChange={(e) => setNewReelTitle(e.target.value)}
                          className="bg-zinc-950 border-zinc-800 text-xs w-48 py-1.5"
                        />
                        <Button type="submit" variant="primary" className="py-2.5 font-bold text-xs uppercase px-4 shrink-0">
                          Publish Reel
                        </Button>
                      </div>

                      <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-2.5 min-w-[220px]">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Thumbnail Upload</label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            setNewReelUploadFile(file);
                            setNewReelUploadPreview(file ? URL.createObjectURL(file) : null);
                            setNewReelUploadError(null);
                          }}
                          className="block w-full text-[10px] text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500/10 file:px-2 file:py-1 file:text-[10px] file:font-bold file:text-indigo-300"
                        />
                        {newReelUploadPreview && (
                          <img src={newReelUploadPreview} alt="Reel preview" className="h-20 w-full rounded-lg object-cover border border-zinc-800" />
                        )}
                        {newReelUploadLoading && <p className="text-[10px] text-indigo-300">Uploading thumbnail…</p>}
                        {newReelUploadError && <p className="text-[10px] text-red-400">{newReelUploadError}</p>}
                      </div>
                    </form>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {reels.map((reel) => (
                      <div
                        key={reel.id}
                        className="h-48 sm:h-52 rounded-xl overflow-hidden border border-zinc-850 relative group shadow-lg"
                      >
                        <img
                          src={reel.thumbnail}
                          alt={reel.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent" />
                        
                        {/* Trash Button */}
                        <button
                          onClick={() => {
                            onDeleteReel(reel.id);
                            alert('Reel deleted from the central feed.');
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white transition-all shadow-md"
                          title="Delete Reel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-1">
                          <h6 className="font-heading font-bold text-[10px] leading-tight text-white line-clamp-2">{reel.title}</h6>
                          <div className="flex items-center gap-1 text-[8px] font-mono text-pink-300 font-bold uppercase">
                            <span>{reel.views} views</span>
                          </div>
                        </div>
                        
                        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md">
                          0:15
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black font-heading text-white uppercase tracking-tight">Partner Notification Center</h2>
                    <p className="text-zinc-500 text-xs mt-0.5">Audit complete alert logs, billing updates, warnings, and customer inquires</p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markNotificationsRead()}
                      disabled={notificationsSaving}
                      className="text-xs font-bold border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 bg-transparent"
                    >
                      Mark All Read
                    </Button>
                  </div>
                </div>

                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-6">
                  {notificationError && <p role="alert" className="text-red-400 text-xs">{notificationError}</p>}
                  {/* Category filters */}
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-4 overflow-x-auto">
                    <button
                      onClick={() => setNotifFilter('all')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${notifFilter === 'all' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      All logs
                    </button>
                    <button
                      onClick={() => setNotifFilter('inquiry')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${notifFilter === 'inquiry' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      Inquiries
                    </button>
                    <button
                      onClick={() => setNotifFilter('payment')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${notifFilter === 'payment' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      Payments
                    </button>
                    <button
                      onClick={() => setNotifFilter('system')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${notifFilter === 'system' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      System alerts
                    </button>
                    <button
                      onClick={() => setNotifFilter('alert')}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${notifFilter === 'alert' ? 'bg-[#6366F1] text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                    >
                      Warnings
                    </button>
                  </div>

                  {/* List */}
                  {filteredNotifs.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-zinc-500">No logs match your selected filter category.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredNotifs.map((log) => (
                        <div
                          key={log.id}
                          onClick={() => { if (!notificationsSaving) void markNotificationsRead(log.id); }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start gap-4 ${log.read ? 'bg-zinc-900/10 border-zinc-900/60 text-zinc-400' : 'bg-[#6366F1]/5 border-[#6366F1]/20 text-zinc-200'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {!log.read && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full shrink-0" />}
                              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-extrabold">{log.type}</span>
                            </div>
                            <h5 className="font-heading font-bold text-xs sm:text-sm text-white">{log.title}</h5>
                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">{log.message}</p>
                          </div>

                          <div className="text-[9px] font-mono text-zinc-500 shrink-0 font-bold">{log.time}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* Modern Dashboard Footer */}
      <footer className="w-full bg-[#0A0A0B] border-t border-zinc-900 py-8 text-zinc-600 font-sans text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading font-black tracking-widest uppercase text-zinc-500">
            VENDOORA PARTNERS
          </span>
          <div className="flex gap-4">
            <span className="hover:text-zinc-500 transition-colors">Supplier Center</span>
            <span>•</span>
            <span className="hover:text-zinc-500 transition-colors">Disputes Hotline</span>
          </div>
          <span>© 2026 Vendoora India. Professional Event Networks.</span>
        </div>
      </footer>

    </div>
  );
}
