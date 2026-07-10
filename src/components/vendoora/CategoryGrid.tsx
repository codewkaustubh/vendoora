/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { CATEGORIES } from '../../data/vendooraMockData';
import { BrandTokens } from './BrandTokens';

interface CategoryGridProps {
  id?: string;
  onSelectCategory?: (categoryName: string) => void;
}

// Map standard lucide icons
const IconComponent = ({ name, className }: { name: string; className: string }) => {
  const Icon = (Icons as any)[name] || Icons.HelpCircle;
  return <Icon className={className} />;
};

export default function CategoryGrid({ id, onSelectCategory }: CategoryGridProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      id={id || 'category-grid'}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-4 md:px-6 py-6"
    >
      {CATEGORIES.map((cat, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <motion.div
            key={cat.id}
            id={`cat-tile-${cat.id}`}
            onClick={() => onSelectCategory?.(cat.label)}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            className={`relative flex flex-col items-center justify-between overflow-hidden p-6 text-center cursor-pointer select-none rounded-[32px] border ${
              isHovered
                ? 'border-zinc-400/60 dark:border-zinc-500/60 shadow-[0_0_25px_rgba(30,64,175,0.1)] dark:shadow-[0_0_25px_rgba(99,102,241,0.2)]'
                : 'border-zinc-200/50 dark:border-zinc-800/50 shadow-sm'
            } bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md transition-all duration-300 group`}
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Iridescent/Holographic gradient backdrop on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-tr ${cat.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500 -z-10`}
            />

            {/* Subtle Holographic Inner Border Shimmer */}
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
              <IconComponent name={cat.iconName} className="w-8 h-8 relative z-10 filter drop-shadow-[0_2px_4px_rgba(30,64,175,0.15)]" />
            </motion.div>

            {/* Label */}
            <div className="mb-4">
              <h3 className="font-heading font-medium text-sm md:text-base text-zinc-800 dark:text-zinc-200 group-hover:text-[#1E40AF] dark:group-hover:text-indigo-300 transition-colors duration-200">
                {cat.label}
              </h3>
            </div>

            {/* Sleek, tiny pill-shaped glassmorphic button */}
            <div className={BrandTokens.styles.glassPillBtn}>
              Explore
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
