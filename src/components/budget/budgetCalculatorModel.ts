/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BudgetBreakdownItem {
  name: string;
  amount: number;
  color: string;
}

export interface BudgetResult {
  minTotal: number;
  maxTotal: number;
  breakdown: BudgetBreakdownItem[];
}

// Pricing definitions for calculation (in INR ₹)
const BASE_COSTS: Record<string, number> = {
  'venues': 50000,
  'catering': 350, // per guest
  'decor': 20000,
  'tent-house': 15000,
  'cooling': 10000,
  'sound-dj': 15000,
  'lighting': 10000,
  'manpower': 8000,
  'photo-video': 25000,
  'mehendi': 5000,
  'disposables': 15, // per guest
  'transport': 8000,
};

const TIER_MULTIPLIERS = {
  Budget: 0.8,
  Standard: 1.2,
  Premium: 2.2,
};

const EVENT_MULTIPLIERS: Record<string, number> = {
  'Birthday/Private Party': 0.7,
  'Wedding/Engagement': 1.6,
  'Religious/Community Event': 0.8,
  'Corporate/Other': 1.2,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Venues': '#3B82F6', // blue
  'Catering': '#F59E0B', // amber
  'Decor': '#EC4899', // pink
  'Tent House': '#10B981', // emerald
  'Cooling': '#06B6D4', // cyan
  'Sound/DJ': '#8B5CF6', // purple
  'Lighting': '#FBBF24', // yellow
  'Manpower': '#6366F1', // indigo
  'Photo/Video': '#D946EF', // fuchsia
  'Mehendi': '#EF4444', // red
  'Disposables': '#64748B', // slate
  'Transport': '#14B8A6', // teal
};

export function calculateEventBudget(
  eventType: string,
  guests: number,
  selectedServiceIds: string[],
  qualityTier: 'Budget' | 'Standard' | 'Premium'
): BudgetResult {
  const tierMult = TIER_MULTIPLIERS[qualityTier] || 1.0;
  const eventMult = EVENT_MULTIPLIERS[eventType] || 1.0;

  let computedMin = 0;
  const breakdown: BudgetBreakdownItem[] = [];

  selectedServiceIds.forEach((serviceId) => {
    let serviceCost = 0;
    
    if (serviceId === 'catering' || serviceId === 'disposables') {
      // Per guest pricing
      const perGuestRate = BASE_COSTS[serviceId] || 0;
      serviceCost = perGuestRate * guests * tierMult * eventMult;
    } else {
      // Fixed base pricing
      const baseCost = BASE_COSTS[serviceId] || 0;
      serviceCost = baseCost * tierMult * eventMult;
    }

    // Capitalize label for display
    const categoryName = serviceId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace('Dj', 'DJ');

    const color = CATEGORY_COLORS[categoryName] || '#94A3B8';

    breakdown.push({
      name: categoryName,
      amount: Math.round(serviceCost),
      color,
    });

    computedMin += serviceCost;
  });

  const minTotal = Math.round(computedMin);
  const maxTotal = Math.round(computedMin * 1.25); // 25% range buffer

  return {
    minTotal,
    maxTotal,
    breakdown,
  };
}
