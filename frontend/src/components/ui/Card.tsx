import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Remove default padding */
  noPadding?: boolean;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  /** Right-side slot */
  action?: React.ReactNode;
}

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

/** Root card container */
export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={[
        'bg-white dark:bg-[#1E293B]',
        'border border-slate-200 dark:border-slate-700/80',
        'rounded-2xl shadow-sm',
        'transition-colors',
        noPadding ? '' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

/** Card header row with optional right-side action */
export function CardHeader({ children, action, className = '' }: CardHeaderProps) {
  return (
    <div
      className={[
        'flex items-center justify-between',
        'px-5 py-4',
        'border-b border-slate-100 dark:border-slate-700/80',
        className,
      ].join(' ')}
    >
      <div className="flex items-center gap-2 min-w-0">{children}</div>
      {action && <div className="shrink-0 ml-3">{action}</div>}
    </div>
  );
}

/** Card body with standard padding */
export function CardBody({ children, className = '' }: CardSectionProps) {
  return (
    <div className={['p-5', className].join(' ')}>
      {children}
    </div>
  );
}

/** Card footer row */
export function CardFooter({ children, className = '' }: CardSectionProps) {
  return (
    <div
      className={[
        'px-5 py-3.5',
        'border-t border-slate-100 dark:border-slate-700/80',
        'bg-slate-50/50 dark:bg-slate-800/30',
        'rounded-b-2xl',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
