/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';

interface LocationPickerProps {
  id?: string;
  onLocationChange?: (location: string) => void;
}

const INDIAN_CITIES = [
  'Mumbai, MH',
  'Delhi NCR',
  'Bangalore, KA',
  'Jaipur, RJ',
  'Udaipur, RJ',
  'Goa',
];

export default function LocationPicker({ id, onLocationChange }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Mumbai, MH');

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setIsOpen(false);
    if (onLocationChange) {
      onLocationChange(city);
    }
  };

  return (
    <div id={id} className="relative z-50">
      <button
        id={id ? `${id}-btn` : undefined}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-zinc-800/60 hover:bg-white/90 dark:hover:bg-zinc-800/90 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-all duration-200"
      >
        <MapPin className="w-4 h-4 text-[#1E40AF]" />
        <span>{selectedCity}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div
            id={id ? `${id}-menu` : undefined}
            className="absolute top-full mt-2 left-0 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 animate-fade-in"
          >
            {/* Disabled GPS Selector to respect constraints */}
            <div className="px-3 pb-1 border-b border-zinc-100 dark:border-zinc-800">
              <button
                disabled
                className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Current Location</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-zinc-200 dark:bg-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded">
                  GPS Disabled
                </span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto mt-1">
              {INDIAN_CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                    selectedCity === city
                      ? 'text-[#1E40AF] dark:text-indigo-400 font-semibold bg-blue-50/50 dark:bg-indigo-500/5'
                      : 'text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{city}</span>
                  {selectedCity === city && <Check className="w-4 h-4 text-[#1E40AF] dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
