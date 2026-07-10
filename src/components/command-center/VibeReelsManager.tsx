/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Video, Plus, Eye, Trash2, Camera } from 'lucide-react';
import { Reel } from '../../types';
import { REELS } from '../../data/vendooraMockData';

export default function VibeReelsManager() {
  const [reels, setReels] = useState<Reel[]>(REELS);
  const [newTitle, setNewTitle] = useState('');

  const handleAddReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReel: Reel = {
      id: `r-${Date.now()}`,
      title: newTitle,
      thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=500',
      views: '1.2K',
      duration: '0:15',
    };

    setReels([newReel, ...reels]);
    setNewTitle('');
  };

  const handleDeleteReel = (id: string) => {
    setReels(reels.filter((r) => r.id !== id));
  };

  return (
    <div id="vibe-reels-manager" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-lg md:text-xl text-zinc-100 flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-400" />
            Vibe Reels Manager
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Vertical 15-second visual portfolios. Double visibility and inquiries from prospective clients.
          </p>
        </div>

        {/* Add Reel Form Portal (Inline) */}
        <form onSubmit={handleAddReel} className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Reel title (e.g. Wedding Entrance...)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="px-4 py-2 text-xs rounded-full border border-zinc-800 bg-zinc-950 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish</span>
          </button>
        </form>
      </div>

      {/* Story-grid configuration */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {reels.map((reel) => (
          <motion.div
            key={reel.id}
            id={`reels-manager-item-${reel.id}`}
            whileHover={{ scale: 1.02 }}
            className="h-44 sm:h-52 rounded-2xl overflow-hidden border border-zinc-850 relative group cursor-default shadow-lg shrink-0"
          >
            {/* Visual Thumbnail */}
            <img
              src={reel.thumbnail}
              alt={reel.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

            {/* Trash button overlay */}
            <button
              onClick={() => handleDeleteReel(reel.id)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
              title="Delete Reel"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Title / stats overlay */}
            <div className="absolute bottom-2 left-2 right-2 space-y-1">
              <span className="font-heading font-bold text-[10px] text-white leading-tight line-clamp-2">
                {reel.title}
              </span>
              <div className="flex items-center gap-1 text-[8px] font-mono font-medium text-pink-200">
                <Eye className="w-2.5 h-2.5" />
                <span>{reel.views} views</span>
              </div>
            </div>

            {/* 15s Marker */}
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md">
              0:15
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
