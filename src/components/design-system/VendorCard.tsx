/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, MapPin, Star } from 'lucide-react';
import { Vendor } from '../../types';
import { DesignTokens } from './tokens';

export interface VendorCardProps {
  id?: string;
  vendor: Vendor;
  onClick?: (vendor: Vendor) => void;
  className?: string;
  key?: React.Key;
}

export function VendorCard({ id, vendor, onClick, className = '' }: VendorCardProps) {
  const cardId = id || `vendor-card-${vendor.id}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(vendor);
    }
  };

  // Render stars visually for the vendor rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    return (
      <div className="flex items-center gap-0.5 text-amber-400" aria-label={`Rating: ${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const isFilled = i < fullStars;
          const isHalf = i === fullStars && hasHalf;
          return (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${
                isFilled
                  ? 'fill-current text-amber-400'
                  : isHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'text-zinc-200 dark:text-zinc-700'
              }`}
            />
          );
        })}
        <span className="text-[11px] font-mono font-bold text-zinc-500 dark:text-zinc-400 ml-1.5 mt-0.5">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      id={cardId}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(vendor)}
      onKeyDown={handleKeyDown}
      whileHover={{ y: -6 }}
      transition={DesignTokens.motion.spring}
      className={`
        relative overflow-hidden cursor-pointer flex flex-col justify-between
        ${DesignTokens.radius.card}
        border border-zinc-200/50 dark:border-zinc-800/50
        bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md
        ${DesignTokens.spacing.cardSm}
        ${DesignTokens.shadows.sm}
        ${DesignTokens.shadows.holographic}
        ${DesignTokens.accessibility.focusRing}
        group
        ${className}
      `.replace(/\s+/g, ' ').trim()}
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
            className={`
              absolute top-3 left-3 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm
              bg-[#D1FAE5] text-[#065F46] dark:bg-[#065F46]/30 dark:text-[#34D399] shadow-sm border border-emerald-400/20
            `.trim()}
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
          {renderStars(vendor.rating)}

          {/* Location details */}
          <span className="text-zinc-400 dark:text-zinc-500 text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400" />
            <span>{vendor.location}</span>
          </span>
        </div>

        {/* Pricing Actions row */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/85 pt-3 flex items-center justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
              Starting Price
            </span>
            <span className="text-zinc-900 dark:text-white font-bold font-mono text-base md:text-lg">
              ₹{vendor.startingPrice.toLocaleString('en-IN')}
              {vendor.category === 'Catering' ? ' /plate' : ''}
            </span>
          </div>

          <div
            className={`
              px-3 py-1.5 text-xs font-semibold rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md
              border border-white/30 dark:border-white/10 text-zinc-800 dark:text-zinc-200
              hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200
            `.trim()}
          >
            Book
          </div>
        </div>
      </div>
    </motion.div>
  );
}
