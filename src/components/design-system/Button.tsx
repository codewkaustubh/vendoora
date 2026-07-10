/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { DesignTokens } from './tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      id,
      ...props
    },
    ref
  ) => {
    // Determine theme classes based on variant token mappings
    let variantClasses = '';
    switch (variant) {
      case 'primary':
        variantClasses = `${DesignTokens.colors.primary.light} ${DesignTokens.colors.primary.dark}`;
        break;
      case 'secondary':
        variantClasses = `${DesignTokens.colors.secondary.light} ${DesignTokens.colors.secondary.dark}`;
        break;
      case 'success':
        variantClasses = `${DesignTokens.colors.success.light} ${DesignTokens.colors.success.dark} border`;
        break;
      case 'warning':
        variantClasses = `${DesignTokens.colors.warning.light} ${DesignTokens.colors.warning.dark} border`;
        break;
      case 'danger':
        variantClasses = `${DesignTokens.colors.danger.light} ${DesignTokens.colors.danger.dark} border`;
        break;
      case 'ghost':
        variantClasses = 'bg-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900';
        break;
    }

    // Handle size classes from tokens
    let sizeClasses = '';
    switch (size) {
      case 'sm':
        sizeClasses = `${DesignTokens.spacing.buttonSm} ${DesignTokens.typography.sizes.xs}`;
        break;
      case 'md':
        sizeClasses = `${DesignTokens.spacing.button} ${DesignTokens.typography.sizes.sm} font-semibold`;
        break;
      case 'lg':
        sizeClasses = 'px-8 py-3.5 sm:px-10 sm:py-4 text-sm md:text-base font-bold';
        break;
    }

    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-sans font-medium transition-colors duration-200
      ${DesignTokens.radius.button}
      ${DesignTokens.accessibility.focusRing}
      ${DesignTokens.accessibility.focusRingOffset}
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
    `.replace(/\s+/g, ' ').trim();

    return (
      <motion.button
        ref={ref}
        id={id || `btn-${variant}-${Math.random().toString(36).substr(2, 9)}`}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : undefined}
        transition={DesignTokens.motion.spring}
        className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
