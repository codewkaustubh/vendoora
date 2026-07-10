/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { DesignTokens } from './tokens';

export interface NavigationTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export interface BottomNavigationProps {
  id?: string;
  tabs: NavigationTab[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function BottomNavigation({
  id,
  tabs,
  activeTabId,
  onChange,
  className = '',
}: BottomNavigationProps) {
  const navId = id || `bottom-nav-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <nav
      id={navId}
      role="navigation"
      aria-label="Bottom mobile navigation"
      className={`
        fixed bottom-0 left-0 right-0 z-40 sm:hidden
        bg-white/90 dark:bg-zinc-950/95 backdrop-blur-md
        border-t border-zinc-200/60 dark:border-zinc-850
        px-4 py-2 pb-safe shadow-lg shadow-black/5
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      <div className="flex items-center justify-around w-full max-w-md mx-auto">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = tab.id === activeTabId;

          const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(tab.id);
            }
          };

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => onChange(tab.id)}
              onKeyDown={handleKeyDown}
              aria-current={isActive ? 'page' : undefined}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-1.5 px-3 min-w-[64px]
                transition-all duration-200 outline-none
                ${DesignTokens.accessibility.focusRing}
                rounded-2xl
              `.trim()}
            >
              {/* Icon Container with Optional Active Dot Glow */}
              <div
                className={`
                  relative p-1 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-[#1E40AF] dark:text-[#6366F1]' 
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                  }
                `.trim()}
              >
                <TabIcon className="w-5.5 h-5.5" />

                {/* Optional notification badge */}
                {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                  <span
                    className={`
                      absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full
                      px-1 text-[8px] font-black font-mono text-white bg-red-500
                      border border-white dark:border-zinc-950 shadow-sm
                    `.trim()}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  text-[10px] font-semibold tracking-tight transition-colors duration-200
                  ${isActive
                    ? 'text-[#1E40AF] dark:text-[#6366F1] font-bold'
                    : 'text-zinc-400 dark:text-zinc-500'
                  }
                `.trim()}
              >
                {tab.label}
              </span>

              {/* Holographic Active Bottom Bar Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeBottomTabIndicator"
                  className="absolute bottom-0 h-[3px] w-8 rounded-full bg-[#1E40AF] dark:bg-[#6366F1]"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
export default BottomNavigation;
