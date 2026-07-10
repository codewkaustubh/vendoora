/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BrandTokens = {
  // Brand colors & gradients
  colors: {
    // Action buttons & links (Deep vibrant cobalt)
    electricCobalt: 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8]',
    electricCobaltText: 'text-[#1E40AF]',
    
    // Condition badges
    sunsetOrange: 'bg-[#F97316] text-white',
    sunsetOrangeText: 'text-[#F97316]',
    
    // Verified status indicator
    softMint: 'bg-[#D1FAE5] text-[#065F46]',
    softMintDark: 'dark:bg-[#065F46]/20 dark:text-[#34D399]',
    
    // Primary brand gradient (VENDOORA text gradient)
    wordmarkGradient: 'bg-gradient-to-r from-[#002366] via-[#1E40AF] to-[#8B5CF6] bg-clip-text text-transparent',
    vendorDashboardGradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent',
    
    // Dark mode dashboard accents
    neonPurple: 'bg-[#6366F1] text-white hover:bg-[#4F46E5]',
    neonPurpleBorder: 'border-[#6366F1]/30 hover:border-[#6366F1]/60',
    neonMint: 'bg-[#10B981] text-white',
    neonMintText: 'text-[#10B981]'
  },

  // Common UI containers styling
  styles: {
    // 32px rounded corners bento container
    bentoCard: 'bg-white/70 dark:bg-[#121212]/80 backdrop-blur-md rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/50 p-6 md:p-8 shadow-sm transition-all duration-300',
    
    // Symmetrical grid item hover
    holographicHover: 'hover:shadow-[0_0_20px_rgba(244,244,245,0.4)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] hover:border-zinc-400/50 dark:hover:border-zinc-600/50 transition-all duration-300',
    
    // Glassmorphism frosted style
    chromeGlass: 'bg-white/40 dark:bg-[#121212]/60 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 shadow-lg shadow-black/5',
    tallHeader: 'py-5 md:py-6',
    
    // Small pill-shaped glass action button within grid items
    glassPillBtn: 'px-3 py-1.5 text-xs font-semibold rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-200',
    
    // Neon booking toggle active styling
    neonMintGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)] border-[#10B981]',
    
    // Neon toggle active styling (purple)
    neonPurpleGlow: 'shadow-[0_0_15px_rgba(99,102,241,0.5)] border-[#6366F1]'
  }
};
