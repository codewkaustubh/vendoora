/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DesignTokens } from './tokens';

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'circle' | 'input' | 'badge';
  width?: string;
  height?: string;
  id?: string;
  className?: string;
}

export function LoadingSkeleton({
  id,
  variant = 'text',
  width,
  height,
  className = '',
  ...props
}: LoadingSkeletonProps) {
  const skeletonId = id || `skeleton-${Math.random().toString(36).substr(2, 9)}`;

  // Determine standard shape metrics and border radiuses from tokens
  let shapeClasses = '';
  let defaultHeight = '';

  switch (variant) {
    case 'text':
      shapeClasses = 'rounded-md';
      defaultHeight = 'h-4';
      break;
    case 'card':
      shapeClasses = DesignTokens.radius.card;
      defaultHeight = 'h-48';
      break;
    case 'circle':
      shapeClasses = 'rounded-full';
      defaultHeight = 'h-12';
      break;
    case 'input':
      shapeClasses = DesignTokens.radius.input;
      defaultHeight = 'h-12';
      break;
    case 'badge':
      shapeClasses = DesignTokens.radius.badge;
      defaultHeight = 'h-6';
      break;
  }

  // Set default widths based on variant if not specified
  let defaultWidth = 'w-full';
  if (variant === 'circle') {
    defaultWidth = 'w-12';
  } else if (variant === 'badge') {
    defaultWidth = 'w-16';
  }

  const baseStyle = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      id={skeletonId}
      aria-hidden="true"
      style={baseStyle}
      className={`
        animate-pulse bg-zinc-200/65 dark:bg-zinc-800/60
        ${shapeClasses}
        ${!width ? defaultWidth : ''}
        ${!height ? defaultHeight : ''}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    />
  );
}
export default LoadingSkeleton;
