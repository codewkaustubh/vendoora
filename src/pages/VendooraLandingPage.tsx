/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Home as HomeIcon,
  Search as SearchIcon,
  LayoutGrid as GridIcon,
  ShoppingBag as BagIcon,
  Gift as GiftIcon,
  Sparkles,
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
import WhatsAppChatFab from '../components/layout/WhatsAppChatFab';
import BudgetCalculatorModal from '../components/budget/BudgetCalculatorModal';
import VendorTermsModal from '../components/vendor/VendorTermsModal';
import LegalModal from '../components/vendoora/LegalModal';

// Mock Data
import { CATEGORIES, VENDORS } from '../data/vendooraMockData';

interface VendooraLandingPageProps {
  id?: string;
  onSwitchToVendor: () => void;
  reels?: any[];
  products?: any[];
  bookings?: any[];
  onAddBooking: (booking: any) => void;
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
  bookings,
  onAddBooking,
  onAddNotification,
}: VendooraLandingPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('Mumbai, MH');
  const [activeTab, setActiveTab] = useState('home');

  // Modals active state
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);

  // Client Inquiry State Flows
  const [selectedInquiryVendor, setSelectedInquiryVendor] = useState<any | null>(null);
  const [selectedInquiryPackage, setSelectedInquiryPackage] = useState<EventPackage | null>(null);
  const [inquiryEventName, setInquiryEventName] = useState('');
  const [inquiryDate, setInquiryDate] = useState('2026-07-20');
  const [inquiryTime, setInquiryTime] = useState('18:00');
  const [inquiryGuests, setInquiryGuests] = useState('150');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleBookEstimate = (estimateRange: string) => {
    setIsBudgetOpen(false);

    const newBooking = {
      id: `e-${Date.now()}`,
      eventName: `${estimateRange} Budget Plan`,
      clientName: 'Rahul Mehta (Lead)',
      date: '2026-08-15',
      time: '19:00',
      location: `Celebration Hall, ${selectedLocation}`,
      status: 'pending' as const,
    };

    onAddBooking(newBooking);

    onAddNotification({
      id: `n-${Date.now()}`,
      title: 'New Celebration Budget Lead',
      message: `A client requested supplier matchmaking for a ${estimateRange} tier budget near ${selectedLocation}.`,
      time: 'Just now',
      type: 'inquiry',
      read: false,
    });

    alert(`Success! Your budget plan for ${estimateRange} has been submitted. Switch to the Vendor Command Center to review this lead!`);
  };

  // Dynamic filter for recommended vendors list based on selected category and query
  const filteredVendors = VENDORS.filter((vendor) => {
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
  const featuredVendors = VENDORS.filter((v) => v.isVerified && v.rating >= 4.7);

  // Bottom Navigation configuration with Lucide Icons
  const navigationTabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    { id: 'categories', label: 'Categories', icon: GridIcon },
    { id: 'market', label: 'Market', icon: BagIcon },
    { id: 'packages', label: 'Packages', icon: GiftIcon },
  ];

  // Smooth scroll handler for Bottom Navigation mobile interactions
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const elementIdMap: { [key: string]: string } = {
      home: 'vendoora-landing-page',
      search: 'search-section-root',
      categories: 'categories-section-root',
      market: 'marketplace-section-root',
      packages: 'packages-section-root',
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

          {filteredVendors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredVendors.map((vendor) => (
                <DSVendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onClick={(v) => setSelectedInquiryVendor(v)}
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
                        onClick={() => setSelectedInquiryVendor(vendor)}
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
                    onClick={() => setSelectedInquiryPackage(pkg)}
                  >
                    Configure
                  </Button>
                </div>
              </Card>
            ))}
          </div>
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const newBooking = {
                id: `e-${Date.now()}`,
                eventName: inquiryEventName || `${selectedInquiryVendor.name} - Custom celebration`,
                clientName: 'Rahul Mehta (Client)',
                date: inquiryDate,
                time: inquiryTime,
                location: `${selectedLocation}`,
                status: 'pending' as const,
              };

              onAddBooking(newBooking);

              onAddNotification({
                id: `n-${Date.now()}`,
                title: 'New Client Inquiry',
                message: `Rahul Mehta requested a quote for "${selectedInquiryVendor.name}" on ${inquiryDate} for "${inquiryEventName || 'Exclusive Celebration'}".`,
                time: 'Just now',
                type: 'inquiry',
                read: false,
              });

              alert(`Success! Your inquiry has been sent to "${selectedInquiryVendor.name}". Go to the Vendor Command Center to manage and approve this booking!`);
              setSelectedInquiryVendor(null);
              setInquiryEventName('');
              setInquiryMessage('');
            }}
            className="space-y-4"
          >
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
                <Input
                  type="time"
                  required
                  value={inquiryTime}
                  onChange={(e) => setInquiryTime(e.target.value)}
                />
              </div>
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
                  readOnly
                  value={selectedLocation}
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
            <Button type="submit" variant="primary" className="w-full py-3 font-bold uppercase tracking-wide">
              Submit Premium Inquiry
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
              const newBooking = {
                id: `e-${Date.now()}`,
                eventName: `${selectedInquiryPackage.name} Booking`,
                clientName: 'Sneha Patel (Client)',
                date: inquiryDate,
                time: inquiryTime,
                location: `Royal Banquets, ${selectedLocation}`,
                status: 'pending' as const,
              };

              onAddBooking(newBooking);

              onAddNotification({
                id: `n-${Date.now()}`,
                title: 'New Package Booking',
                message: `Sneha Patel requested a booking for the package "${selectedInquiryPackage.name}" on ${inquiryDate} in ${selectedLocation}. (Package Rate: ₹${selectedInquiryPackage.price.toLocaleString('en-IN')})`,
                time: 'Just now',
                type: 'inquiry',
                read: false,
              });

              alert(`Success! Your custom package order for "${selectedInquiryPackage.name}" has been placed. Go to the Vendor Command Center's Bookings tab to view and accept it!`);
              setSelectedInquiryPackage(null);
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
