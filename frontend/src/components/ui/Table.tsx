import React from 'react';

// ── Table wrapper ──────────────────────────────────────────────────────────
interface TableProps {
  headers?: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = '' }: TableProps) {
  if (headers) {
    return (
      <div className="overflow-x-auto">
        <table className={['w-full text-sm border-collapse', className].join(' ')}>
          <thead className="bg-gradient-to-r from-[#002D62] via-[#00387a] to-[#002D62] text-white border-b border-[#001f44] dark:from-slate-800 dark:to-slate-850 dark:border-slate-700">
            <tr className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap text-white/95 dark:text-slate-400">
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
        </table>
      </div>
    );
  }

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

// ── TableRow ───────────────────────────────────────────────────────────────
interface TableRowProps {
  children: React.ReactNode;
  striped?: boolean;
  className?: string;
}

export function TableRow({ children, striped = false, className = '' }: TableRowProps) {
  return (
    <tr
      className={[
        'transition-colors',
        striped ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-800/80',
        'hover:bg-slate-50/80 dark:hover:bg-slate-800/60',
        className,
      ].join(' ')}
    >
      {children}
    </tr>
  );
}
