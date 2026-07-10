/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Play, Eye } from 'lucide-react';
import { REELS } from '../../data/vendooraMockData';

interface VibeReelsTrayProps {
  id?: string;
  onReelClick?: (reelTitle: string) => void;
  reels?: any[];
}

export default function VibeReelsTray({ id, onReelClick, reels }: VibeReelsTrayProps) {
  const activeReels = reels || REELS;
  return (
    <div id={id || 'vibe-reels-tray'} className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-semibold text-lg md:text-xl text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse" />
            Vibe Reels
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
            15-second visual showcases from verified decorators and planners
          </p>
        </div>
      </div>

      {/* Story Tray horizontal scroll track */}
      <div
        className="w-full overflow-x-auto overflow-y-hidden flex items-center gap-4 pb-3 scroll-smooth scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {activeReels.map((reel) => (
          <motion.div
            key={reel.id}
            id={`reels-tray-item-${reel.id}`}
            onClick={() => onReelClick?.(reel.title)}
            whileHover={{ scale: 1.04 }}
            className="w-28 sm:w-32 h-44 sm:h-52 shrink-0 rounded-2xl overflow-hidden border-2 border-pink-500/40 hover:border-pink-500 cursor-pointer relative shadow-sm group"
          >
            {/* Visual Thumbnail */}
            <img
              src={reel.thumbnail}
              alt={reel.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {/* Dark vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Play Overlay Icon (centered) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40">
                <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
              </div>
            </div>

            {/* Title / Info Footer */}
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <span className="font-heading font-bold text-[9px] sm:text-xs text-white leading-tight line-clamp-2">
                {reel.title}
              </span>
              <div className="flex items-center gap-1 text-[8px] font-mono font-medium text-pink-200">
                <Eye className="w-2.5 h-2.5" />
                <span>{reel.views}</span>
              </div>
            </div>

            {/* 15s Tag */}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md">
              0:15
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
