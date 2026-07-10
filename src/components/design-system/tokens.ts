/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Centered Design Token System for Vendoora UI Library
 * This file maps semantic UI terms to Tailwind classes, allowing
 * easy dark/light toggling and maintaining absolute design cohesion.
 */

export const DesignTokens = {
  // Theme Color Configurations (semantic mappings to support Light/Dark dual modes)
  colors: {
    // Brand Specific
    brand: {
      cobalt: '#1E40AF',
      cobaltHover: '#1D4ED8',
      purple: '#6366F1',
      purpleHover: '#4F46E5',
      orange: '#F97316',
      pink: '#EC4899',
    },

    // Semantic roles mapped to Tailwind classes
    primary: {
      light: 'bg-[#1E40AF] text-white hover:bg-[#1D4ED8]',
      dark: 'dark:bg-[#6366F1] dark:text-white dark:hover:bg-[#4F46E5]',
      text: 'text-[#1E40AF] dark:text-[#6366F1]',
    },

    secondary: {
      light: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
      dark: 'dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
      text: 'text-zinc-500 dark:text-zinc-400',
    },

    success: {
      light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dark: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-400',
    },

    warning: {
      light: 'bg-amber-50 text-amber-700 border-amber-200',
      dark: 'dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
    },

    danger: {
      light: 'bg-red-50 text-red-700 border-red-200',
      dark: 'dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50',
      text: 'text-red-600 dark:text-red-400',
    },

    info: {
      light: 'bg-blue-50 text-blue-700 border-blue-200',
      dark: 'dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50',
      text: 'text-blue-600 dark:text-blue-400',
    },

    // Background and Surface containers
    background: {
      light: 'bg-[#FCFBF7]', // Warm off-white
      dark: 'dark:bg-[#121212]', // Smooth dark canvas
    },

    surface: {
      light: 'bg-white/80 border-zinc-200/60 backdrop-blur-md',
      dark: 'dark:bg-zinc-900/60 dark:border-zinc-800/60 dark:backdrop-blur-md',
    },

    // Text & Typography colors
    text: {
      primary: 'text-zinc-900 dark:text-zinc-50',
      secondary: 'text-zinc-500 dark:text-zinc-400',
      muted: 'text-zinc-400 dark:text-zinc-500',
      inverted: 'text-white dark:text-zinc-950',
    },

    // Input-specific colors
    input: {
      bg: 'bg-white dark:bg-zinc-950',
      border: 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400',
      text: 'text-zinc-900 dark:text-white',
      placeholder: 'placeholder-zinc-400 dark:placeholder-zinc-600',
    },

    // Borders & Dividers
    border: {
      light: 'border-zinc-100',
      dark: 'dark:border-zinc-800/80',
    }
  },

  // Focus & Accessibility states
  accessibility: {
    focusRing: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-indigo-400',
    focusRingOffset: 'focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950',
    srOnly: 'sr-only', // Screen reader accessible helper
  },

  // Consistent typography tokens
  typography: {
    fontSans: 'font-sans',
    fontHeading: 'font-heading',
    fontSerif: 'font-serif',
    fontMono: 'font-mono',

    // Sizing scales matching Pinterest / Editorial rhythm
    sizes: {
      xs: 'text-[10px] tracking-wider uppercase font-bold',
      sm: 'text-xs md:text-sm leading-relaxed',
      base: 'text-sm md:text-base leading-normal',
      lg: 'text-base md:text-lg font-semibold tracking-tight',
      xl: 'text-lg md:text-xl font-bold tracking-tight',
      display: 'text-2xl md:text-3xl font-bold font-serif leading-tight',
    },
  },

  // Rounded borders matching 32px bento containers, buttons, and badges
  radius: {
    badge: 'rounded-full',
    button: 'rounded-full',
    input: 'rounded-xl sm:rounded-2xl',
    card: 'rounded-[32px]',
    subCard: 'rounded-2xl',
  },

  // Consistent UI padding grids
  spacing: {
    badge: 'px-3 py-1',
    button: 'px-5 py-2.5 sm:px-6 sm:py-3',
    buttonSm: 'px-3.5 py-1.5 sm:px-4 sm:py-2',
    input: 'px-4 py-3',
    card: 'p-6 md:p-8',
    cardSm: 'p-4 md:p-5',
    gap: 'gap-4 sm:gap-6 md:gap-8',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md shadow-zinc-200/50 dark:shadow-none',
    lg: 'shadow-lg shadow-zinc-200/50 dark:shadow-none',
    xl: 'shadow-xl shadow-zinc-200/40 dark:shadow-none',
    glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)] dark:shadow-[0_0_20px_rgba(99,102,241,0.1)]',
    holographic: 'hover:shadow-[0_0_20px_rgba(244,244,245,0.4)] dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300'
  },

  // Motion transitions
  motion: {
    spring: { type: 'spring', stiffness: 300, damping: 20 },
    default: { duration: 0.2, ease: 'easeOut' },
  }
};
