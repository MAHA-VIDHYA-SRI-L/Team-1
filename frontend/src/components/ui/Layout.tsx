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
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = '' }: PageHeaderProps) {
  return (
    <div className={['flex items-start justify-between gap-4', className].join(' ')}>
      <div>
        <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
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
  className?: string;
  onClick?: () => void;
}

export function StatCard({ label, value, icon, iconBg = 'bg-[#002D62]/10 dark:bg-blue-900/30', trend, className = '', onClick }: StatCardProps) {
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
          <div className={['p-2.5 rounded-xl', iconBg].join(' ')}>
            {icon}
          </div>
        )}
      </div>
      {trend && <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/80">{trend}</div>}
    </div>
  );
}
