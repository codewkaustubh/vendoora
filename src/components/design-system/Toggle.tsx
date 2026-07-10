/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { DesignTokens } from './tokens';

export interface ToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  variant?: 'primary' | 'success';
}

export function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  variant = 'primary',
}: ToggleProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  const labelId = `${toggleId}-label`;
  const descId = `${toggleId}-desc`;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  // Switch color determination from tokens
  let activeBg = '';
  let borderGlow = '';
  if (variant === 'primary') {
    activeBg = 'bg-[#1E40AF] dark:bg-[#6366F1]';
    borderGlow = 'ring-2 ring-indigo-500/20 shadow-[0_0_12px_rgba(99,102,241,0.25)]';
  } else {
    activeBg = 'bg-[#10B981]';
    borderGlow = 'ring-2 ring-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
  }

  return (
    <div className="flex items-start justify-between gap-4 font-sans py-1 select-none">
      {(label || description) && (
        <div className="flex flex-col gap-0.5 cursor-pointer" onClick={handleToggle}>
          {label && (
            <span
              id={labelId}
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none"
            >
              {label}
            </span>
          )}
          {description && (
            <span
              id={descId}
              className="text-xs text-zinc-500 dark:text-zinc-500"
            >
              {description}
            </span>
          )}
        </div>
      )}

      {/* Switch Button */}
      <button
        type="button"
        id={toggleId}
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={description ? descId : undefined}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out outline-none
          ${checked ? activeBg : 'bg-zinc-200 dark:bg-zinc-850'}
          ${checked ? borderGlow : ''}
          ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
          ${DesignTokens.accessibility.focusRing}
          ${DesignTokens.accessibility.focusRingOffset}
        `.replace(/\s+/g, ' ').trim()}
      >
        <span className={DesignTokens.accessibility.srOnly}>Toggle state</span>
        
        {/* Animated toggle circle */}
        <motion.span
          layout
          transition={DesignTokens.motion.spring}
          className={`
            pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `.trim()}
        />
      </button>
    </div>
  );
}
export default Toggle;
