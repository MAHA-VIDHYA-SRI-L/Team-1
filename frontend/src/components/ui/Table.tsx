import React from 'react';

// ── Table wrapper ──────────────────────────────────────────────────────────
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={['w-full text-sm border-collapse', className].join(' ')}>
        {children}
      </table>
    </div>
  );
}

// ── Thead ──────────────────────────────────────────────────────────────────
export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
      {children}
    </thead>
  );
}

// ── Th ─────────────────────────────────────────────────────────────────────
interface ThProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export function Th({ children, className = '', align = 'left' }: ThProps) {
  return (
    <th
      className={[
        'px-4 py-3',
        'text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      ].join(' ')}
    >
      {children}
    </th>
  );
}

// ── Tbody ──────────────────────────────────────────────────────────────────
export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>;
}

// ── Tr ─────────────────────────────────────────────────────────────────────
interface TrProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Tr({ children, className = '', onClick }: TrProps) {
  return (
    <tr
      onClick={onClick}
      className={[
        'transition-colors',
        'hover:bg-slate-50/60 dark:hover:bg-slate-800/40',
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </tr>
  );
}

// ── Td ─────────────────────────────────────────────────────────────────────
interface TdProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  muted?: boolean;
}

export function Td({ children, className = '', align = 'left', muted = false }: TdProps) {
  return (
    <td
      className={[
        'px-4 py-3',
        muted ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200',
        'font-medium',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        className,
      ].join(' ')}
    >
      {children}
    </td>
  );
}
