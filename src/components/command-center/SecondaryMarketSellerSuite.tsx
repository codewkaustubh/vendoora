/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Recycle, DollarSign, Calendar, Sparkles, Check } from 'lucide-react';
import { computeSuggestedPrice } from './aiPricing';

interface SellerGearItem {
  id: string;
  name: string;
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair';
  retailPrice: number;
  suggestedPrice: number;
  ageInMonths: number;
}

const INITIAL_SELLER_ITEMS: SellerGearItem[] = [
  {
    id: 's-1',
    name: 'Outdoor Waterproof Halogen Floodlights (8 Pcs)',
    condition: 'Excellent',
    retailPrice: 24000,
    suggestedPrice: 15120,
    ageInMonths: 6,
  },
  {
    id: 's-2',
    name: 'Stage Carpet Rolls - Royal Red (120ft)',
    condition: 'Fair',
    retailPrice: 15000,
    suggestedPrice: 3600,
    ageInMonths: 18,
  },
];

export default function SecondaryMarketSellerSuite() {
  const [gearList, setGearList] = useState<SellerGearItem[]>(INITIAL_SELLER_ITEMS);

  // New listing form state
  const [name, setName] = useState('');
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [condition, setCondition] = useState<'Mint' | 'Excellent' | 'Good' | 'Fair'>('Excellent');
  const [ageInMonths, setAgeInMonths] = useState<number>(0);

  // Suggested price derived state
  const [aiPrice, setAiPrice] = useState(0);

  // Recalculate AI suggestions on input adjustments
  useEffect(() => {
    const computed = computeSuggestedPrice(retailPrice, condition, ageInMonths);
    setAiPrice(computed);
  }, [retailPrice, condition, ageInMonths]);

  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || retailPrice <= 0) return;

    const newItem: SellerGearItem = {
      id: `s-${Date.now()}`,
      name,
      condition,
      retailPrice,
      suggestedPrice: aiPrice,
      ageInMonths,
    };

    setGearList([newItem, ...gearList]);

    // Reset inputs
    setName('');
    setRetailPrice(0);
    setCondition('Excellent');
    setAgeInMonths(0);
  };

  return (
    <div id="seller-suite-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Listing Form Portal (Left side) */}
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h3 className="font-heading font-semibold text-lg md:text-xl text-zinc-100 flex items-center gap-2">
            <Recycle className="w-5 h-5 text-indigo-400" />
            Seller Listing Suite
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">
            Sell your decommissioned wedding tents, sound units, and cooling rigs securely
          </p>
        </div>

        <form onSubmit={handleAddGear} className="space-y-4 rounded-3xl border border-zinc-850 bg-zinc-900/40 p-5 md:p-6 backdrop-blur-md">
          {/* Item Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. JBL Sound Mixer 16-Ch..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Condition dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Mint">Mint (Like New)</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair (Heavy Use)</option>
              </select>
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Age (Months)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={retailPrice === 0 ? '' : ageInMonths}
                onChange={(e) => setAgeInMonths(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Original retail price */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Original Retail Price (₹)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">₹</span>
              <input
                type="number"
                required
                min="0"
                placeholder="45000"
                value={retailPrice === 0 ? '' : retailPrice}
                onChange={(e) => setRetailPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* AI Recommended pricing widget */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Smart Pricing Heuristic</span>
                <span className="text-[10px] text-zinc-400">Deterministic Price Suggestion</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-[8px] uppercase tracking-wider text-zinc-500">Suggested Price</span>
              <span className="text-base font-extrabold font-mono text-purple-300">
                ₹{aiPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-indigo-950/20 uppercase"
          >
            Create used gear listing
          </button>
        </form>
      </div>

      {/* Gear Inventory list (Right side) */}
      <div className="lg:col-span-7 space-y-4">
        <div>
          <h4 className="font-heading font-semibold text-sm text-zinc-400 uppercase tracking-widest">
            Your Active Secondary Gear Listings
          </h4>
        </div>

        <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
          {gearList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-sm"
            >
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                  {item.condition} • {item.ageInMonths} Mo Old
                </span>
                <h5 className="font-heading font-semibold text-zinc-200 text-xs sm:text-sm">
                  {item.name}
                </h5>
              </div>

              <div className="text-right space-y-1">
                <span className="block text-[9px] text-zinc-500 uppercase font-bold">Sale price</span>
                <span className="text-sm sm:text-base font-bold font-mono text-zinc-200">
                  ₹{item.suggestedPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
