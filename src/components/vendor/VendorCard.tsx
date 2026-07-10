/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ShieldCheck, MapPin, BadgePercent } from 'lucide-react';
import { Vendor } from '../../types';
import StarRating from '../common/StarRating';
import { BrandTokens } from '../vendoora/BrandTokens';

interface VendorCardProps {
  key?: string;
  vendor: Vendor;
  onSelect?: (vendor: Vendor) => void;
}

export default function VendorCard({ vendor, onSelect }: VendorCardProps) {
  return (
    <motion.div
      id={`vendor-card-${vendor.id}`}
      onClick={() => onSelect?.(vendor)}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative overflow-hidden cursor-pointer rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between p-5 shadow-sm group ${BrandTokens.styles.holographicHover}`}
    >
      
      {/* Visual Header / Thumbnail */}
      <div className="relative w-full h-44 rounded-[24px] overflow-hidden mb-4 bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <img
          src={vendor.image}
          alt={vendor.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Verified Indicator Badge - Soft Mint Style */}
        {vendor.isVerified && (
          <div
            className={`absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${BrandTokens.colors.softMint} shadow-sm`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        )}

        {/* Distance indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-tight">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>{vendor.distance.toFixed(1)} km</span>
        </div>
      </div>

      {/* Product / Vendor Info */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1E40AF] dark:text-indigo-400">
            {vendor.category}
          </span>
          <h4 className="font-heading font-semibold text-zinc-900 dark:text-zinc-50 text-base md:text-lg tracking-tight leading-tight mt-1 line-clamp-1">
            {vendor.name}
          </h4>
        </div>

        <div className="space-y-2">
          {/* Star Ratings */}
          <StarRating rating={vendor.rating} maxStars={5} className="py-0.5" />

          {/* Location details */}
          <span className="text-zinc-400 dark:text-zinc-500 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{vendor.location}</span>
          </span>
        </div>

        {/* Pricing Actions row */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
              Starting Price
            </span>
            <span className="text-zinc-900 dark:text-white font-bold font-mono text-base md:text-lg">
              ₹{vendor.startingPrice.toLocaleString('en-IN')}
              {vendor.category === 'Catering' ? ' /plate' : ''}
            </span>
          </div>

          <div className={BrandTokens.styles.glassPillBtn}>
            Book
          </div>
        </div>
      </div>

    </motion.div>
  );
}
