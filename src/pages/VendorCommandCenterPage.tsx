/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CalendarClock,
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
} from 'lucide-react';
import HeaderBar from '../components/layout/HeaderBar';
import { Button, Input, Badge, Card, Toggle } from '../components/design-system';
import { computeSuggestedPrice } from '../components/command-center/aiPricing';
import VendorAnalyticsRow from '../components/command-center/VendorAnalyticsRow';

// Types for local support
interface VendorCommandCenterPageProps {
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
  bookings: any[];
  onUpdateBookings: (bookings: any[]) => void;
  onAddBooking: (booking: any) => void;
  notifications: any[];
  onAddNotification: (notif: any) => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

export default function VendorCommandCenterPage({
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
  bookings,
  onUpdateBookings,
  onAddBooking,
  notifications,
  onAddNotification,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}: VendorCommandCenterPageProps) {
  // Navigation & Control States
  const [activeTab, setActiveTab] = useState<'analytics' | 'bookings' | 'inventory' | 'pricing' | 'seller' | 'reels' | 'notifications'>('analytics');
  const [acceptingBookings, setAcceptingBookings] = useState(true);

  // Countdown timer for next live setup dispatch
  const [secondsLeft, setSecondsLeft] = useState(1 * 3600 + 42 * 60 + 15);
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);

  // New Inventory Form State
  const [newInvName, setNewInvName] = useState('');
  const [newInvUnits, setNewInvUnits] = useState(10);
  const [newInvHourly, setNewInvHourly] = useState(150);
  const [newInvDaily, setNewInvDaily] = useState(1000);
  const [newInvImagePreset, setNewInvImagePreset] = useState('sofa');

  // New Used Gear Form State
  const [newGearName, setNewGearName] = useState('');
  const [newGearRetail, setNewGearRetail] = useState(30000);
  const [newGearCondition, setNewGearCondition] = useState<'Mint' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [newGearAge, setNewGearAge] = useState(6);

  // Dynamic AI Pricing Tool States
  const [calcBase, setCalcBase] = useState(15000);
  const [calcSeason, setCalcSeason] = useState<'Standard' | 'Peak' | 'Off'>('Standard');
  const [calcDistance, setCalcDistance] = useState(15);
  const [calcCrew, setCalcCrew] = useState(4);

  // Reels form state
  const [newReelTitle, setNewReelTitle] = useState('');

  // Notifications filtering state
  const [notifFilter, setNotifFilter] = useState<'all' | 'inquiry' | 'payment' | 'system' | 'alert'>('all');

  // Verification code validation is simple: any 4+ digits releases HDFC settlement
  const handleVerifyOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otpInput.length >= 4) {
      setIsOtpSuccess(true);
      onAddNotification({
        id: `n-${Date.now()}`,
        title: 'Settlement Released',
        message: 'OTP check verified. HDFC automated payout disbursement of ₹1,20,000 completed successfully.',
        time: 'Just now',
        type: 'payment',
        read: false,
      });
      setOtpInput('');
    }
  };

  // Dispatch live countdown ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCritical = secondsLeft < 2 * 3600;

  // Derive active items & counts
  const unreadNotifCount = notifications.filter((n) => !n.read).length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  // Add new inventory handler
  const handleAddNewInventorySubmit = (e: FormEvent) => {
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

    const newItem = {
      id: `i-${Date.now()}`,
      name: newInvName,
      units: newInvUnits,
      hourlyRate: newInvHourly,
      dailyRate: newInvDaily,
      image: imageUrl,
    };

    onAddInventoryItem(newItem);

    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Inventory Feed Expanded',
      message: `Successfully listed "${newInvName}" (${newInvUnits} Units) in your live customer catalog.`,
      time: 'Just now',
      type: 'system',
      read: false,
    });

    setNewInvName('');
    alert(`Success! "${newInvName}" has been added to your live inventory feed.`);
  };

  // Add used gear product
  const handleAddUsedGearSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newGearName.trim()) return;

    const suggestedPrice = computeSuggestedPrice(newGearRetail, newGearCondition, newGearAge);

    const newProd = {
      id: `p-${Date.now()}`,
      name: newGearName,
      price: suggestedPrice,
      condition: newGearCondition,
      location: 'Mumbai, MH',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800',
    };

    onAddProduct(newProd);

    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Secondary Listing Published',
      message: `Pre-owned "${newGearName}" is now active in the Vendoora equipment marketplace. Resale Price: ₹${suggestedPrice.toLocaleString('en-IN')}.`,
      time: 'Just now',
      type: 'system',
      read: false,
    });

    setNewGearName('');
    alert(`Success! Your equipment "${newGearName}" has been published to the secondary marketplace for users!`);
  };

  // Add vibe reel handler
  const handlePublishReelSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newReelTitle.trim()) return;

    const newReel = {
      id: `r-${Date.now()}`,
      title: newReelTitle,
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      views: '1.2K',
      duration: '0:15',
    };

    onAddReel(newReel);

    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Vibe Reel Published',
      message: `Your new 15s visual showcase "${newReelTitle}" is now live on the Vendoora exploration tray.`,
      time: 'Just now',
      type: 'system',
      read: false,
    });

    setNewReelTitle('');
    alert('Prisitine 15-second reel published live to the user feed!');
  };

  // Simulation generator
  const triggerSimulationBooking = () => {
    const clients = ['Karan Johar', 'Aishwarya Sen', 'Vikram Seth', 'Priyanjali Roy', 'Gautam Adani'];
    const occasions = ['Royal Sangeet Gala', 'Mehendi Poolside Party', 'Elite DJ Night Launch', 'Luxury Banquet Reception', 'Sunset Beach Mandap Setup'];
    const budgets = ['₹2,50,000 Premium', '₹4,50,000 Shahi', '₹1,80,000 Sufi Night', '₹1,20,000 Classic'];
    
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomOccasion = occasions[Math.floor(Math.random() * occasions.length)];
    const randomBudget = budgets[Math.floor(Math.random() * budgets.length)];

    const newBooking = {
      id: `e-${Date.now()}`,
      eventName: `${randomOccasion} (Simulated)`,
      clientName: `${randomClient} (Client)`,
      date: '2026-07-28',
      time: '19:30',
      location: 'Marine Drive Pavilion, Mumbai',
      status: 'pending' as const,
    };

    onAddBooking(newBooking);

    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Booking Inquiry Received',
      message: `New request from ${randomClient} for a "${randomOccasion}" on 2026-07-28. Estimated matching tier: ${randomBudget}.`,
      time: 'Just now',
      type: 'inquiry',
      read: false,
    });

    setActiveTab('bookings');
    alert(`💡 SIMULATION TRIGERRED: A real client inquiry has been placed! Check the Bookings section below to Accept or Reject.`);
  };

  // Reject Booking
  const handleRejectBooking = (bookingId: string) => {
    const updated = bookings.filter((b) => b.id !== bookingId);
    onUpdateBookings(updated);
    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Booking Inquiry Declined',
      message: 'You declined an event inquiry. The client has been notified to match alternative suppliers.',
      time: 'Just now',
      type: 'system',
      read: false,
    });
  };

  // Accept Booking
  const handleAcceptBooking = (bookingId: string) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: 'scheduled' as const } : b
    );
    onUpdateBookings(updated);
    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'Inquiry Scheduled',
      message: 'Congratulations! Booking inquiry accepted and locked in the logistics timeline schedule.',
      time: 'Just now',
      type: 'system',
      read: false,
    });
    alert('Inquiry successfully accepted! The setup crew dispatch has been integrated into your live timeline.');
  };

  // Filtered Notifications
  const filteredNotifs = notifications.filter((n) => {
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
                <h3 className="font-heading font-black text-white text-base mt-0.5 uppercase tracking-tight">Sharma Tent House</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-zinc-300">4.85 Rating</span>
                  <Badge variant="success" size="sm" className="scale-90 origin-left">Verified</Badge>
                </div>
              </div>
            </div>

            {/* Live Status Switcher */}
            <div className="p-4 border-b border-zinc-900 bg-zinc-900/10">
              <Toggle
                checked={acceptingBookings}
                onChange={setAcceptingBookings}
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

          {/* Simulate Action widget */}
          <Card
            variant="glass"
            padding="sm"
            className="border-dashed border-indigo-500/30 bg-indigo-500/5 rounded-[28px] p-5 space-y-3 shadow-lg text-center"
          >
            <Sparkles className="w-5 h-5 text-indigo-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h5 className="font-heading font-extrabold text-white text-xs uppercase tracking-wide">Developer Tools</h5>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Trigger a live client booking request simulation on the home page and watch it update this dashboard!
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerSimulationBooking}
              className="w-full py-2.5 text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-purple-500 to-indigo-500 border-none shadow-md shadow-indigo-950/50"
            >
              Simulate Live Booking
            </Button>
          </Card>
        </aside>

        {/* Right Side: Active Workspace View */}
        <main className="lg:col-span-9 space-y-8 min-h-[70vh]">
          
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
                  monthlyEarnings={145000}
                  activeInquiries={pendingBookingsCount}
                  rating={4.85}
                />

                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 backdrop-blur-md rounded-[32px] p-6 md:p-8 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-heading font-semibold text-white text-base">Celebration Season Targets</h4>
                      <p className="text-zinc-500 text-xs mt-0.5">Cumulative progress on your quarterly professional revenue milestones</p>
                    </div>
                    <Badge variant="primary">Q3 Peak Season</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    {/* Goal Card 1 */}
                    <div className="space-y-2 bg-zinc-900/20 p-5 rounded-2xl border border-zinc-850">
                      <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase">
                        <span>Revenue Accomplished</span>
                        <span className="text-indigo-400 font-mono">₹2,45,000 / ₹3,00,000</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full w-[81.6%]" />
                      </div>
                      <p className="text-[10px] text-zinc-500">81.6% achieved • You are on pace to clear your monsoon season bonus milestones!</p>
                    </div>

                    {/* Goal Card 2 */}
                    <div className="space-y-2 bg-zinc-900/20 p-5 rounded-2xl border border-zinc-850">
                      <div className="flex justify-between text-xs text-zinc-400 font-bold uppercase">
                        <span>Average Response Latency</span>
                        <span className="text-emerald-400 font-mono">14 Mins avg</span>
                      </div>
                      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full w-[95%]" />
                      </div>
                      <p className="text-[10px] text-zinc-500">Highly Critical • Ranked in the **top 5%** of Maharashtra on-site dispatchers.</p>
                    </div>
                  </div>

                  {/* Customer Rating distribution */}
                  <div className="border-t border-zinc-900 pt-6 mt-4">
                    <h5 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-4">Verification Checkpoints & Compliance</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">GSTIN Verified</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">PASS</span>
                      </div>
                      <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">SLA Guarantee</span>
                        <span className="text-xs font-mono font-bold text-emerald-400 mt-1 block">99.2% ON TIME</span>
                      </div>
                      <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Insurance coverage</span>
                        <span className="text-xs font-mono font-bold text-zinc-400 mt-1 block">₹5,00,000 SECURE</span>
                      </div>
                      <div className="p-4 bg-zinc-900/30 rounded-xl border border-zinc-900">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold">Payouts settled</span>
                        <span className="text-xs font-mono font-bold text-indigo-400 mt-1 block">AUTOMATED</span>
                      </div>
                    </div>
                  </div>
                </Card>
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
                  <p className="text-zinc-500 text-xs mt-0.5">Approve incoming customer celebration inquiries and verify on-site payout OTP releases</p>
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
                      <p className="text-xs text-zinc-500">Click the Developer Simulation button in the sidebar to generate custom user booking leads.</p>
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

                {/* 2. Dispatch Logistics Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-6 h-full">
                      <div>
                        <h4 className="font-heading font-semibold text-white text-base">Active Logistics Timeline</h4>
                        <p className="text-zinc-500 text-xs mt-0.5">On-site equipment dispatch and setup calendar locks</p>
                      </div>

                      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-zinc-800">
                        {bookings.filter((b) => b.status !== 'pending').map((event) => (
                          <div key={event.id} className="relative flex justify-between items-center gap-4">
                            <div className={`absolute -left-[21px] w-[11px] h-[11px] rounded-full border-2 ${event.status === 'in_progress' ? 'bg-pink-500 border-pink-400 animate-pulse' : 'bg-zinc-800 border-zinc-700'}`} />
                            <div className="space-y-0.5">
                              <span className="block text-[10px] font-mono text-zinc-500">{event.date} • {event.time} hrs</span>
                              <h5 className="font-heading font-semibold text-white text-xs sm:text-sm">{event.eventName}</h5>
                              <p className="text-[11px] text-zinc-500">{event.location}</p>
                            </div>
                            <Badge variant={event.status === 'in_progress' ? 'danger' : 'secondary'} size="sm">
                              {event.status === 'in_progress' ? 'Live Setup' : 'Confirmed'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* 3. OTP Settlement released */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Next Dispatch countdown</span>
                        <Timer className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase">Setup time remaining</h4>
                        <div className={`text-3xl md:text-4xl font-extrabold font-mono tracking-tighter ${isCritical ? 'text-red-500 animate-pulse filter drop-shadow-[0_0_8px_rgba(239,68,68,0.2)]' : 'text-white'}`}>
                          {formatTime(secondsLeft)}
                        </div>
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                        {isCritical ? (
                          <span className="text-red-400 font-semibold">🚨 Warning: Less than 2 hours to setup! Get your crew checked-in.</span>
                        ) : (
                          <span>*Ensure crew dispatches and trucks are loaded prior to timer countdown termination.</span>
                        )}
                      </p>
                    </Card>

                    <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">OTP Settlement</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>

                      <AnimatePresence mode="wait">
                        {!isOtpSuccess ? (
                          <motion.form
                            key="otp-form"
                            onSubmit={handleVerifyOtpSubmit}
                            className="space-y-3"
                          >
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-zinc-400 font-bold uppercase block">Enter completion OTP</label>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  maxLength={6}
                                  required
                                  placeholder="e.g. 5249"
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                  className="font-mono tracking-widest text-sm text-center bg-zinc-950 border-zinc-800"
                                />
                                <Button type="submit" variant="primary" className="py-2.5 font-bold uppercase tracking-wide px-4">
                                  Verify
                                </Button>
                              </div>
                            </div>
                            <p className="text-[9px] text-zinc-500">*Input client-provided OTP on-site to release automated escrow funds.</p>
                          </motion.form>
                        ) : (
                          <motion.div
                            key="otp-success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2"
                          >
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                            <h5 className="font-heading font-bold text-xs text-white">Verification Complete!</h5>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">₹1,20,000 release processed directly to HDFC settling nodes.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </div>
                </div>
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
                    <form onSubmit={handlePublishReelSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
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
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs font-bold border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 bg-transparent"
                    >
                      Mark All Read
                    </Button>
                  </div>
                </div>

                <Card variant="glass" className="border-zinc-800 bg-zinc-950/40 rounded-[32px] p-6 space-y-6">
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
                          onClick={() => onMarkNotificationRead(log.id)}
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
