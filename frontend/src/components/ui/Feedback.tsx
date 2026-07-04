import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

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

export const Toast = ({ message, type = 'success' }: ToastProps) => {
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl border animate-in slide-in-from-top-3 duration-300 ${toastStyles[type]}`}>
      {toastIcons[type]}{message}
    </div>
  );
};

// ─── FormError ────────────────────────────────────────────────────────────────
export const FormError = ({ message }: { message: string }) => {
  return (
    <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-3 flex items-center gap-2 font-semibold">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
