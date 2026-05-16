import { ApiError } from './api';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateInput(input: string | Date | null | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function isOverdue(
  dueDate: string | null | undefined,
  status: string
): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && status !== 'DONE';
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}

export function getFieldErrors(
  err: unknown
): Record<string, string> | null {
  if (!(err instanceof ApiError)) return null;
  if (err.code !== 'VALIDATION_ERROR') return null;
  const details = err.details;
  if (!Array.isArray(details)) return null;
  const out: Record<string, string> = {};
  for (const item of details) {
    if (
      item &&
      typeof item === 'object' &&
      'path' in item &&
      'message' in item &&
      typeof (item as { path: unknown }).path === 'string' &&
      typeof (item as { message: unknown }).message === 'string'
    ) {
      const path = (item as { path: string }).path;
      const message = (item as { message: string }).message;
      out[path] = message;
    }
  }
  return Object.keys(out).length > 0 ? out : null;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}
