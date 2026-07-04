import React from 'react';

// ── PageContainer ──────────────────────────────────────────────────────────
// Wraps the main content area of every page with consistent max-width + padding
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Use 'wide' for staff/admin dashboards, 'default' for student pages */
  width?: 'default' | 'wide' | 'full';
}

const widthCls = {
  default: 'max-w-5xl',
  wide:    'max-w-[1400px]',
  full:    'w-full',
};

export function PageContainer({ children, className = '', width = 'default' }: PageContainerProps) {
  return (
    <main
      className={[
        'flex-1',
        'p-5 sm:p-6 lg:p-8',
        widthCls[width],
        'w-full mx-auto',
        'space-y-6',
        className,
      ].join(' ')}
    >
      {children}
    </main>
  );
}

// ── PageHeader ─────────────────────────────────────────────────────────────
// Consistent page-level heading block
interface PageHeaderProps {
  logo?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  actions?: React.ReactNode;
  statusDot?: boolean;
  className?: string;
}

export function PageHeader({
  logo,
  title,
  subtitle,
  badge,
  action,
  actions,
  statusDot = false,
  className = '',
}: PageHeaderProps) {
  const finalAction = action || actions;
  return (
    <div className={['flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80 dark:border-slate-800/80', className].join(' ')}>
      <div className="flex items-center gap-3.5">
        {logo}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-[#002D62] dark:text-blue-400 tracking-tight leading-none uppercase">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-300 border border-[#002D62]/20 dark:border-blue-700/50 uppercase tracking-widest">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {statusDot && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">System Live</span>
          </div>
        )}
        {finalAction && <div className="shrink-0">{finalAction}</div>}
      </div>
    </div>
  );
}

// ── SectionCard ────────────────────────────────────────────────────────────
// A titled section block — lighter than Card, used for grouping content
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}: SectionCardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-[#1E293B]',
        'border border-slate-200 dark:border-slate-700/80',
        'rounded-2xl shadow-sm transition-colors',
        className,
      ].join(' ')}
    >
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/80">
          <div>
            {title && (
              <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none">{title}</h3>
            )}
            {subtitle && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 ml-3">{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
// Metric display card used in dashboards
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: React.ReactNode;
  footer?: React.ReactNode;
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  iconBg = 'bg-[#002D62]/10 dark:bg-blue-900/30',
  trend,
  footer,
  accentColor = '',
  className = '',
  onClick,
}: StatCardProps) {
  const finalFooter = footer || trend;
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white dark:bg-[#1E293B]',
        'border border-slate-200 dark:border-slate-700/80',
        'rounded-2xl p-5 shadow-sm',
        'transition-all',
        onClick ? 'cursor-pointer hover:border-[#002D62]/40 dark:hover:border-blue-500 hover:shadow-md' : '',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {value}
          </p>
        </div>
        {icon && (
          <div className={['p-2.5 rounded-xl flex items-center justify-center shrink-0', iconBg, accentColor].join(' ')}>
            {icon}
          </div>
        )}
      </div>
      {finalFooter && <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80">{finalFooter}</div>}
    </div>
  );
}
