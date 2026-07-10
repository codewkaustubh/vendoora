/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Category } from '../../types';
import { DesignTokens } from './tokens';

export interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
  className?: string;
  id?: string;
  key?: React.Key;
}

// Helper component to map icon names to Lucide icon components dynamically
export const CategoryIcon = ({ name, className }: { name: string; className: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} />;
};

export function CategoryCard({ category, onClick, className = '', id }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardId = id || `cat-card-${category.id}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <motion.div
      id={cardId}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(category)}
      onKeyDown={handleKeyDown}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -6 }}
      transition={DesignTokens.motion.spring}
      aria-label={`Explore category ${category.label}`}
      className={`
        relative flex flex-col items-center justify-between overflow-hidden p-6 text-center cursor-pointer select-none
        ${DesignTokens.radius.card}
        border
        ${isHovered
          ? 'border-zinc-400/60 dark:border-zinc-500/60 shadow-lg shadow-zinc-200/50 dark:shadow-none'
          : 'border-zinc-200/50 dark:border-zinc-800/50 shadow-sm'
        }
        bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md
        ${DesignTokens.accessibility.focusRing}
        group transition-all duration-300
        ${className}
      `.replace(/\s+/g, ' ').trim()}
    >
      {/* Iridescent/Holographic gradient backdrop on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-tr ${category.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
      />

      {/* Subtle Holographic Inner Border Shimmer on Hover */}
      {isHovered && (
        <div className="absolute inset-0 border border-transparent bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-blue-500/10 rounded-[32px] pointer-events-none" />
      )}

      {/* 3D Glass Animated Icon container */}
      <motion.div
        className="w-16 h-16 mb-4 rounded-2xl flex items-center justify-center bg-white dark:bg-zinc-800 shadow-md border border-zinc-100 dark:border-zinc-700/50 text-[#1E40AF] dark:text-indigo-400 relative overflow-hidden"
        animate={
          isHovered
            ? {
                rotateY: [0, 15, -15, 0],
                rotateX: [0, -10, 10, 0],
                y: [0, -4, 0],
              }
            : {}
        }
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/10" />
        <CategoryIcon
          name={category.iconName}
          className="w-8 h-8 relative z-10 filter drop-shadow-[0_2px_4px_rgba(30,64,175,0.15)]"
        />
      </motion.div>

      {/* Label */}
      <div className="mb-4">
        <h3 className="font-heading font-medium text-sm md:text-base text-zinc-800 dark:text-zinc-200 group-hover:text-[#1E40AF] dark:group-hover:text-indigo-300 transition-colors duration-200">
          {category.label}
        </h3>
      </div>

      {/* Reusable Small Pill action button */}
      <div
        className={`
          px-3 py-1.5 text-xs font-semibold rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10
          text-zinc-800 dark:text-zinc-200 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200
        `.replace(/\s+/g, ' ').trim()}
      >
        Explore
      </div>
    </motion.div>
  );
}
