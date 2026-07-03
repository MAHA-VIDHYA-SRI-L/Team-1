/**
 * Placemate Design System — Token Map
 * Single source of truth for all shared Tailwind class strings.
 * Import from here instead of repeating class strings across pages.
 */

// ── Surfaces ──────────────────────────────────────────────────────────────
export const surface = {
  page:    'bg-[#F8FAFC] dark:bg-[#0F172A]',
  card:    'bg-white dark:bg-[#1E293B]',
  card2:   'bg-slate-50 dark:bg-[#0F172A]',
  overlay: 'bg-white/95 dark:bg-[#1E293B]/95',
} as const;

// ── Borders ────────────────────────────────────────────────────────────────
export const border = {
  base:    'border border-slate-200 dark:border-slate-700/80',
  subtle:  'border border-slate-100 dark:border-slate-800',
  strong:  'border border-slate-300 dark:border-slate-600',
  brand:   'border border-[#002D62]/20 dark:border-blue-800/50',
} as const;

// ── Radius ─────────────────────────────────────────────────────────────────
export const radius = {
  sm:  'rounded-lg',       // 8px
  md:  'rounded-xl',       // 12px
  lg:  'rounded-2xl',      // 16px
  xl:  'rounded-[20px]',   // 20px
  '2xl': 'rounded-[24px]', // 24px
  full: 'rounded-full',
} as const;

// ── Shadows ────────────────────────────────────────────────────────────────
export const shadow = {
  sm: 'shadow-sm',
  md: 'shadow-[0_4px_16px_-2px_rgba(0,45,98,0.08),0_2px_6px_-2px_rgba(0,0,0,0.04)]',
  lg: 'shadow-[0_10px_30px_-5px_rgba(0,45,98,0.12),0_4px_10px_-4px_rgba(0,0,0,0.06)]',
} as const;

// ── Typography ─────────────────────────────────────────────────────────────
export const text = {
  // Page / section headings
  pageTitle:    'text-[15px] font-black text-slate-800 dark:text-slate-100 leading-none',
  sectionTitle: 'text-sm font-bold text-slate-800 dark:text-slate-100',
  cardTitle:    'text-sm font-bold text-slate-800 dark:text-white',

  // Body
  body:    'text-sm text-slate-600 dark:text-slate-300',
  bodyMd:  'text-[13px] text-slate-600 dark:text-slate-300',
  bodySm:  'text-xs text-slate-500 dark:text-slate-400',

  // Labels / caps
  label:   'text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
  caption: 'text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest',

  // Muted
  muted:   'text-slate-400 dark:text-slate-500',

  // Brand
  brand:   'text-[#002D62] dark:text-blue-400',
} as const;

// ── Spacing ────────────────────────────────────────────────────────────────
export const spacing = {
  pagePadding: 'p-5 sm:p-6 lg:p-8',
  cardPadding: 'p-5',
  sectionGap:  'space-y-6',
  gridGap:     'gap-4',
  gridGapLg:   'gap-6',
} as const;

// ── Sidebar ────────────────────────────────────────────────────────────────
export const sidebar = {
  bg:        'bg-[#002D62] dark:bg-[#090D16]',
  border:    'border-r border-transparent dark:border-slate-800/80',
  navItem:   'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold tracking-wide transition-all',
  navActive: 'bg-white/10 text-white border border-white/10',
  navIdle:   'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent',
} as const;

// ── Topbar ─────────────────────────────────────────────────────────────────
export const topbar = {
  base: 'bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0 transition-colors',
} as const;
