import type { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../lib/errors';

export async function loadProjectRole(userId: string, projectId: string): Promise<Role> {
  const membership = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId } },
    select: { role: true },
  });
  if (!membership) {
    // Non-members get 404 (not 403) so they can't probe project existence.
    throw new AppError('NOT_FOUND', 'Project not found');
  }
  return membership.role;
}

export function requireProjectRole(required: Role | Role[]) {
  const allowed = Array.isArray(required) ? required : [required];

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('UNAUTHORIZED', 'Authentication required'));
    }

    const projectId = req.params.id;
    if (!projectId) {
      return next(new AppError('VALIDATION_ERROR', 'Project id required in URL'));
    }

    try {
      const role = await loadProjectRole(req.user.id, projectId);
      if (!allowed.includes(role)) {
        return next(new AppError('FORBIDDEN', 'Insufficient permissions for this project'));
      }
      req.projectRole = role;
      req.projectId = projectId;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
