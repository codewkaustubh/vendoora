/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, User, Sparkles, LogOut, ShieldAlert } from 'lucide-react';
import { BrandTokens } from '../vendoora/BrandTokens';
import LocationPicker from '../vendoora/LocationPicker';

interface HeaderBarProps {
  id?: string;
  vendorMode: boolean;
  onVendorModeToggle: (enabled: boolean) => void;
  onSearchChange?: (term: string) => void;
  onLocationChange?: (location: string) => void;
  onAccountClick?: () => void;
}

export default function HeaderBar({
  id,
  vendorMode,
  onVendorModeToggle,
  onSearchChange,
  onLocationChange,
  onAccountClick,
}: HeaderBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange?.(searchTerm);
  };

  return (
    <header
      id={id || 'global-header'}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        vendorMode
          ? 'bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60'
          : `${BrandTokens.styles.chromeGlass} ${BrandTokens.styles.tallHeader} border-b border-white/20`
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        
        {/* Left Cluster: Wordmark + Account Icon */}
        <div className="flex items-center gap-3 shrink-0">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onVendorModeToggle(false)}
          >
            <h1 className="font-heading font-black text-xl md:text-2xl tracking-tighter uppercase">
              <span className={vendorMode ? BrandTokens.colors.vendorDashboardGradient : BrandTokens.colors.wordmarkGradient}>
                VENDOORA
              </span>
            </h1>
          </motion.div>

          {/* Account/Login Icon Button adjacent to wordmark */}
          <motion.button
            id="account-login-btn"
            onClick={onAccountClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-full border flex items-center justify-center transition-all ${
              vendorMode
                ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-[#6366F1]'
                : 'border-zinc-200/60 bg-white/60 text-zinc-700 hover:text-[#1E40AF]'
            }`}
          >
            <User className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Center Pill: Location Picker & Search (Hidden in dashboard/vendor mode to keep clutter low) */}
        {!vendorMode && (
          <div className="hidden md:flex items-center gap-3 max-w-lg w-full bg-white/50 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full px-3 py-1.5 backdrop-blur-md">
            <LocationPicker id="header-location-picker" onLocationChange={onLocationChange} />
            <div className="h-4 w-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                id="header-search-input"
                type="text"
                placeholder="Find Services or Products"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                className="w-full bg-transparent border-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-0 text-sm"
              />
            </form>
          </div>
        )}

        {/* Right Cluster: Vendor Mode Toggle & Secondary elements */}
        <div className="flex items-center gap-3">
          {/* Vendor Mode Toggle with Neon Glow on Active */}
          <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/30 dark:border-zinc-800/30 rounded-full px-4 py-2 backdrop-blur-sm">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hidden sm:inline select-none">
              {vendorMode ? 'Dashboard' : 'Switch to Vendor'}
            </span>
            <button
              id="vendor-mode-toggle"
              onClick={() => onVendorModeToggle(!vendorMode)}
              className={`relative w-12 h-6 flex items-center rounded-full transition-all duration-300 outline-none ${
                vendorMode
                  ? 'bg-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.6)]'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                  vendorMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Location/Search Row - Visible only on mobile when not in dashboard */}
      {!vendorMode && (
        <div className="md:hidden border-t border-zinc-100 dark:border-zinc-900 px-4 py-3 bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md flex items-center gap-2">
          <LocationPicker id="mobile-location-picker" onLocationChange={onLocationChange} />
          <div className="flex-1 flex items-center gap-2 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-full px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Find Services..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              className="w-full bg-transparent border-none text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
}
