import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { RoleBadge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { Spinner } from "../components/Spinner";
import { api } from "../lib/api";
import type { ProjectSummary } from "../types/api";
import { formatDate } from "../lib/format";

export function Projects() {
  const [createOpen, setCreateOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.get<ProjectSummary[]>("/projects"),
  });

  const projects = projectsQuery.data ?? [];

  return (
    <>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Your projects</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {projects.length} project{projects.length === 1 ? "" : "s"} in this workspace
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New project
        </button>
      </div>

      {projectsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking tasks with your team."
          action={
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
            >
              Create your first project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  {p.name[0]?.toUpperCase() ?? "?"}
                </div>
                <RoleBadge role={p.myRole} />
              </div>
              <h3 className="line-clamp-1 text-[15px] font-semibold tracking-tight">{p.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-slate-500 dark:text-slate-400">
                {p.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <path d="M9 11h6M9 15h4" />
                    </svg>
                    {p.taskCount}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {p.memberCount}
                  </span>
                </div>
                <span className="text-slate-400 dark:text-slate-500">{formatDate(p.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
