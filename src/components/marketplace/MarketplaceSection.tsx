/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PRODUCTS } from '../../data/vendooraMockData';
import ProductCard from './ProductCard';
import HorizontalScroller from '../common/HorizontalScroller';
import SectionShell from '../common/SectionShell';

interface MarketplaceSectionProps {
  id?: string;
  products?: any[];
}

export default function MarketplaceSection({ id, products }: MarketplaceSectionProps) {
  const activeProducts = products || PRODUCTS;
  return (
    <SectionShell
      id={id || 'marketplace-section'}
      title="Secondary Market & Equipment"
      subtitle="Purchase certified, high-grade used event gear directly from trusted vendor networks"
    >
      <HorizontalScroller id="marketplace-scroller">
        {activeProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </HorizontalScroller>
    </SectionShell>
  );
}
