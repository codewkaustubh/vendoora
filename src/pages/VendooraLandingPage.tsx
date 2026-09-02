/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, type FormEvent } from 'react';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  LayoutGrid as GridIcon,
  ShoppingBag as BagIcon,
  Gift as GiftIcon,
  Sparkles,
  ClipboardList,
  Loader2,
  AlertCircle,
} from 'lucide-react';

// Design System & Curated Components
import {
  DesignTokens,
  Button,
  SearchBar,
  CategoryCard,
  VendorCard as DSVendorCard,
  Badge,
  Card,
  BottomNavigation,
  Modal,
  Input,
} from '../components/design-system';

// Core Layout & Modules
import HeaderBar from '../components/layout/HeaderBar';
import VibeReelsTray from '../components/vendoora/VibeReelsTray';
import MarketplaceSection from '../components/marketplace/MarketplaceSection';
import MarketplaceDiscovery from '../components/marketplace/MarketplaceDiscovery';
import WhatsAppChatFab from '../components/layout/WhatsAppChatFab';
import BudgetCalculatorModal from '../components/budget/BudgetCalculatorModal';
import VendorTermsModal from '../components/vendor/VendorTermsModal';
import LegalModal from '../components/vendoora/LegalModal';

// Mock Data
import { CATEGORIES } from '../data/vendooraMockData';

interface VendooraLandingPageProps {
  id?: string;
  onSwitchToVendor: () => void;
  reels?: any[];
  products?: any[];
  onAddNotification: (notification: any) => void;
}

interface EventPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  badge: string;
  items: string[];
  image: string;
  gradient: string;
}

const POPULAR_PACKAGES: EventPackage[] = [
  {
    id: 'pkg-1',
    name: 'The Shahi Shaadi Experience',
    description: 'A complete, grand luxury wedding package with hand-selected royal decorations and elite catering.',
    price: 450000,
    badge: 'LUXURY WEDDING',
    items: [
      'Premium Palace/Lawn Venue Booking',
      'Exquisite Floral Canopy & Pathway Decors',
      'Live Fusion Catering (up to 500 guests)',
      'Dual-screen DJ Sound System & Laser Stage'
    ],
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  {
    id: 'pkg-2',
    name: 'Sufi & Qawwali Enchanted Night',
    description: 'An immersive musical evening featuring specialized atmospheric setups and high-end acoustics.',
    price: 180000,
    badge: 'LIVE MUSIC',
    items: [
      'Middle-Eastern Styled Diwan Seating',
      'Low-fog Ground Cloud Effects',
      'High-fidelity Decibel Pro Audio Suite',
      'Thematic Lantern & Warm Bulb Stage Decors'
    ],
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800',
    gradient: 'from-purple-500/20 to-violet-500/20'
  },
  {
    id: 'pkg-3',
    name: 'Neon Sangeet & Cocktail Lounge',
    description: 'Modern high-energy party package complete with responsive pixel dance floor and premium light fixtures.',
    price: 250000,
    badge: 'DANCE NIGHT',
    items: [
      '64-Tile Pixel LED Animated Dance Floor',
      'Intelligent Moving-head Spotlight Truss',
      'Luminous Neon Backdrop Photo Booth',
      'Chilled Event Air Cooling & Power Backup'
    ],
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800',
    gradient: 'from-cyan-500/20 to-indigo-500/20'
  }
];

export default function VendooraLandingPage({
  id,
  onSwitchToVendor,
  reels,
  products,
  onAddNotification,
}: VendooraLandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Mumbai, MH');
  const [activeTab, setActiveTab] = useState('home');
  const [vendors, setVendors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityAccepting, setAvailabilityAccepting] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerBookingsLoading, setCustomerBookingsLoading] = useState(false);
  const [customerBookingsError, setCustomerBookingsError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);
  const [paymentActionId, setPaymentActionId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customerReviews, setCustomerReviews] = useState<any[]>([]);
  const [reviewOrderId, setReviewOrderId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modals active state
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Client Inquiry State Flows
  const [selectedInquiryVendor, setSelectedInquiryVendor] = useState<any | null>(null);
  const [selectedInquiryPackage, setSelectedInquiryPackage] = useState<EventPackage | null>(null);
  const [inquiryEventName, setInquiryEventName] = useState('');
  const [inquiryDate, setInquiryDate] = useState(new Date().toISOString().slice(0, 10));
  const [inquiryTime, setInquiryTime] = useState('18:00');
  const [inquiryEndTime, setInquiryEndTime] = useState('20:00');
  const [inquiryGuests, setInquiryGuests] = useState('150');
  const [inquiryVenue, setInquiryVenue] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [packageVendorId, setPackageVendorId] = useState('');

  useEffect(() => {
    const loadCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const [vendorsResponse, servicesResponse] = await Promise.all([
          fetch('/api/vendors?limit=100'),
          fetch('/api/services?limit=100'),
        ]);
        if (!vendorsResponse.ok || !servicesResponse.ok) throw new Error('Unable to load vendors and services');
        const [vendorsPayload, servicesPayload] = await Promise.all([vendorsResponse.json(), servicesResponse.json()]);
        setVendors(Array.isArray(vendorsPayload?.vendors) ? vendorsPayload.vendors : []);
        setServices(Array.isArray(servicesPayload?.services) ? servicesPayload.services : []);
      } catch (error) {
        setCatalogError(error instanceof Error ? error.message : 'Unable to load vendors and services');
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const loadCustomerBookings = async () => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) {
      setCustomerBookings([]);
      return;
    }
    setCustomerBookingsLoading(true);
    setCustomerBookingsError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [response, ordersResponse] = await Promise.all([fetch('/api/bookings/client', { headers }), fetch('/api/orders/client', { headers })]);
      const payload = await response.json().catch(() => ({}));
      const ordersPayload = await ordersResponse.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) throw new Error('Please sign in as a customer to view bookings');
      if (!response.ok) throw new Error(payload?.error || 'Unable to load your bookings');
      setCustomerBookings(Array.isArray(payload?.bookings) ? payload.bookings : []);
      setCustomerOrders(ordersResponse.ok && Array.isArray(ordersPayload?.orders) ? ordersPayload.orders : []);
      const reviewsResponse = await fetch('/api/reviews/client', { headers });
      const reviewsPayload = await reviewsResponse.json().catch(() => ({}));
      setCustomerReviews(reviewsResponse.ok && Array.isArray(reviewsPayload?.reviews) ? reviewsPayload.reviews : []);
      const notificationsResponse = await fetch('/api/notifications', { headers });
      const notificationsPayload = await notificationsResponse.json().catch(() => ({}));
      setNotifications(notificationsResponse.ok && Array.isArray(notificationsPayload?.notifications) ? notificationsPayload.notifications : []);
    } catch (error) {
      setCustomerBookingsError(error instanceof Error ? error.message : 'Unable to load your bookings');
    } finally {
      setCustomerBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerBookings();
  }, []);

  useEffect(() => {
    if (!selectedInquiryVendor?.id) return;
    let cancelled = false;
    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        const response = await fetch(`/api/vendors/${selectedInquiryVendor.id}/availability`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload?.error || 'Unable to load vendor availability');
        if (cancelled) return;
        const slots = Array.isArray(payload?.availability) ? payload.availability : [];
        setAvailability(slots);
        setAvailabilityAccepting(payload?.acceptingBookings !== false);
        const dateSlots = slots.filter((slot: any) => String(slot.date).slice(0, 10) === inquiryDate);
        if (dateSlots[0]) {
          setInquiryTime(dateSlots[0].startTime);
          setInquiryEndTime(dateSlots[0].endTime);
        }
      } catch (error) {
        if (!cancelled) setAvailabilityError(error instanceof Error ? error.message : 'Unable to load vendor availability');
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    };
    loadAvailability();
    return () => { cancelled = true; };
  }, [selectedInquiryVendor?.id]);

  useEffect(() => {
    if (!selectedInquiryVendor?.id || availabilityLoading) return;
    const dateSlots = availability.filter((slot: any) => String(slot.date).slice(0, 10) === inquiryDate);
    if (dateSlots[0]) {
      setInquiryTime(dateSlots[0].startTime);
      setInquiryEndTime(dateSlots[0].endTime);
    }
  }, [inquiryDate, availability, availabilityLoading, selectedInquiryVendor?.id]);

  const handleBookEstimate = (estimateRange: string) => {
    setIsBudgetOpen(false);
    if (vendorCards[0]) {
      setSelectedInquiryVendor(vendorCards[0]);
      setInquiryEventName(`${estimateRange} Budget Plan`);
      setInquiryVenue('');
    } else {
      setBookingError('No vendors are currently available for booking.');
    }
  };

  const vendorCards = vendors.map((vendor) => {
    const vendorServices = services.filter((service) => service.vendorId === vendor.id);
    return {
      ...vendor,
      name: vendor.businessName,
      startingPrice: vendorServices[0]?.startingPrice || 0,
      image: vendor.logo || vendor.coverImage || '',
      isVerified: vendor.verificationStatus === 'VERIFIED',
      reviewsCount: vendor.totalReviews || 0,
      location: `${vendor.city}, ${vendor.state}`,
      distance: vendor.distance || 0,
    };
  });

  // Dynamic filter for recommended vendors list based on selected category and query
  const filteredVendors = vendorCards.filter((vendor) => {
    const matchesCategory = selectedCategory
      ? vendor.category.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    const matchesSearch = searchQuery
      ? vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Spotlight curated featured vendors (verified and rating >= 4.7)
  const featuredVendors = vendorCards.filter((v) => v.isVerified && v.rating >= 4.7);

  // Bottom Navigation configuration with Lucide Icons
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'categories', label: 'Categories', icon: GridIcon },
    { id: 'market', label: 'Market', icon: BagIcon },
    { id: 'packages', label: 'Packages', icon: GiftIcon },
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  ];

  const selectedVendorServices = services.filter((service) => service.vendorId === selectedInquiryVendor?.id);
  const selectedDateSlots = availability.filter((slot) => String(slot.date).slice(0, 10) === inquiryDate);

  const openVendorInquiry = (vendor: any) => {
    const catalogVendor = vendorCards.find((item) => item.id === vendor.id) || vendor;
    setSelectedInquiryVendor(catalogVendor);
    setSelectedServiceId(services.find((service) => service.vendorId === catalogVendor.id)?.id || '');
    setBookingError(null);
    setAvailabilityError(null);
  };

  const openPackageBooking = (pkg: EventPackage) => {
    setSelectedInquiryPackage(pkg);
    setPackageVendorId(vendorCards[0]?.id || '');
    setBookingError(null);
  };

  const openServiceBooking = (service: any) => {
    const vendor = vendorCards.find((item) => item.id === service.vendorId);
    if (!vendor) {
      setBookingError('This service vendor is no longer available.');
      return;
    }
    openVendorInquiry(vendor);
    setSelectedServiceId(service.id);
  };

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedInquiryVendor) return;
    const token = localStorage.getItem('vendoora_token');
    if (!token) {
      setBookingError('Please sign in as a customer before submitting a booking.');
      return;
    }
    setBookingSubmitting(true);
    setBookingError(null);
    try {
      const selectedService = selectedVendorServices.find((service) => service.id === selectedServiceId);
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          vendorId: selectedInquiryVendor.id,
          serviceId: selectedServiceId || undefined,
          eventName: inquiryEventName || `${selectedInquiryVendor.name} - Custom celebration`,
          eventDate: inquiryDate,
          startTime: inquiryTime,
          endTime: inquiryEndTime,
          venue: inquiryVenue,
          guestCount: Number(inquiryGuests),
          totalPrice: selectedService?.startingPrice || selectedInquiryVendor.startingPrice || 0,
          specialRequest: inquiryMessage || undefined,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) throw new Error('Please sign in as a customer before submitting a booking.');
      if (response.status === 409) throw new Error(payload?.error || 'That time is no longer available. Please choose another slot.');
      if (!response.ok) throw new Error(payload?.error || 'Unable to submit booking');

      setBookingConfirmation({ ...payload.booking, order: payload.order });
      await loadCustomerBookings();
      onAddNotification({
        id: `n-${Date.now()}`,
        title: 'Booking Request Submitted',
        message: `Your request for "${inquiryEventName || selectedInquiryVendor.name}" was sent to the vendor.`,
        time: 'Just now',
        type: 'inquiry',
        read: false,
      });
      setSelectedInquiryVendor(null);
      setInquiryEventName('');
      setInquiryMessage('');
      setInquiryVenue('');
      setActiveTab('bookings');
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Unable to submit booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const loadRazorpayCheckout = () => new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayBooking = async (booking: any) => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) {
      setPaymentError('Please sign in as a customer before paying.');
      return;
    }
    setPaymentActionId(booking.id);
    setPaymentError(null);
    try {
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId: booking.id, currency: 'INR' }),
      });
      const payload = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) throw new Error('Please sign in as a customer before paying.');
      if (!response.ok) throw new Error(payload?.error || 'Unable to start payment');
      if (!(await loadRazorpayCheckout())) throw new Error('Unable to load Razorpay checkout');

      await new Promise<void>((resolve, reject) => {
        const checkout = new (window as any).Razorpay({
          key: payload.keyId,
          amount: payload.order.amount,
          currency: payload.order.currency,
          name: 'Vendoora',
          description: booking.eventName,
          order_id: payload.order.id,
          handler: async (result: any) => {
            try {
              const verifyResponse = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ bookingId: booking.id, ...result }),
              });
              const verifyPayload = await verifyResponse.json().catch(() => ({}));
              if (!verifyResponse.ok) throw new Error(verifyPayload?.error || 'Payment verification failed');
              await loadCustomerBookings();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: { ondismiss: () => reject(new Error('Payment was cancelled')) },
        });
        checkout.on('payment.failed', async (failure: any) => {
          await fetch('/api/payments/failed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ bookingId: booking.id, reason: failure?.error?.description }),
          });
          reject(new Error(failure?.error?.description || 'Payment failed'));
        });
        checkout.open();
      });
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Payment failed');
      await loadCustomerBookings();
    } finally {
      setPaymentActionId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) {
      setPaymentError('Please sign in as a customer before cancelling.');
      return;
    }
    setPaymentActionId(bookingId);
    setPaymentError(null);
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Unable to cancel booking');
      await loadCustomerBookings();
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Unable to cancel booking');
    } finally {
      setPaymentActionId(null);
    }
  };

  const submitReview = async (event: FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem('vendoora_token');
    if (!token) {
      setReviewError('Please sign in as a customer before reviewing.');
      return;
    }
    setReviewError(null);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: reviewOrderId, rating: reviewRating, comment: reviewComment }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Unable to submit review');
      setCustomerReviews((current) => [payload.review, ...current]);
      setReviewOrderId('');
      setReviewComment('');
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to submit review');
    }
  };

  const markNotificationRead = async (id: string) => {
    const token = localStorage.getItem('vendoora_token');
    if (!token) return;
    const response = await fetch(`/api/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification));
  };

  // Smooth scroll handler for Bottom Navigation mobile interactions
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const elementIdMap: { [key: string]: string } = {
      home: 'vendoora-landing-page',
      search: 'search-section-root',
      categories: 'categories-section-root',
      market: 'marketplace-section-root',
      packages: 'packages-section-root',
      bookings: 'customer-bookings-root',
    };
    const element = document.getElementById(elementIdMap[tabId]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div
      id={id || 'vendoora-landing-page'}
      className="min-h-screen bg-[#FCFBF7] text-zinc-800 flex flex-col relative transition-colors duration-300 pb-16 sm:pb-0"
    >
      {/* Mesh Blur Background Accents - Pinterest Editorial Vibe */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-teal-100/20 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* 1. Header (Strict order item 1) */}
      <HeaderBar
        vendorMode={false}
        onVendorModeToggle={(enabled) => {
          if (enabled) {
            onSwitchToVendor();
          }
        }}
        onSearchChange={setSearchQuery}
        onLocationChange={setSelectedLocation}
        onAccountClick={() => alert('Account authentication suite is preparing for main launch.')}
      />

      {/* Standalone Visual Welcome Banner preceding main search block */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-14 text-center space-y-4">
        <Badge variant="primary" outline size="sm">
          ✨ Premium Event Ecosystem
        </Badge>
        <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-zinc-900 tracking-tight leading-none">
          Plan Your Events,{' '}
          <span className="font-serif italic font-normal text-[#1E40AF]">
            Pocket-Friendly Prices.
          </span>
        </h1>
        <p className="max-w-xl mx-auto text-zinc-500 text-xs sm:text-sm md:text-base font-sans">
          Find vetted, top-performing celebration specialists and high-grade event gear near you.
        </p>
      </div>

      {/* Main Content Sections Flow */}
      <main className="flex-1 space-y-12 pb-16 md:pb-24">
        
        {/* 2. Search Section (Strict order item 2) */}
        <section id="search-section-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6">
          <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/50 bg-white/70 p-6 md:p-8 shadow-sm backdrop-blur-md">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="max-w-2xl space-y-4">
              <h2 className="font-heading font-bold text-xl md:text-2xl text-zinc-900 tracking-tight">
                Fast Vendor Discovery
              </h2>
              <p className="text-zinc-500 text-xs md:text-sm">
                Real-time distance metrics, verified contractor status, and fully transparent market quotes across {selectedLocation}.
              </p>
              <div className="pt-2">
                <SearchBar
                  id="home-standalone-search"
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search venues, decorators, catering, sound equipment..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Categories (Strict order item 3) */}
        <section id="categories-section-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">
                Browse Categories
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                Pick a professional specialty category to filter verified networks instantly
              </p>
            </div>
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="text-[#1E40AF] text-xs font-bold"
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.label.toLowerCase();
              return (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedCategory('');
                    } else {
                      setSelectedCategory(cat.label);
                      document.getElementById('recommended-vendors-root')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={isSelected ? 'border-[#1E40AF] ring-2 ring-indigo-500/10 bg-[#1E40AF]/5' : ''}
                />
              );
            })}
          </div>
        </section>

        {/* 4. Recommended Vendors (Strict order item 4) */}
        <section id="recommended-vendors-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">
                Recommended For You
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                Top matched suppliers near {selectedLocation} with outstanding ratings and pre-vetted pricing
              </p>
            </div>
            {selectedCategory && (
              <Badge variant="primary">
                {selectedCategory}
              </Badge>
            )}
          </div>

          {catalogLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500"><Loader2 className="w-5 h-5 animate-spin" />Loading verified vendors...</div>
          ) : catalogError ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-red-500"><AlertCircle className="w-5 h-5" />{catalogError}</div>
          ) : filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredVendors.map((vendor) => (
                <DSVendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onClick={openVendorInquiry}
                />
              ))}
            </div>
          ) : (
            <div className="w-full text-center py-12 border border-dashed border-zinc-200 rounded-[32px] bg-white/30">
              <p className="text-zinc-500 text-sm font-medium">
                No matching recommended vendors found for "{searchQuery}". Try selecting another category.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCategory('');
                  setSearchQuery('');
                }}
                className="mt-4"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>

        {/* 5. Vibe Reels (Strict order item 5) */}
        <section id="vibe-reels-root" className="w-full py-4">
          <VibeReelsTray
            id="landing-vibe-reels"
            reels={reels}
            onReelClick={(title) => {
              alert(`Opening 15s visual showcase: "${title}" (Visual streaming is mock-only in this demo).`);
            }}
          />
        </section>

        {/* 6. Secondary Market (Strict order item 6) */}
        <section id="marketplace-section-root" className="w-full py-4">
          <MarketplaceSection id="landing-equipment-marketplace" products={products} />
        </section>

        {/* 6.5. Marketplace Discovery with Filters (Strict order item 6.5) */}
        <section id="marketplace-discovery-root" className="w-full bg-gradient-to-b from-zinc-900 to-zinc-800 py-12">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <MarketplaceDiscovery onSelectVendor={openVendorInquiry} onSelectService={openServiceBooking} />
          </div>
        </section>

        {/* 7. Featured Vendors (Strict order item 7) */}
        <section id="featured-vendors-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6">
            <Badge variant="warning" size="sm" className="mb-2">
              ⭐ SPOTLIGHT VENDORS
            </Badge>
            <h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">
              Featured Elite Providers
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              Verified, premium event specialists with flawless project track records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {featuredVendors.slice(0, 2).map((vendor) => (
              <Card
                key={vendor.id}
                variant="glass"
                padding="none"
                className="relative overflow-hidden group hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row h-full">
                  {/* Thumbnail Image */}
                  <div className="w-full sm:w-1/2 h-52 sm:h-auto relative overflow-hidden bg-zinc-100">
                    <img
                      src={vendor.image}
                      alt={vendor.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent sm:block hidden" />
                  </div>

                  {/* Content Container */}
                  <div className="w-full sm:w-1/2 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <Badge variant="primary" size="sm">
                        {vendor.category}
                      </Badge>
                      <h4 className="font-heading font-bold text-base text-zinc-900 leading-tight">
                        {vendor.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                          {vendor.rating.toFixed(1)} ★
                        </span>
                        <span className="text-zinc-400 font-normal">({vendor.reviewsCount} reviews)</span>
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Located in {vendor.location} • {vendor.distance} km away
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                      <div>
                        <span className="block text-[8px] uppercase font-bold text-zinc-400">
                          Starting Price
                        </span>
                        <span className="text-zinc-950 font-mono font-bold text-sm">
                          ₹{vendor.startingPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openVendorInquiry(vendor)}
                      >
                        Inquire
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 8. Popular Packages (Strict order item 8) */}
        <section id="packages-section-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6">
            <Badge variant="success" size="sm" className="mb-2">
              🎁 HANDPICKED BUNDLES
            </Badge>
            <h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">
              Popular Event Packages
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              Curated, pre-packaged event services ensuring luxury results at negotiated package rates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {POPULAR_PACKAGES.map((pkg) => (
              <Card
                key={pkg.id}
                variant="surface"
                padding="sm"
                className="h-full flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Package Thumbnail */}
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-zinc-100">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-zinc-200 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-[#1E40AF]">
                      {pkg.badge}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-base text-zinc-900 group-hover:text-[#1E40AF] transition-colors">
                      {pkg.name}
                    </h4>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Included list items */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400 block">
                      Services Included:
                    </span>
                    <ul className="space-y-1">
                      {pkg.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-600 flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">✓</span>
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-zinc-100 pt-4 mt-4 flex items-center justify-between">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-zinc-400">
                      Negotiated Package Price
                    </span>
                    <span className="text-zinc-900 font-mono font-bold text-base md:text-lg">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openPackageBooking(pkg)}
                  >
                    Configure
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section id="customer-bookings-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">Your Bookings</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Track booking requests and confirmed event schedules.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadCustomerBookings}>Refresh</Button>
          </div>
          {bookingConfirmation && (
            <Card variant="surface" className="mb-6 border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <ClipboardList className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-heading font-bold text-emerald-900">Booking request submitted</h4>
                  <p className="text-xs text-emerald-700 mt-1">{bookingConfirmation.eventName} · {String(bookingConfirmation.eventDate).slice(0, 10)} at {bookingConfirmation.startTime}</p>
                  <p className="text-[10px] text-emerald-600 mt-1 font-mono">Reference: {bookingConfirmation.id}</p>
                </div>
              </div>
            </Card>
          )}
          {paymentError && <p className="mb-4 flex items-center gap-2 text-xs text-red-600"><AlertCircle className="w-4 h-4" />{paymentError}</p>}
          {customerBookingsLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500"><Loader2 className="w-5 h-5 animate-spin" />Loading your bookings...</div>
          ) : customerBookingsError ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-amber-600"><AlertCircle className="w-5 h-5" />{customerBookingsError}</div>
          ) : customerBookings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-200 rounded-[24px] bg-white/40 text-sm text-zinc-500">No customer bookings yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerBookings.map((booking) => (
                <Card key={booking.id} variant="surface" className="p-5 border-zinc-200">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-heading font-bold text-zinc-900">{booking.eventName}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{booking.vendor?.businessName || 'Vendor'} · {String(booking.eventDate).slice(0, 10)}</p>
                      <p className="text-xs text-zinc-500">{booking.startTime}{booking.endTime ? `–${booking.endTime}` : ''} · {booking.venue}</p>
                      {customerOrders.find((order) => order.bookingId === booking.id) && <p className="text-xs text-indigo-600">Fulfillment: {customerOrders.find((order) => order.bookingId === booking.id).status}</p>}
                    </div>
                    <Badge variant={booking.status === 'DECLINED' ? 'danger' : booking.status === 'COMPLETED' ? 'success' : 'primary'}>{booking.status}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                    <span className="text-xs text-zinc-500">Payment: {booking.paymentStatus || booking.payment?.status || 'PENDING'}{booking.totalPrice ? ` · ₹${Number(booking.totalPrice).toLocaleString('en-IN')}` : ''}</span>
                    <div className="flex gap-2">
                      {booking.paymentStatus !== 'PAID' && booking.paymentStatus !== 'REFUNDED' && booking.status !== 'DECLINED' && (
                        <Button size="sm" onClick={() => handlePayBooking(booking)} disabled={paymentActionId === booking.id}>
                          {paymentActionId === booking.id ? 'Processing...' : booking.paymentStatus === 'FAILED' ? 'Retry payment' : 'Pay now'}
                        </Button>
                      )}
                      {(booking.status === 'PENDING' || booking.status === 'SCHEDULED') && (
                        <Button size="sm" variant="secondary" onClick={() => handleCancelBooking(booking.id)} disabled={paymentActionId === booking.id}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section id="customer-reviews-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6"><h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">Your Reviews</h3><p className="text-zinc-500 text-xs mt-0.5">Share feedback after an order is completed.</p></div>
          {reviewError && <p className="mb-4 text-xs text-red-600">{reviewError}</p>}
          {customerOrders.filter((order) => order.status === 'COMPLETED' && !customerReviews.some((review) => review.orderId === order.id)).length > 0 && (
            <form onSubmit={submitReview} className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Completed order<select required value={reviewOrderId} onChange={(event) => setReviewOrderId(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs"><option value="">Choose order</option>{customerOrders.filter((order) => order.status === 'COMPLETED' && !customerReviews.some((review) => review.orderId === order.id)).map((order) => <option key={order.id} value={order.id}>{order.booking.eventName}</option>)}</select></label>
              <label className="text-[10px] uppercase font-bold text-zinc-500">Rating<select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
              <label className="text-[10px] uppercase font-bold text-zinc-500 md:col-span-1">Comment<input value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs" placeholder="Tell the vendor about your experience" /></label>
              <Button type="submit" size="sm">Submit review</Button>
            </form>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{customerReviews.map((review) => <Card key={review.id} variant="surface" className="p-4 border-zinc-200"><p className="text-sm font-bold text-zinc-900">{review.vendor?.businessName} · {review.rating}/5</p><p className="text-xs text-zinc-500 mt-1">{review.comment || 'No comment provided.'}</p></Card>)}</div>
        </section>

        <section id="customer-notifications-root" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="mb-6 flex items-center justify-between"><div><h3 className="font-heading font-bold text-lg md:text-xl text-zinc-900">Notifications</h3><p className="text-zinc-500 text-xs mt-0.5">Booking, payment, order, and review updates.</p></div><Badge variant="primary">{notifications.filter((notification) => !notification.read).length} unread</Badge></div>
          <div className="space-y-2">{notifications.slice(0, 8).map((notification) => <button key={notification.id} type="button" onClick={() => markNotificationRead(notification.id)} className={`w-full text-left rounded-xl border p-3 ${notification.read ? 'border-zinc-200 bg-white/50' : 'border-indigo-200 bg-indigo-50'}`}><p className="text-xs font-bold text-zinc-900">{notification.title}</p><p className="text-xs text-zinc-500 mt-1">{notification.message}</p></button>)}</div>
        </section>

      </main>

      {/* Editorial Responsive Brand Footer */}
      <footer className="w-full bg-zinc-900 border-t border-zinc-800 py-12 text-zinc-400 font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 space-y-3 text-center md:text-left">
            <h4 className="font-heading font-black tracking-tight text-white text-lg uppercase">
              VENDOORA
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              The premium, hand-vetted event directory and secondary marketplace for Indian celebrations.
            </p>
          </div>

          <div className="md:col-span-8 flex flex-wrap justify-center md:justify-end gap-6 text-xs font-semibold">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-white transition-colors"
            >
              Vendor Terms & Conditions
            </button>
            <span className="text-zinc-700">|</span>
            <button
              onClick={() => setIsLegalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Legal & Privacy
            </button>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-600">© 2026 Vendoora India. All rights reserved.</span>
          </div>

        </div>
      </footer>

      {/* Floating stacks: WhatsApp and Budget Calculator FAB */}
      <WhatsAppChatFab id="landing-chat-fabs" onOpenCalculator={() => setIsBudgetOpen(true)} />

      {/* 9. Bottom Navigation (Strict order item 9 - Floats on mobile, hidden on desktop) */}
      <BottomNavigation
        tabs={navigationTabs}
        activeTabId={activeTab}
        onChange={handleTabChange}
      />

      {/* Budget estimation glassmorphic modal */}
      {isBudgetOpen && (
        <BudgetCalculatorModal
          isOpen={isBudgetOpen}
          onClose={() => setIsBudgetOpen(false)}
          onBookClick={handleBookEstimate}
        />
      )}

      {/* 10. Custom Vendor Inquiry Modal */}
      {selectedInquiryVendor && (
        <Modal
          isOpen={!!selectedInquiryVendor}
          onClose={() => setSelectedInquiryVendor(null)}
          title={`Inquire with ${selectedInquiryVendor.name}`}
          subtitle={`Fill out your celebration details to connect and request quotes for ${selectedInquiryVendor.category}`}
          size="md"
        >
          <form onSubmit={submitBooking} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Event Name / Occasion</label>
              <Input
                type="text"
                required
                placeholder="e.g. Wedding Reception, Birthday Party..."
                value={inquiryEventName}
                onChange={(e) => setInquiryEventName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Date</label>
                <Input
                  type="date"
                  required
                  value={inquiryDate}
                  onChange={(e) => setInquiryDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Setup Time</label>
                <select
                  required
                  value={inquiryTime}
                  onChange={(e) => setInquiryTime(e.target.value)}
                  disabled={availabilityLoading || !availabilityAccepting || selectedDateSlots.length === 0}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm disabled:opacity-50"
                >
                  {selectedDateSlots.length === 0 && <option value="">No slots</option>}
                  {selectedDateSlots.map((slot) => <option key={`${slot.startTime}-${slot.endTime}`} value={slot.startTime}>{slot.startTime}–{slot.endTime}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">End Time</label>
                <Input type="time" required readOnly value={inquiryEndTime} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Service</label>
              <select
                required={selectedVendorServices.length > 0}
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm"
              >
                {selectedVendorServices.length === 0 && <option value="">Vendor-wide inquiry</option>}
                {selectedVendorServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.title} · ₹{service.startingPrice.toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3 space-y-2">
              {availabilityLoading && <p className="text-xs text-zinc-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading availability...</p>}
              {availabilityError && <p className="text-xs text-red-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{availabilityError}</p>}
              {!availabilityLoading && !availabilityError && !availabilityAccepting && <p className="text-xs text-amber-600">This vendor is paused and cannot accept bookings.</p>}
              {!availabilityLoading && !availabilityError && availabilityAccepting && selectedDateSlots.length === 0 && <p className="text-xs text-zinc-500">No available time slots for this date.</p>}
              {!availabilityLoading && !availabilityError && availabilityAccepting && selectedDateSlots.length > 0 && <p className="text-xs text-emerald-600">Available: {selectedDateSlots.map((slot) => `${slot.startTime}–${slot.endTime}`).join(', ')}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Est. Guests</label>
                <Input
                  type="number"
                  required
                  value={inquiryGuests}
                  onChange={(e) => setInquiryGuests(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Location</label>
                <Input
                  type="text"
                  required
                  placeholder="Venue or address"
                  value={inquiryVenue}
                  onChange={(e) => setInquiryVenue(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Special Requirements (Optional)</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Describe lighting setups, food preferences, size requirements..."
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
              />
            </div>
            {bookingError && <p className="text-xs text-red-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{bookingError}</p>}
            <Button type="submit" variant="primary" className="w-full py-3 font-bold uppercase tracking-wide">
              {bookingSubmitting ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </form>
        </Modal>
      )}

      {/* 11. Custom Package Configurator Modal */}
      {selectedInquiryPackage && (
        <Modal
          isOpen={!!selectedInquiryPackage}
          onClose={() => setSelectedInquiryPackage(null)}
          title={`Configure ${selectedInquiryPackage.name}`}
          subtitle={`Custom fit this pre-negotiated bundle for your event near ${selectedLocation}`}
          size="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const vendor = vendorCards.find((item) => item.id === packageVendorId);
              if (!vendor) {
                setBookingError('Select a vendor before continuing.');
                return;
              }
              setSelectedInquiryPackage(null);
              setInquiryEventName(`${selectedInquiryPackage.name} Booking`);
              setInquiryVenue(`Royal Banquets, ${selectedLocation}`);
              openVendorInquiry(vendor);
            }}
            className="space-y-4"
          >
            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
              <span className="text-[9px] font-extrabold bg-[#1E40AF]/15 text-[#1E40AF] px-2 py-0.5 rounded-full uppercase tracking-widest">{selectedInquiryPackage.badge}</span>
              <h4 className="font-heading font-bold text-zinc-900 dark:text-white text-sm">{selectedInquiryPackage.name}</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">{selectedInquiryPackage.description}</p>
              <div className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-200 pt-1">
                Total Price: ₹{selectedInquiryPackage.price.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Select vendor</label>
              <select required value={packageVendorId} onChange={(e) => setPackageVendorId(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm">
                <option value="">Choose a vendor</option>
                {vendorCards.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Target Date</label>
                <Input
                  type="date"
                  required
                  value={inquiryDate}
                  onChange={(e) => setInquiryDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">Dispatch Time</label>
                <Input
                  type="time"
                  required
                  value={inquiryTime}
                  onChange={(e) => setInquiryTime(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 leading-relaxed font-sans">
                🛡️ **Vendoora Direct Settlement Policy:** Enjoy 100% moneyback guarantee and verified on-time dispatch SLA. Released only via client completion OTP on-site.
              </p>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 font-bold uppercase tracking-wide">
              Secure Package Booking
            </Button>
          </form>
        </Modal>
      )}

      {/* Terms Agreement Modal */}
      {isTermsOpen && (
        <VendorTermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      )}

      {/* Privacy Information Modal */}
      {isLegalOpen && (
        <LegalModal isOpen={isLegalOpen} onClose={() => setIsLegalOpen(false)} />
      )}

    </div>
  );
}
