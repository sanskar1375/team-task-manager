import type { Priority, Status, Role } from '../types/api';
import { cn } from '../lib/format';

const STATUS_STYLES: Record<Status, string> = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
};

const STATUS_LABELS: Record<Status, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

const STATUS_DOTS: Record<Status, string> = {
  TODO: 'bg-slate-400 dark:bg-slate-500',
  IN_PROGRESS: 'bg-amber-500',
  DONE: 'bg-emerald-500',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  HIGH: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
  MEMBER: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const base = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium';

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(base, STATUS_STYLES[status])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOTS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, PRIORITY_STYLES[priority])}>{priority.charAt(0) + priority.slice(1).toLowerCase()}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <span className={cn(base, ROLE_STYLES[role])}>{role.charAt(0) + role.slice(1).toLowerCase()}</span>;
}
