import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../components/Spinner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge, PriorityBadge } from "../components/Badge";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import type { DashboardData } from "../types/api";
import { formatDate, isOverdue } from "../lib/format";

type Accent = "indigo" | "amber" | "emerald" | "rose";

interface KpiCardProps {
  label: string;
  value: number;
  accent: Accent;
  icon: ReactNode;
}

const accentMap: Record<Accent, { bg: string; text: string }> = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-300" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-300" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-300" },
  rose: { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-600 dark:text-rose-300" },
};

function KpiCard({ label, value, accent, icon }: KpiCardProps) {
  const a = accentMap[accent];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${a.bg} ${a.text}`}>{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {value === 0 ? "No items" : value === 1 ? "1 item" : `${value} items`}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const dq = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/dashboard/me"),
  });

  if (dq.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dq.data) {
    return <EmptyState title="Could not load dashboard" description="Refresh and try again." />;
  }

  const { myTasks, statusCounts, overdue, projectsProgress } = dq.data;
  const overdueCount = overdue.length;
  const total = statusCounts.TODO + statusCounts.IN_PROGRESS + statusCounts.DONE;

  return (
    <>
      <div className="mb-8">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Hi {user?.name?.split(" ")[0] ?? "there"}, welcome back.
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Here's what's happening across your projects today.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="To Do"
          value={statusCounts.TODO}
          accent="indigo"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <path d="M9 11h6M9 15h4" />
            </svg>
          }
        />
        <KpiCard
          label="In Progress"
          value={statusCounts.IN_PROGRESS}
          accent="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          }
        />
        <KpiCard
          label="Done"
          value={statusCounts.DONE}
          accent="emerald"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          }
        />
        <KpiCard
          label="Overdue"
          value={overdueCount}
          accent="rose"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight">My open tasks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myTasks.length} task{myTasks.length === 1 ? "" : "s"} assigned to you
              </p>
            </div>
            <Link to="/projects" className="text-xs font-semibold text-slate-700 hover:underline dark:text-slate-300">
              All projects →
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <EmptyState title="All caught up!" description="No open tasks assigned to you." />
          ) : (
            <ul className="-mx-2 divide-y divide-slate-100 dark:divide-slate-800/70">
              {myTasks.slice(0, 8).map((task) => {
                const due = isOverdue(task.dueDate, task.status);
                return (
                  <li key={task.id}>
                    <Link
                      to={`/projects/${task.projectId}`}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={task.status} />
                          <PriorityBadge priority={task.priority} />
                          {due && (
                            <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                              Overdue
                            </span>
                          )}
                        </div>
                        <div className="mt-1 truncate text-sm font-medium">{task.title}</div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {task.project?.name ?? "Project"}
                          {task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ""}
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-400 dark:text-slate-500">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mb-4">
            <h3 className="text-[15px] font-semibold tracking-tight">Project progress</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} tasks · {statusCounts.DONE} completed
            </p>
          </div>

          {projectsProgress.length === 0 ? (
            <EmptyState title="No projects yet" description="Create one to see progress." />
          ) : (
            <ul className="space-y-4">
              {projectsProgress.map((p) => (
                <li key={p.projectId}>
                  <Link to={`/projects/${p.projectId}`} className="block group">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium group-hover:text-slate-900 dark:group-hover:text-white">
                        {p.name}
                      </div>
                      <div className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                        {p.pctDone}%
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all dark:bg-white"
                        style={{ width: `${Math.max(2, p.pctDone)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {p.done} of {p.total} done
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {overdueCount > 0 && (
        <section className="mt-6 rounded-xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-500/30 dark:bg-rose-500/5">
          <div className="flex items-start gap-4">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold tracking-tight text-rose-900 dark:text-rose-200">
                {overdueCount} overdue task{overdueCount === 1 ? "" : "s"}
              </h3>
              <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">
                These need your attention. Tap any to jump to its project.
              </p>
              <ul className="mt-3 space-y-1">
                {overdue.slice(0, 5).map((t) => (
                  <li key={t.id}>
                    <Link to={`/projects/${t.projectId}`} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-sm transition-colors hover:bg-rose-50 dark:bg-slate-900/40 dark:hover:bg-slate-900/70">
                      <span className="truncate font-medium">{t.title}</span>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {t.dueDate ? formatDate(t.dueDate) : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
