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
        /* Empty state keeps the exact geometry of the populated scroller
           (w-64 card row + pb-4) so the section never collapses. */
        <HorizontalScroller id="marketplace-scroller">
          <div className="w-full min-h-[17.5rem] flex items-center justify-center text-center rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800 bg-white/30 dark:bg-zinc-900/10">
            <p className="px-4 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              No pre-owned equipment has been listed yet. Vendors can publish gear from the Command Center.
            </p>
          </div>
        </HorizontalScroller>
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
