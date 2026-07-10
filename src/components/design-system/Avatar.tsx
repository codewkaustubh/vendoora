/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { DesignTokens } from './tokens';

export interface AvatarProps {
  id?: string;
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'busy';
  className?: string;
}

export function Avatar({
  id,
  src,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const avatarId = id || `avatar-${Math.random().toString(36).substr(2, 9)}`;
  const [imageError, setImageError] = useState(false);

  // Compute size styles
  let sizeClasses = '';
  let textClasses = '';
  let statusDotClasses = '';

  switch (size) {
    case 'sm':
      sizeClasses = 'w-8 h-8';
      textClasses = 'text-xs font-bold';
      statusDotClasses = 'w-2 h-2 border-[1.5px]';
      break;
    case 'md':
      sizeClasses = 'w-10 h-10';
      textClasses = 'text-sm font-bold';
      statusDotClasses = 'w-2.5 h-2.5 border-2';
      break;
    case 'lg':
      sizeClasses = 'w-14 h-14';
      textClasses = 'text-base font-black';
      statusDotClasses = 'w-3.5 h-3.5 border-2';
      break;
    case 'xl':
      sizeClasses = 'w-20 h-20';
      textClasses = 'text-xl font-black';
      statusDotClasses = 'w-4 h-4 border-2';
      break;
  }

  // Get fallback initials (e.g. "Aditya Sen" -> "AS")
  const getInitials = () => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Status indicator colors
  let statusColor = '';
  switch (status) {
    case 'online':
      statusColor = 'bg-[#10B981]';
      break;
    case 'offline':
      statusColor = 'bg-zinc-400';
      break;
    case 'busy':
      statusColor = 'bg-red-500';
      break;
  }

  return (
    <div
      id={avatarId}
      className={`relative shrink-0 select-none ${className}`}
      role="img"
      aria-label={name ? `${name}'s avatar` : 'User profile avatar'}
    >
      <div
        className={`
          flex items-center justify-center rounded-full overflow-hidden
          border border-zinc-200/60 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-850
          ${sizeClasses}
        `.replace(/\s+/g, ' ').trim()}
      >
        {!src || imageError ? (
          name ? (
            <span className={`font-heading font-bold text-zinc-600 dark:text-zinc-300 ${textClasses}`}>
              {getInitials()}
            </span>
          ) : (
            <User className="w-1/2 h-1/2 text-zinc-400 dark:text-zinc-500" />
          )
        ) : (
          <img
            src={src}
            alt={name || 'Avatar'}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Online/Offline Status Indicator Light */}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-white dark:border-zinc-950
            ${statusColor}
            ${statusDotClasses}
          `.replace(/\s+/g, ' ').trim()}
        />
      )}
    </div>
  );
}
export default Avatar;
