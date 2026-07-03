import { Loader2 } from 'lucide-react';

// ── Inline spinner ─────────────────────────────────────────────────────────
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const spinnerSize = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-7 w-7' };

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <Loader2
      className={[
        'animate-spin text-[#002D62] dark:text-blue-400',
        spinnerSize[size],
        className,
      ].join(' ')}
    />
  );
}

// ── Full-page loader ───────────────────────────────────────────────────────
interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center gap-3 transition-colors">
      <Spinner size="md" />
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{message}</span>
    </div>
  );
}

// ── Inline section loader ──────────────────────────────────────────────────
export function SectionLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center py-16 gap-3">
      <Spinner size="md" />
      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{message}</span>
    </div>
  );
}

// ── Skeleton box ───────────────────────────────────────────────────────────
interface SkeletonBoxProps {
  className?: string;
}

export function SkeletonBox({ className = '' }: SkeletonBoxProps) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700/60',
        className,
      ].join(' ')}
    />
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 space-y-4 animate-pulse">
      <SkeletonBox className="h-4 w-1/3" />
      <SkeletonBox className="h-32 w-full" />
      <div className="space-y-2">
        <SkeletonBox className="h-3 w-3/4" />
        <SkeletonBox className="h-3 w-1/2" />
      </div>
    </div>
  );
}

// ── Skeleton profile ───────────────────────────────────────────────────────
export function SkeletonProfile() {
  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-14 bg-slate-100 dark:bg-slate-700/50" />
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl space-y-2">
            <SkeletonBox className="h-3 w-1/2" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
