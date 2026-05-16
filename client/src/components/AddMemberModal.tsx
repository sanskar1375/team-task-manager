import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from './Modal';
import { Input, Select } from './Field';
import { Spinner } from './Spinner';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import { getErrorMessage, getFieldErrors } from '../lib/format';
import type { Member, Role } from '../types/api';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddMemberModal({ open, onClose, projectId }: AddMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('MEMBER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const qc = useQueryClient();
  const toast = useToast();

  const mut = useMutation({
    mutationFn: (body: { email: string; role: Role }) =>
      api.post<Member>(`/projects/${projectId}/members`, body),
    onSuccess: () => {
      toast.success('Member added');
      qc.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      setEmail('');
      setRole('MEMBER');
      setErrors({});
      onClose();
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
    mut.mutate({ email: email.trim(), role });
  }

  return (
    <Modal
      open={open}
      onClose={mut.isPending ? () => {} : onClose}
      title="Add a team member"
      description="Add an existing user by their email address."
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
            form="add-member-form"
            disabled={mut.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-60"
          >
            {mut.isPending && <Spinner size="sm" />}
            Add member
          </button>
        </>
      }
    >
      <form id="add-member-form" onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="teammate@company.com"
        />
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          error={errors.role}
          hint="Admins can manage the project, team, and tasks. Members can create tasks and update their own."
        >
          <option value="MEMBER">Member</option>
          <option value="ADMIN">Admin</option>
        </Select>
      </form>
    </Modal>
  );
}
