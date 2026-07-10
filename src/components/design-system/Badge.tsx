/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignTokens } from './tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  outline?: boolean;
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  id?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({
  variant = 'primary',
  outline = false,
  size = 'md',
  leftIcon,
  className = '',
  children,
  id,
  ...props
}: BadgeProps) {
  const badgeId = id || `badge-${Math.random().toString(36).substr(2, 9)}`;

  // Variant resolution mapping
  let variantClasses = '';
  if (outline) {
    switch (variant) {
      case 'primary':
        variantClasses = 'border border-[#1E40AF]/30 text-[#1E40AF] dark:border-[#6366F1]/30 dark:text-[#6366F1] bg-transparent';
        break;
      case 'secondary':
        variantClasses = 'border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 bg-transparent';
        break;
      case 'success':
        variantClasses = 'border border-emerald-300 text-emerald-600 dark:border-emerald-700 dark:text-emerald-400 bg-transparent';
        break;
      case 'warning':
        variantClasses = 'border border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400 bg-transparent';
        break;
      case 'danger':
        variantClasses = 'border border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 bg-transparent';
        break;
      case 'info':
        variantClasses = 'border border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400 bg-transparent';
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
        variantClasses = `${DesignTokens.colors.primary.light} ${DesignTokens.colors.primary.dark}`;
        break;
      case 'secondary':
        variantClasses = `${DesignTokens.colors.secondary.light} ${DesignTokens.colors.secondary.dark}`;
        break;
      case 'success':
        variantClasses = `${DesignTokens.colors.success.light} ${DesignTokens.colors.success.dark} border border-emerald-500/10`;
        break;
      case 'warning':
        variantClasses = `${DesignTokens.colors.warning.light} ${DesignTokens.colors.warning.dark} border border-amber-500/10`;
        break;
      case 'danger':
        variantClasses = `${DesignTokens.colors.danger.light} ${DesignTokens.colors.danger.dark} border border-red-500/10`;
        break;
      case 'info':
        variantClasses = `${DesignTokens.colors.info.light} ${DesignTokens.colors.info.dark} border border-blue-500/10`;
        break;
    }
  }

  // Size resolution
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[9px] font-bold tracking-wider'
    : 'px-3 py-1 text-[10px] sm:text-xs font-bold tracking-wider';

  const baseClasses = `
    inline-flex items-center gap-1.5 uppercase select-none font-mono
    ${DesignTokens.radius.badge}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span
      id={badgeId}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
    </span>
  );
}
