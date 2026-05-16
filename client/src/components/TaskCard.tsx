import type { Task } from '../types/api';
import { StatusBadge, PriorityBadge } from './Badge';
import { formatDate, isOverdue } from '../lib/format';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const initial = task.assignee?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</h4>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          {overdue && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              Overdue
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignee ? (
            <div
              title={task.assignee.name}
              className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {initial}
            </div>
          ) : (
            <div
              title="Unassigned"
              className="grid h-6 w-6 place-items-center rounded-full border border-dashed border-slate-300 text-slate-400 dark:border-slate-700 dark:text-slate-500"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-3 w-3">
                <circle cx="12" cy="8" r="4" />
                <path d="M3.5 20.5a8.5 8.5 0 0 1 17 0" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
