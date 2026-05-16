import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/format';

interface FieldShellProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldShell({ label, htmlFor, error, hint, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

const baseInput =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:focus:ring-indigo-400/30 disabled:opacity-60';

const errorRing =
  'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500/30';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const inputId = id ?? `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint}>
      <input
        id={inputId}
        className={cn(baseInput, error && errorRing, className)}
        {...rest}
      />
    </FieldShell>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...rest }: TextareaProps) {
  const inputId = id ?? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint}>
      <textarea
        id={inputId}
        className={cn(baseInput, 'min-h-[80px]', error && errorRing, className)}
        {...rest}
      />
    </FieldShell>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Select({ label, error, hint, className, id, children, ...rest }: SelectProps) {
  const inputId = id ?? `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint}>
      <select
        id={inputId}
        className={cn(baseInput, 'pr-8', error && errorRing, className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}
