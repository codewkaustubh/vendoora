/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Tag, MapPin, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { BrandTokens } from '../vendoora/BrandTokens';

interface ProductCardProps {
  key?: string;
  product: Product;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <motion.div
      id={`product-card-${product.id}`}
      onClick={() => onSelect?.(product)}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`w-64 shrink-0 overflow-hidden cursor-pointer rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md flex flex-col justify-between p-4 shadow-sm group ${BrandTokens.styles.holographicHover}`}
    >
      
      {/* Thumbnail and Condition badges */}
      <div className="relative w-full h-36 rounded-[24px] overflow-hidden mb-3 bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

        {/* Condition Grade Badge - Sunset Orange Style */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${BrandTokens.colors.sunsetOrange} shadow-sm`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{product.condition}</span>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 text-white backdrop-blur-sm rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-tight">
          <MapPin className="w-2.5 h-2.5 text-zinc-300" />
          <span>{product.location}</span>
        </div>
      </div>

      {/* Info Container */}
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            Pre-Owned Equipment
          </span>
          <h4 className="font-heading font-semibold text-zinc-800 dark:text-zinc-50 text-sm tracking-tight leading-tight mt-1 line-clamp-2">
            {product.name}
          </h4>
        </div>

        {/* Pricing Action Row */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[8px] uppercase tracking-wider text-zinc-400 font-bold">
              Asking Price
            </span>
            <span className="text-zinc-950 dark:text-white font-bold font-mono text-sm md:text-base">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-[#1E40AF] group-hover:text-white transition-colors">
            Details
          </div>
        </div>
      </div>

    </motion.div>
  );
}
