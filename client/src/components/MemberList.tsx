import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useToast } from '../lib/toast';
import type { Member, Role } from '../types/api';
import { RoleBadge } from './Badge';
import { Spinner } from './Spinner';
import { ConfirmDialog } from './ConfirmDialog';
import { cn, formatDate, getErrorMessage, initials } from '../lib/format';

interface MemberListProps {
  members: Member[];
  projectId: string;
  isAdmin: boolean;
  currentUserId: string;
}

export function MemberList({ members, projectId, isAdmin, currentUserId }: MemberListProps) {
  const qc = useQueryClient();
  const toast = useToast();
  const [confirmRemove, setConfirmRemove] = useState<Member | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['project', projectId, 'members'] });
    qc.invalidateQueries({ queryKey: ['project', projectId] });
  };

  const removeMut = useMutation({
    mutationFn: (userId: string) =>
      api.delete<void>(`/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      toast.success('Member removed');
      setConfirmRemove(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setConfirmRemove(null);
    },
  });

  const roleMut = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api.patch<Member>(`/projects/${projectId}/members/${userId}`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      invalidate();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  return (
    <>
      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {members.map((m) => {
          const isSelf = m.user.id === currentUserId;
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {initials(m.user.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {m.user.name}
                    {isSelf && <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">(you)</span>}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.user.email}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Joined {formatDate(m.joinedAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isAdmin && !isSelf ? (
                  <select
                    value={m.role}
                    onChange={(e) =>
                      roleMut.mutate({ userId: m.user.id, role: e.target.value as Role })
                    }
                    disabled={roleMut.isPending}
                    className={cn(
                      'text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30',
                      roleMut.isPending && 'opacity-60'
                    )}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </select>
                ) : (
                  <RoleBadge role={m.role} />
                )}
                {isAdmin && !isSelf && (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(m)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {roleMut.isPending && (
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <Spinner size="sm" />
          Updating role…
        </div>
      )}

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Remove this member?"
        message={
          confirmRemove
            ? `${confirmRemove.user.name} will lose access to this project.`
            : ''
        }
        confirmLabel="Remove"
        danger
        loading={removeMut.isPending}
        onConfirm={() => confirmRemove && removeMut.mutate(confirmRemove.user.id)}
        onCancel={() => setConfirmRemove(null)}
      />
    </>
  );
}
