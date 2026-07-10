/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface AboutUsSectionProps {
  id?: string;
}

export default function AboutUsSection({ id }: AboutUsSectionProps) {
  return (
    <section
      id={id || 'about-us-section'}
      className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 relative overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Creative Image Collage or Aesthetic Visual */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-100/50 dark:bg-indigo-950/20 rounded-[40px] transform rotate-3 scale-95 -z-10" />
          <div className="relative overflow-hidden rounded-[32px] border border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md p-8 md:p-10 shadow-lg text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="font-heading font-bold text-lg text-zinc-800 dark:text-zinc-100">
              The Vendoora Standard
            </h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed">
              Every vendor in our marketplace is fully background checked, vetted, and bound by our strict customer service promise.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[#1E40AF] dark:text-indigo-400 font-semibold text-xs uppercase tracking-widest">
              <span>100% Guaranteed</span>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Story */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-extrabold tracking-widest text-[#1E40AF] dark:text-indigo-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Our Purpose
            </span>
            <h3 className="font-heading font-semibold text-3xl md:text-4xl text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              A premium event planning experience, democratized.
            </h3>
          </div>

          <div className="space-y-6 text-zinc-600 dark:text-zinc-300 font-sans text-base md:text-lg leading-relaxed">
            <p>
              Vendoora was born out of a simple, powerful vision: to eliminate the heavy stress, hidden pricing, and coordination chaos from Indian wedding and event celebrations.
            </p>
            <p>
              We bring the top-tier, certified service discoverability of premium agencies and combine it with a managed secondary marketplace. Whether you are searching for high-end heritage palaces in Rajasthan, local caterers serving authentic Shahi delicacies, or pre-owned sound systems, we ensure you pay fair, transparent prices.
            </p>
            <p className="text-zinc-800 dark:text-zinc-100 font-medium">
              We are on a mission to democratize the event industry —{' '}
              <span 
                className="font-serif italic font-light text-[#1E40AF] dark:text-indigo-400 text-lg md:text-xl border-b-2 border-blue-100 dark:border-indigo-900 pb-0.5"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                one verified vendor at a time.
              </span>
            </p>
          </div>

          <div className="flex gap-8 border-t border-zinc-100 dark:border-zinc-800/80 pt-8">
            <div>
              <span className="block text-3xl font-extrabold text-zinc-950 dark:text-white font-mono">12+</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mt-1 block">Categories</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-zinc-950 dark:text-white font-mono">100%</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mt-1 block">Verified</span>
            </div>
            <div>
              <span className="block text-3xl font-extrabold text-zinc-950 dark:text-white font-mono">₹0</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mt-1 block">Hidden Fees</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
