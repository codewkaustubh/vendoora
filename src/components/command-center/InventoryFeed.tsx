/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Boxes, Edit3, Settings } from 'lucide-react';
import { INVENTORY } from '../../data/vendooraMockData';

interface InventoryItemState {
  id: string;
  name: string;
  units: number;
  hourlyRate: number;
  dailyRate: number;
  image: string;
}

export default function InventoryFeed() {
  const [items, setItems] = useState<InventoryItemState[]>(INVENTORY);

  const handleRateChange = (id: string, type: 'hourly' | 'daily', value: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [type === 'hourly' ? 'hourlyRate' : 'dailyRate']: value,
          };
        }
        return item;
      })
    );
  };

  return (
    <div id="inventory-feed-section" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg md:text-xl text-zinc-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-400" />
            Live Inventory Feed
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Adjust your rental rates dynamically. Value changes are reflected instantly in user searches.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <motion.div
            key={item.id}
            id={`inventory-feed-card-${item.id}`}
            whileHover={{ y: -3 }}
            className="rounded-[32px] border border-zinc-850 bg-zinc-900/40 backdrop-blur-md p-5 flex flex-col justify-between group overflow-hidden"
          >
            {/* Upper part: Image and status info */}
            <div>
              <div className="relative w-full h-32 rounded-2xl overflow-hidden mb-4 bg-zinc-800">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-zinc-300 border border-zinc-800">
                  {item.units} Units Available
                </div>
              </div>

              <h4 className="font-heading font-semibold text-zinc-200 text-sm md:text-base tracking-tight leading-tight line-clamp-1">
                {item.name}
              </h4>
            </div>

            {/* Price control sliders (instant local-state feedback) */}
            <div className="mt-4 space-y-4 pt-4 border-t border-zinc-850">
              {/* Hourly rate slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Hourly Rate</span>
                  <span className="font-bold font-mono text-zinc-200">₹{item.hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="5"
                  value={item.hourlyRate}
                  onChange={(e) => handleRateChange(item.id, 'hourly', parseInt(e.target.value))}
                  className="w-full accent-[#6366F1] h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Daily rate slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Daily Rate</span>
                  <span className="font-bold font-mono text-zinc-200">₹{item.dailyRate}/day</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="8000"
                  step="50"
                  value={item.dailyRate}
                  onChange={(e) => handleRateChange(item.id, 'daily', parseInt(e.target.value))}
                  className="w-full accent-[#6366F1] h-1 bg-zinc-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}
