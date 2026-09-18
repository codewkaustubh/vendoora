/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiService, ApiVendor } from '../../types';
import { toVendorCardModels } from '../../lib/vendorModels';
import VendorCard from './VendorCard';
import SectionShell from '../common/SectionShell';

interface VendorSectionProps {
  id?: string;
  selectedCategory?: string;
  /** Vendor records from `GET /api/vendors`. */
  vendors?: ApiVendor[];
  /** Service records from `GET /api/services`, used for starting prices. */
  services?: ApiService[];
}

export default function VendorSection({ id, selectedCategory, vendors, services }: VendorSectionProps) {
  const cards = toVendorCardModels(vendors || [], services || []);
  // Filter by category if one is active on landing page
  const filteredVendors = selectedCategory
    ? cards.filter((v) => v.category.toLowerCase() === selectedCategory.toLowerCase())
    : cards;

  return (
    <SectionShell
      id={id || 'vendor-section'}
      title="Verified Event Vendors"
      subtitle="Handpicked, fully vetted service professional networks near you"
    >
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredVendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="w-full text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/30 dark:bg-zinc-900/10">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            {selectedCategory
              ? `No matching vendors found for "${selectedCategory}". Please select another category.`
              : 'No vendors have joined yet. Check back soon for verified event partners.'}
          </p>
        </div>
      )}
    </SectionShell>
  );
}
