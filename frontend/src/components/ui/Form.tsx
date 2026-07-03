import React from 'react';

// ── Shared base class ──────────────────────────────────────────────────────
const inputBase = [
  'w-full rounded-xl text-sm font-medium',
  'bg-white dark:bg-slate-800/90',
  'text-slate-800 dark:text-slate-100',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'border border-slate-200 dark:border-slate-700',
  'outline-none transition-all',
  'focus:border-[#002D62] dark:focus:border-blue-400',
  'focus:ring-2 focus:ring-[#002D62]/10 dark:focus:ring-blue-500/20',
  'disabled:opacity-50 disabled:cursor-not-allowed',
].join(' ');

const errorBase = 'border-red-400 dark:border-red-700 bg-red-50/30 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-200/30';

// ── Label ──────────────────────────────────────────────────────────────────
interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5"
    >
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ── FieldError ─────────────────────────────────────────────────────────────
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1">
      <span className="shrink-0">⚠</span> {message}
    </p>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={[
          inputBase,
          'py-2.5 shadow-sm',
          icon ? 'pl-10 pr-4' : 'px-3.5',
          error ? errorBase : '',
          className,
        ].join(' ')}
      />
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={[
        inputBase,
        'px-3.5 py-2.5 resize-none shadow-sm',
        error ? errorBase : '',
        className,
      ].join(' ')}
    />
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={[
        inputBase,
        'px-3.5 py-2.5 shadow-sm cursor-pointer',
        error ? errorBase : '',
        className,
      ].join(' ')}
    >
      {children}
    </select>
  );
}
