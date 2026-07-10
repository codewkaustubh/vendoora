/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { DesignTokens } from './tokens';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string; // Optional text label for an expanded/pill layout
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'static';
  variant?: 'primary' | 'success' | 'warning';
}

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ id, icon, label, position = 'bottom-right', variant = 'primary', className = '', ...props }, ref) => {
    const fabId = id || `fab-${Math.random().toString(36).substr(2, 9)}`;

    // Determine corner coordinates mapping
    let positionClasses = '';
    switch (position) {
      case 'bottom-right':
        positionClasses = 'fixed bottom-6 right-6 z-40';
        break;
      case 'bottom-left':
        positionClasses = 'fixed bottom-6 left-6 z-40';
        break;
      case 'top-right':
        positionClasses = 'fixed top-6 right-6 z-40';
        break;
      case 'top-left':
        positionClasses = 'fixed top-6 left-6 z-40';
        break;
      case 'static':
        positionClasses = 'relative';
        break;
    }

    // Determine styling variants based on tokens
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = `${DesignTokens.colors.primary.light} ${DesignTokens.colors.primary.dark} shadow-indigo-500/25 dark:shadow-none`;
        break;
      case 'success':
        variantClasses = `${DesignTokens.colors.success.light} ${DesignTokens.colors.success.dark} shadow-emerald-500/25 dark:shadow-none border border-emerald-400/20`;
        break;
      case 'warning':
        variantClasses = `${DesignTokens.colors.warning.light} ${DesignTokens.colors.warning.dark} shadow-amber-500/25 dark:shadow-none border border-amber-400/20`;
        break;
    }

    const paddingClasses = label 
      ? 'px-5 py-3 sm:px-6 sm:py-3.5' 
      : 'p-3.5 sm:p-4';

    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-sans font-bold text-sm select-none shadow-lg
      ${DesignTokens.radius.button}
      ${DesignTokens.accessibility.focusRing}
      ${DesignTokens.accessibility.focusRingOffset}
    `.replace(/\s+/g, ' ').trim();

    return (
      <motion.button
        ref={ref}
        id={fabId}
        type="button"
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.94 }}
        transition={DesignTokens.motion.spring}
        aria-label={label || 'Floating action action'}
        className={`${positionClasses} ${baseClasses} ${variantClasses} ${paddingClasses} ${className}`}
        {...props}
      >
        <span className="shrink-0 flex items-center justify-center w-5.5 h-5.5 text-current">
          {icon}
        </span>
        {label && (
          <span className="truncate tracking-wide font-sans text-xs uppercase">
            {label}
          </span>
        )}
      </motion.button>
    );
  }
);

FAB.displayName = 'FAB';
export default FAB;
