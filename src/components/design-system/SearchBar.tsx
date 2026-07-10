/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { DesignTokens } from './tokens';

export interface SearchBarProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  id,
  value,
  onChange,
  onClear,
  onSubmit,
  placeholder = 'Search vendors, services, or equipment...',
  className = '',
}: SearchBarProps) {
  const searchId = id || `search-${Math.random().toString(36).substr(2, 9)}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div
      className={`
        relative w-full flex items-center transition-all duration-300
        ${DesignTokens.colors.input.bg}
        ${DesignTokens.radius.input}
        border
        ${isFocused
          ? 'border-indigo-500 ring-2 ring-indigo-500/10 dark:border-indigo-400 dark:ring-indigo-400/10'
          : 'border-zinc-200 dark:border-zinc-800'
        }
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      <label htmlFor={searchId} className={DesignTokens.accessibility.srOnly}>
        {placeholder}
      </label>

      {/* Search Icon */}
      <div className="absolute left-4 flex items-center justify-center text-zinc-400 dark:text-zinc-500 pointer-events-none">
        <Search className="w-5 h-5" />
      </div>

      <input
        ref={inputRef}
        type="search"
        id={searchId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          w-full bg-transparent outline-none border-none py-3 pl-12 pr-11 text-sm md:text-base
          ${DesignTokens.colors.input.text}
          ${DesignTokens.colors.input.placeholder}
          ${DesignTokens.radius.input}
          [&-webkit-search-cancel-button]:hidden
        `.replace(/\s+/g, ' ').trim()}
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search query"
          className="absolute right-3.5 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
