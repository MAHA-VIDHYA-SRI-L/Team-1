// Shared key-value display tile used in profile and detail views

interface InfoTileProps {
  label: string;
  value?: string | number | null;
  span?: boolean;
  className?: string;
}

export function InfoTile({ label, value, span = false, className = '' }: InfoTileProps) {
  return (
    <div
      className={[
        'p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl',
        'border border-slate-100 dark:border-slate-700/80',
        span ? 'sm:col-span-2' : '',
        className,
      ].join(' ')}
    >
      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">
        {value || '—'}
      </p>
    </div>
  );
}
