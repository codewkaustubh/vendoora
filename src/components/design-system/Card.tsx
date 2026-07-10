/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { DesignTokens } from './tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'flat';
  isInteractive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  id?: string;
  className?: string;
  children?: React.ReactNode;
  key?: React.Key;
}

export function Card({
  id,
  variant = 'surface',
  isInteractive = false,
  padding = 'md',
  header,
  footer,
  className = '',
  children,
  ...props
}: CardProps) {
  const cardId = id || `card-${Math.random().toString(36).substr(2, 9)}`;

  // Determine structural background styles from DesignTokens
  let variantClasses = '';
  switch (variant) {
    case 'surface':
      variantClasses = `${DesignTokens.colors.surface.light} ${DesignTokens.colors.surface.dark} border`;
      break;
    case 'glass':
      variantClasses = 'bg-white/40 dark:bg-[#121212]/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 shadow-lg shadow-black/5';
      break;
    case 'flat':
      variantClasses = 'bg-zinc-50 dark:bg-zinc-900 border border-transparent';
      break;
  }

  // Determine padding sizes
  let paddingClasses = '';
  switch (padding) {
    case 'none':
      paddingClasses = 'p-0';
      break;
    case 'sm':
      paddingClasses = DesignTokens.spacing.cardSm;
      break;
    case 'md':
      paddingClasses = DesignTokens.spacing.card;
      break;
    case 'lg':
      paddingClasses = 'p-8 md:p-12';
      break;
  }

  const baseClasses = `
    w-full flex flex-col font-sans transition-all duration-300 overflow-hidden
    ${DesignTokens.radius.card}
    ${isInteractive ? `cursor-pointer ${DesignTokens.shadows.holographic} ${DesignTokens.accessibility.focusRing}` : DesignTokens.shadows.sm}
  `.replace(/\s+/g, ' ').trim();

  // If interactive, wrap in an animated div with appropriate roles
  if (isInteractive) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        e.currentTarget.dispatchEvent(clickEvent);
      }
    };

    return (
      <motion.div
        id={cardId}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        whileHover={{ y: -4 }}
        transition={DesignTokens.motion.spring}
        className={`${baseClasses} ${variantClasses} ${className}`}
        {...props}
      >
        {header && (
          <div className="border-b border-zinc-100 dark:border-zinc-850 px-6 py-4 shrink-0">
            {header}
          </div>
        )}
        <div className={`flex-1 ${paddingClasses}`}>
          {children}
        </div>
        {footer && (
          <div className="border-t border-zinc-100 dark:border-zinc-850 px-6 py-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
            {footer}
          </div>
        )}
      </motion.div>
    );
  }

  // Static Container Card
  return (
    <div
      id={cardId}
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {header && (
        <div className="border-b border-zinc-100 dark:border-zinc-850 px-6 py-4 shrink-0">
          {header}
        </div>
      )}
      <div className={`flex-1 ${paddingClasses}`}>
        {children}
      </div>
      {footer && (
        <div className="border-t border-zinc-100 dark:border-zinc-850 px-6 py-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
          {footer}
        </div>
      )}
    </div>
  );
}
export default Card;
