/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type GearCondition = 'Mint' | 'Excellent' | 'Good' | 'Fair';

const CONDITION_MULTIPLIERS: Record<GearCondition, number> = {
  Mint: 0.85,
  Excellent: 0.70,
  Good: 0.50,
  Fair: 0.30,
};

export function computeSuggestedPrice(
  originalRetailPrice: number,
  condition: GearCondition,
  ageInMonths: number
): number {
  if (!originalRetailPrice || originalRetailPrice <= 0) return 0;

  const condMult = CONDITION_MULTIPLIERS[condition] || 0.50;
  
  // Depreciation factor based on age (in months)
  // Lose 1.5% value per month, capped at maximum 60% loss (0.40 multiplier)
  const depreciationFactor = Math.max(0.40, 1 - (ageInMonths * 0.015));

  const suggestedPrice = originalRetailPrice * condMult * depreciationFactor;

  return Math.round(suggestedPrice);
}
