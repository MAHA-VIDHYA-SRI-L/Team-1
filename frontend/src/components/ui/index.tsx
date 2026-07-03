import React from 'react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle, Loader2 } from 'lucide-react';

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'xs' | 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const btnBase = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';
const btnVariants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-[#002D62] to-[#00428c] text-white hover:from-[#001f44] hover:to-[#003366] shadow-md hover:shadow-lg',
  secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700',
  danger: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white',
  ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
};
const btnSizes: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5 text-xs',
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'sm', loading, icon, children, className = '', disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, label, rightElement, className = '', id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#002D62] dark:group-focus-within:text-blue-400 transition-colors pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'} py-3 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-800 border outline-none transition-all shadow-sm ${
            error
              ? 'border-red-400 dark:border-red-900/60 focus:border-red-500 bg-red-50/30 dark:bg-red-950/20'
              : 'border-slate-200 dark:border-slate-700 focus:border-[#002D62] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#002D62]/10 dark:focus:ring-blue-500/20'
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', id, children, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#002D62] dark:focus:border-blue-400 font-bold text-slate-700 dark:text-slate-200 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  )
);
Select.displayName = 'Select';

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => (
  <div className={`bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] transition-all ${hover ? 'hover:shadow-md hover:-translate-y-0.5' : ''} ${className}`}>
    {children}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
  accentColor?: string;
  footer?: React.ReactNode;
  className?: string;
}

export const StatCard = ({ label, value, icon, iconBg = 'bg-blue-50 dark:bg-blue-900/30', accentColor = 'text-blue-600 dark:text-blue-400', footer, className = '' }: StatCardProps) => (
  <Card className={`p-6 relative overflow-hidden group ${className}`}>
    <div className="flex items-center justify-between relative z-10">
      <div className="space-y-1">
        <p className="text-xs font-extrabold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
      </div>
      <div className={`h-12 w-12 ${iconBg} rounded-2xl flex items-center justify-center ${accentColor} shadow-sm group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
    </div>
    {footer && <div className="mt-4">{footer}</div>}
  </Card>
);

// ─── SectionCard ──────────────────────────────────────────────────────────────
interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const SectionCard = ({ title, subtitle, action, children, className = '', noPadding = false }: SectionCardProps) => (
  <Card className={`overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          {title && <h3 className="font-extrabold text-slate-800 dark:text-white text-sm tracking-tight">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={noPadding ? '' : 'p-6'}>{children}</div>
  </Card>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const modalSizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export const Modal = ({ title, onClose, children, size = 'md' }: ModalProps) => (
  <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-700 w-full ${modalSizes[size]} max-h-[90vh] overflow-y-auto transition-colors`}>
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
        <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">{title}</h3>
        <button type="button" onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40',
  warning: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-900/40',
  danger: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40',
  info: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200/60 dark:border-blue-900/40',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
};

export const Badge = ({ variant = 'neutral', dot = false, children, className = '' }: BadgeProps) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${badgeVariants[variant]} ${className}`}>
    {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
    {children}
  </span>
);

// ─── Table ────────────────────────────────────────────────────────────────────
interface TableProps {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className = '' }: TableProps) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full border-collapse">
      <thead className="bg-gradient-to-r from-[#002D62] via-[#00387a] to-[#002D62] text-white border-b-2 border-[#001f44]">
        <tr className="text-[11px] font-black uppercase tracking-widest text-white/95">
          {headers.map((h, i) => (
            <th key={i} className="px-6 py-4 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">{children}</tbody>
    </table>
  </div>
);

export const TableRow = ({ children, striped = false, className = '' }: { children: React.ReactNode; striped?: boolean; className?: string }) => (
  <tr className={`transition-all text-sm hover:bg-blue-50/60 dark:hover:bg-blue-950/40 ${striped ? 'bg-slate-50/80 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-800/80'} ${className}`}>
    {children}
  </tr>
);

export const Td = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-6 py-4 ${className}`}>{children}</td>
);

// ─── SectionLoader ────────────────────────────────────────────────────────────
interface SectionLoaderProps {
  message?: string;
  className?: string;
}

export const SectionLoader = ({ message = 'Loading...', className = '' }: SectionLoaderProps) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-20 ${className}`}>
    <div className="h-8 w-8 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-[#002D62] dark:border-t-blue-400 animate-spin" />
    <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">{message}</p>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState = ({ icon, title, description, action, className = '' }: EmptyStateProps) => (
  <div className={`flex flex-col items-center justify-center gap-3 py-16 text-center ${className}`}>
    {icon && <div className="text-slate-300 dark:text-slate-600 mb-1">{icon}</div>}
    <p className="font-bold text-base text-slate-600 dark:text-slate-300">{title}</p>
    {description && <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-emerald-600 border-emerald-500/50',
  error: 'bg-red-600 border-red-500/50',
  info: 'bg-blue-600 border-blue-500/50',
  warning: 'bg-amber-500 border-amber-400/50',
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
  error: <AlertCircle className="h-4 w-4 shrink-0" />,
  info: <Info className="h-4 w-4 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
};

export const Toast = ({ message, type = 'success' }: ToastProps) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 duration-300 ${toastStyles[type]}`}>
    {toastIcons[type]}{message}
  </div>
);

// ─── FormError ────────────────────────────────────────────────────────────────
export const FormError = ({ message }: { message: string }) => (
  <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-center gap-2 font-semibold">
    <AlertCircle className="h-4 w-4 shrink-0" /><span>{message}</span>
  </div>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────
interface PageHeaderProps {
  logo?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
  statusDot?: boolean;
}

export const PageHeader = ({ logo, title, subtitle, badge, actions, statusDot = false }: PageHeaderProps) => (
  <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 px-6 sm:px-10 py-4 shadow-sm transition-colors">
    <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3.5">
        {logo}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-black text-[#002D62] dark:text-blue-400 tracking-wider uppercase leading-none">{title}</p>
            {badge && (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#002D62]/10 dark:bg-blue-900/40 text-[#002D62] dark:text-blue-300 border border-[#002D62]/20 dark:border-blue-700/50 uppercase tracking-widest">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-400 dark:text-slate-400 font-bold tracking-wider mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {statusDot && (
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">System Live</span>
          </div>
        )}
        {actions}
      </div>
    </div>
  </header>
);
