import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Member, Priority, Status, Task, Role } from '../types/api';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { Modal } from './Modal';
import { Input, Textarea, Select } from './Field';
import { Spinner } from './Spinner';
import { ConfirmDialog } from './ConfirmDialog';
import { formatDateInput, getErrorMessage, getFieldErrors } from '../lib/format';

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task: Task | null;
  members: Member[];
  myRole: Role;
  currentUserId: string;
}

interface FormState {
  title: string;
  description: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  dueDate: string;
}

function initialForm(task: Task | null): FormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    assigneeId: task?.assigneeId ?? '',
    priority: task?.priority ?? 'MEDIUM',
    status: task?.status ?? 'TODO',
    dueDate: formatDateInput(task?.dueDate ?? null),
  };
}

export function TaskModal({
  open,
  onClose,
  projectId,
  task,
  members,
  myRole,
  currentUserId,
}: TaskModalProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<FormState>(() => initialForm(task));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialForm(task));
      setErrors({});
    }
  }, [open, task]);

  const isCreate = task === null;
  const isAdmin = myRole === 'ADMIN';
  const isAssignee = task?.assigneeId === currentUserId;
  const canEditFields = isAdmin;
  const canChangeStatus = isAdmin || isAssignee;
  const readonly = !isCreate && !canEditFields && !canChangeStatus;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', projectId, 'tasks'] });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
    qc.invalidateQueries({ queryKey: ['projects'] });
  };

  const createMut = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post<Task>(`/projects/${projectId}/tasks`, payload),
    onSuccess: () => {
      toast.success('Task created');
      invalidate();
      onClose();
    },
    onError: (err) => {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.patch<Task>(`/tasks/${task!.id}`, payload),
    onSuccess: () => {
      toast.success('Task updated');
      invalidate();
      onClose();
    },
    onError: (err) => {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => api.delete<void>(`/tasks/${task!.id}`),
    onSuccess: () => {
      toast.success('Task deleted');
      invalidate();
      setConfirmDelete(false);
      onClose();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setConfirmDelete(false);
    },
  });

  const submitting = createMut.isPending || updateMut.isPending;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    if (isCreate) {
      createMut.mutate({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        assigneeId: form.assigneeId || null,
        priority: form.priority,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      });
      return;
    }

    if (!canEditFields && canChangeStatus) {
      if (form.status !== task!.status) {
        updateMut.mutate({ status: form.status });
      } else {
        onClose();
      }
      return;
    }

    const payload: Record<string, unknown> = {};
    if (form.title.trim() !== task!.title) payload.title = form.title.trim();
    const trimmedDesc = form.description.trim();
    const originalDesc = task!.description ?? '';
    if (trimmedDesc !== originalDesc) payload.description = trimmedDesc || null;
    if ((form.assigneeId || null) !== task!.assigneeId) {
      payload.assigneeId = form.assigneeId || null;
    }
    if (form.priority !== task!.priority) payload.priority = form.priority;
    if (form.status !== task!.status) payload.status = form.status;
    const newDueIso = form.dueDate ? new Date(form.dueDate).toISOString() : null;
    const oldDueIso = task!.dueDate ?? null;
    if (newDueIso !== oldDueIso) payload.dueDate = newDueIso;

    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    updateMut.mutate(payload);
  }

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <Modal
        open={open}
        onClose={submitting ? () => {} : onClose}
        title={isCreate ? 'Create task' : readonly ? 'Task details' : 'Edit task'}
        size="lg"
        footer={
          <>
            {!isCreate && isAdmin && (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={submitting || deleteMut.isPending}
                className="mr-auto inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-60"
              >
                Delete task
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {readonly ? 'Close' : 'Cancel'}
            </button>
            {!readonly && (
              <button
                type="submit"
                form="task-form"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-60"
              >
                {submitting && <Spinner size="sm" />}
                {isCreate ? 'Create' : 'Save changes'}
              </button>
            )}
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            disabled={!canEditFields && !isCreate}
            error={errors.title}
            maxLength={120}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            disabled={!canEditFields && !isCreate}
            error={errors.description}
            rows={4}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Assignee"
              value={form.assigneeId}
              onChange={(e) => update('assigneeId', e.target.value)}
              disabled={!canEditFields && !isCreate}
              error={errors.assigneeId}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </Select>
            <Select
              label="Priority"
              value={form.priority}
              onChange={(e) => update('priority', e.target.value as Priority)}
              disabled={!canEditFields && !isCreate}
              error={errors.priority}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </Select>
            {!isCreate && (
              <Select
                label="Status"
                value={form.status}
                onChange={(e) => update('status', e.target.value as Status)}
                disabled={!canChangeStatus}
                error={errors.status}
                hint={!canChangeStatus ? 'Only admins or the assignee can change status.' : undefined}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Select>
            )}
            <Input
              label="Due date"
              type="date"
              value={form.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              disabled={!canEditFields && !isCreate}
              error={errors.dueDate}
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this task?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
