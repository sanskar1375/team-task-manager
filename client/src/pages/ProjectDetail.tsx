import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "../components/Spinner";
import { TaskCard } from "../components/TaskCard";
import { TaskModal } from "../components/TaskModal";
import { MemberList } from "../components/MemberList";
import { AddMemberModal } from "../components/AddMemberModal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { RoleBadge } from "../components/Badge";
import { useAuth } from "../lib/auth";
import { api, ApiError } from "../lib/api";
import { useToast } from "../lib/toast";
import { formatDate } from "../lib/format";
import type { Project, Task, Member, Status } from "../types/api";

const COLUMNS: { key: Status; label: string; dot: string }[] = [
  { key: "TODO", label: "To Do", dot: "bg-slate-400 dark:bg-slate-500" },
  { key: "IN_PROGRESS", label: "In Progress", dot: "bg-amber-500" },
  { key: "DONE", label: "Done", dot: "bg-emerald-500" },
];

export function ProjectDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();

  const [memberOpen, setMemberOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["project", id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });

  const tasksQuery = useQuery({
    queryKey: ["project", id, "tasks"],
    queryFn: () => api.get<Task[]>(`/projects/${id}/tasks`),
    enabled: !!id,
  });

  const membersQuery = useQuery({
    queryKey: ["project", id, "members"],
    queryFn: () => api.get<Member[]>(`/projects/${id}/members`),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete<void>(`/projects/${id}`),
    onSuccess: () => {
      toast.success("Project deleted");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      navigate("/projects", { replace: true });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Could not delete project");
    },
  });

  if (projectQuery.isLoading || tasksQuery.isLoading || membersQuery.isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return <EmptyState title="Project not found" description="It may have been deleted, or you no longer have access." />;
  }

  const project = projectQuery.data;
  const tasks = tasksQuery.data ?? [];
  const members = membersQuery.data ?? [];
  const isAdmin = project.myRole === "ADMIN";

  const tasksByStatus = (s: Status) => tasks.filter((t) => t.status === s);

  const openCreateTask = () => {
    setSelectedTask(null);
    setTaskOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskOpen(true);
  };

  return (
    <>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <RoleBadge role={project.myRole} />
              <span className="text-xs text-slate-400 dark:text-slate-500">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Created {formatDate(project.createdAt)}
              </span>
            </div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{project.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {project.description || "No description yet."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  {project._count.tasks}
                </strong>{" "}
                task{project._count.tasks === 1 ? "" : "s"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span>
                <strong className="font-semibold text-slate-900 dark:text-slate-100">
                  {project._count.memberships}
                </strong>{" "}
                member{project._count.memberships === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openCreateTask}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New task
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => setMemberOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6M22 11h-6" />
                  </svg>
                  Manage team
                </button>
                <button
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  aria-label="Delete project"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const list = tasksByStatus(col.key);
              return (
                <div
                  key={col.key}
                  className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900/30"
                >
                  <div className="mb-3 flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                      <span className="text-[13px] font-semibold tracking-tight">{col.label}</span>
                    </div>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {list.length}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2 min-h-[8rem]">
                    {list.length === 0 ? (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs text-slate-400 dark:border-slate-700/60 dark:text-slate-500">
                        No tasks
                      </div>
                    ) : (
                      list.map((task) => <TaskCard key={task.id} task={task} onClick={() => openEditTask(task)} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold tracking-tight">Team</h3>
              {isAdmin && (
                <button
                  onClick={() => setMemberOpen(true)}
                  className="text-xs font-semibold text-slate-700 hover:underline dark:text-slate-300"
                >
                  + Invite
                </button>
              )}
            </div>
            <MemberList
              members={members}
              projectId={id}
              isAdmin={isAdmin}
              currentUserId={user?.id ?? ""}
            />
          </div>
        </aside>
      </div>

      <TaskModal
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        projectId={id}
        task={selectedTask}
        members={members}
        myRole={project.myRole}
        currentUserId={user?.id ?? ""}
      />

      <AddMemberModal open={memberOpen} onClose={() => setMemberOpen(false)} projectId={id} />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete project?"
        message={`This permanently removes "${project.name}" and all its tasks. This cannot be undone.`}
        confirmLabel="Delete project"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
