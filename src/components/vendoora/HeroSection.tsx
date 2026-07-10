/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import CategoryGrid from './CategoryGrid';

interface HeroSectionProps {
  id?: string;
  onSelectCategory?: (categoryName: string) => void;
}

export default function HeroSection({ id, onSelectCategory }: HeroSectionProps) {
  return (
    <div id={id || 'hero-section'} className="relative w-full pt-12 md:pt-16 pb-6 overflow-hidden">
      
      {/* Decorative Blob Elements representing the Pinterest mesh gradients */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-pink-300/10 dark:bg-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-20" />
      <div className="absolute top-40 right-10 w-[450px] h-[450px] bg-teal-300/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-20" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-orange-200/10 dark:bg-purple-500/5 rounded-full blur-[90px] pointer-events-none -z-20" />

      {/* Main Content Containers */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 text-center space-y-6 md:space-y-8 relative z-10">
        
        {/* Dynamic Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50/80 dark:bg-zinc-900/80 border border-blue-100/50 dark:border-zinc-800/50 text-xs font-semibold text-[#1E40AF] dark:text-indigo-400 shadow-sm backdrop-blur-sm"
        >
          <span>✨ Discover India's Premium Event Marketplace</span>
        </motion.div>

        {/* Brand Headline Copy */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
            Plan Your Events,{' '}
            <span className="font-serif italic font-normal text-[#1E40AF] dark:text-indigo-400 bg-clip-text relative">
              Pocket-Friendly Prices.
            </span>
          </h2>
        </motion.div>

        {/* Supporting Sub-text Copy */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto text-zinc-500 dark:text-zinc-400 text-sm sm:text-base md:text-lg font-sans leading-relaxed"
        >
          Find trusted vendors and quality products for your perfect event.
        </motion.p>

        {/* Category Grid Section Header */}
        <div className="pt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xs font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mb-4"
          >
            What service do you need today?
          </motion.div>
          <CategoryGrid id="hero-categories-grid" onSelectCategory={onSelectCategory} />
        </div>

      </div>
    </div>
  );
}
