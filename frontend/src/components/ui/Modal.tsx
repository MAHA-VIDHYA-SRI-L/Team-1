import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  onClose: () => void;
  title?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  children: React.ReactNode;
  /** Footer slot — rendered below children with a top border */
  footer?: React.ReactNode;
  /** Max width class, default 'max-w-md' */
  maxWidth?: string;
  /** Legacy modal size */
  size?: 'sm' | 'md' | 'lg';
}

const sizeWidths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({
  open = true,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth,
  size,
}: ModalProps) {
  const resolvedWidth = maxWidth || (size ? sizeWidths[size] : 'max-w-md');
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={[
          'relative w-full',
          resolvedWidth,
          'bg-white dark:bg-[#1E293B]',
          'border border-slate-200 dark:border-slate-700',
          'rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)]',
          'max-h-[90vh] flex flex-col',
          'animate-scaleIn',
        ].join(' ')}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/80 shrink-0">
            <div>
              {title && (
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ml-3 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
