/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiProduct } from '../../types';
import ProductCard from './ProductCard';
import HorizontalScroller from '../common/HorizontalScroller';
import SectionShell from '../common/SectionShell';

interface MarketplaceSectionProps {
  id?: string;
  products?: ApiProduct[];
}

export default function MarketplaceSection({ id, products }: MarketplaceSectionProps) {
  const activeProducts = products || [];
  return (
    <SectionShell
      id={id || 'marketplace-section'}
      title="Secondary Market & Equipment"
      subtitle="Purchase certified, high-grade used event gear directly from trusted vendor networks"
    >
      {activeProducts.length === 0 ? (
        <div className="w-full text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[32px] bg-white/30 dark:bg-zinc-900/10">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            No pre-owned equipment has been listed yet. Vendors can publish gear from the Command Center.
          </p>
        </div>
      ) : (
        <HorizontalScroller id="marketplace-scroller">
          {activeProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </HorizontalScroller>
      )}
    </SectionShell>
  );
}
