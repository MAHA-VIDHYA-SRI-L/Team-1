import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

// ── Empty State ────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6',
        'bg-white dark:bg-[#1E293B]',
        'border border-dashed border-slate-200 dark:border-slate-700',
        'rounded-2xl',
        className,
      ].join(' ')}
    >
      {icon && (
        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────
interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="md" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-red-100 dark:bg-red-950/40 rounded-xl shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
