import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Modal } from './Modal';
import { Input, Textarea } from './Field';
import { Spinner } from './Spinner';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import type { Project } from '../types/api';
import { getErrorMessage, getFieldErrors } from '../lib/format';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setErrors({});
    }
  }, [open]);

  const mut = useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post<Project>('/projects', body),
    onSuccess: (data) => {
      toast.success('Project created');
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
      navigate(`/projects/${data.id}`);
    },
    onError: (err) => {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    mut.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  return (
    <Modal
      open={open}
      onClose={mut.isPending ? () => {} : onClose}
      title="Create a new project"
      description="You'll automatically be added as the project admin."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={mut.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-project-form"
            disabled={mut.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-60"
          >
            {mut.isPending && <Spinner size="sm" />}
            Create project
          </button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project name"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          maxLength={100}
          placeholder="e.g. Q3 Marketing Site"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          hint="Optional. Help your team know what this project is about."
          maxLength={1000}
          rows={3}
        />
      </form>
    </Modal>
  );
}
