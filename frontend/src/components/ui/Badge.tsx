import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'muted';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantCls: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40',
  warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
  danger:  'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40',
  info:    'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40',
  brand:   'bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-300 border-[#002D62]/20 dark:border-blue-700/50',
  muted:   'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800',
};

const dotCls: Record<BadgeVariant, string> = {
  default: 'bg-slate-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  brand:   'bg-[#002D62] dark:bg-blue-400',
  muted:   'bg-slate-300',
};

export function Badge({ variant = 'default', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-0.5',
        'rounded-full text-[10px] font-black uppercase tracking-wider',
        'border',
        variantCls[variant],
        className,
      ].join(' ')}
    >
      {dot && <span className={['w-1.5 h-1.5 rounded-full shrink-0', dotCls[variant]].join(' ')} />}
      {children}
    </span>
  );
}

// ── Convenience wrappers ───────────────────────────────────────────────────

interface StatusBadgeProps {
  status: 'Placed' | 'Not Placed' | 'Verified' | 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Blocked';
  className?: string;
}

const statusMap: Record<StatusBadgeProps['status'], { variant: BadgeVariant; label: string }> = {
  'Placed':     { variant: 'success', label: 'Placed' },
  'Not Placed': { variant: 'warning', label: 'Not Placed' },
  'Verified':   { variant: 'info',    label: 'Verified' },
  'Pending':    { variant: 'warning', label: 'Pending' },
  'Approved':   { variant: 'success', label: 'Approved' },
  'Rejected':   { variant: 'danger',  label: 'Rejected' },
  'Active':     { variant: 'success', label: 'Active' },
  'Blocked':    { variant: 'danger',  label: 'Blocked' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { variant, label } = statusMap[status] ?? { variant: 'muted' as BadgeVariant, label: status };
  return <Badge variant={variant} dot className={className}>{label}</Badge>;
}
