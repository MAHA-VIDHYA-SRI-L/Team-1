import React from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size    = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantCls: Record<Variant, string> = {
  primary:
    'bg-[#002D62] hover:bg-[#001e4d] dark:bg-blue-600 dark:hover:bg-blue-500 text-white border border-[#002D62] dark:border-blue-600 shadow-sm',
  secondary:
    'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
  danger:
    'bg-red-50 dark:bg-red-950/30 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent',
  success:
    'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40',
};

const sizeCls: Record<Size, string> = {
  xs: 'px-2.5 py-1 text-[10px] gap-1 rounded-md',
  sm: 'px-3 py-1.5 text-[11px] gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-xs gap-2 rounded-xl',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
        variantCls[variant],
        sizeCls[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
