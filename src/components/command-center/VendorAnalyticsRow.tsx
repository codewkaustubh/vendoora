/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { TrendingUp, BellRing, Star, Award, Sparkles } from 'lucide-react';
import StarRating from '../common/StarRating';

interface VendorAnalyticsRowProps {
  id?: string;
  monthlyEarnings: number;
  activeInquiries: number;
  rating: number;
}

export default function VendorAnalyticsRow({
  id,
  monthlyEarnings,
  activeInquiries,
  rating,
}: VendorAnalyticsRowProps) {
  return (
    <div
      id={id || 'vendor-analytics-row'}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4 md:px-6"
    >
      {/* 1. Monthly Earnings Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 flex flex-col justify-between h-48 group shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Monthly Revenue
            </span>
            <h4 className="font-heading font-bold text-zinc-300 text-sm mt-0.5">
              Monthly Earnings
            </h4>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Holographic line graph using pure SVG */}
        <div className="w-full h-12 flex items-end justify-between gap-1.5 mt-2 overflow-visible">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Filled area path */}
            <path
              d="M0 30 Q 15 15, 30 20 T 60 5 T 90 10 T 100 8 L 100 30 Z"
              fill="url(#chart-glow)"
              className="transition-all duration-500"
            />
            {/* Stroke path */}
            <path
              d="M0 30 Q 15 15, 30 20 T 60 5 T 90 10 T 100 8"
              fill="none"
              stroke="#6366F1"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="filter drop-shadow-[0_2px_4px_rgba(99,102,241,0.5)]"
            />
            {/* Glowing peak dot */}
            <circle cx="60" cy="5" r="1.5" fill="#FFF" className="animate-ping" />
            <circle cx="60" cy="5" r="1" fill="#6366F1" />
          </svg>
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            ₹{monthlyEarnings.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-bold text-[#10B981] font-mono">+12.4%</span>
        </div>
      </motion.div>

      {/* 2. Active Inquiries Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 flex flex-col justify-between h-48 group shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Leads & Inquiries
            </span>
            <h4 className="font-heading font-bold text-zinc-300 text-sm mt-0.5">
              Active Inquiries
            </h4>
          </div>
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 relative">
            <BellRing className="w-4 h-4 animate-swing" />
            {/* Pulsing indicator light */}
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          </div>
        </div>

        {/* Mock progress bar display */}
        <div className="space-y-1.5 mt-2">
          <div className="flex justify-between text-[10px] text-zinc-500 font-semibold uppercase">
            <span>Response Speed</span>
            <span className="text-pink-400 font-mono">14 Mins avg</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 w-[85%]" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-3xl font-black font-mono text-white tracking-tight">
            {activeInquiries}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 text-[9px] font-bold uppercase tracking-wider border border-pink-500/20 animate-pulse">
            Needs response
          </span>
        </div>
      </motion.div>

      {/* 3. Rating & Top Rated Badge Card */}
      <motion.div
        whileHover={{ y: -4 }}
        className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 flex flex-col justify-between h-48 group shadow-lg"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Supplier Standing
            </span>
            <h4 className="font-heading font-bold text-zinc-300 text-sm mt-0.5">
              Client Star Rating
            </h4>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
            <Star className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1 mt-2">
          {/* Reuse modular rating renderer styled dark */}
          <StarRating rating={rating} maxStars={5} className="py-1 text-white scale-110 origin-left" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-2xl font-black font-mono text-white tracking-tight">
            {rating.toFixed(2)}
          </span>
          
          {/* Conditional Top Rated Badge if rating > 4.5 */}
          {rating > 4.5 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] text-[10px] font-bold uppercase tracking-widest border border-[#10B981]/30">
              <Award className="w-3.5 h-3.5" />
              <span>Top Rated</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
