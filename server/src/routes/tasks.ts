import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/requireAuth';
import { loadProjectRole } from '../middleware/requireProjectRole';
import { AppError } from '../lib/errors';
import { UpdateTaskSchema } from '../schemas/task';

const router = Router();
router.use(requireAuth);

router.get('/:id', async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: { assignee: { select: { id: true, email: true, name: true } } },
  });
  if (!task) throw new AppError('NOT_FOUND', 'Task not found');

  await loadProjectRole(req.user!.id, task.projectId);

  res.json(task);
});

router.patch('/:id', async (req, res) => {
  const update = UpdateTaskSchema.parse(req.body);

  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) throw new AppError('NOT_FOUND', 'Task not found');

  const role = await loadProjectRole(req.user!.id, task.projectId);

  const keys = Object.keys(update);
  const isStatusOnly = keys.length === 1 && keys[0] === 'status';

  if (isStatusOnly) {
    const isAssignee = task.assigneeId === req.user!.id;
    if (role !== 'ADMIN' && !isAssignee) {
      throw new AppError('FORBIDDEN', 'Only an admin or the assignee may change task status');
    }
  } else {
    if (role !== 'ADMIN') {
      throw new AppError('FORBIDDEN', 'Only an admin may edit task fields');
    }
    if (update.assigneeId) {
      const member = await prisma.membership.findUnique({
        where: {
          userId_projectId: { userId: update.assigneeId, projectId: task.projectId },
        },
      });
      if (!member) {
        throw new AppError('VALIDATION_ERROR', 'Assignee must be a member of this project');
      }
    }
  }

  const updated = await prisma.task.update({
    where: { id: task.id },
    data: update,
    include: { assignee: { select: { id: true, email: true, name: true } } },
  });

  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const task = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!task) throw new AppError('NOT_FOUND', 'Task not found');

  const role = await loadProjectRole(req.user!.id, task.projectId);
  if (role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Only an admin may delete tasks');
  }

  await prisma.task.delete({ where: { id: task.id } });
  res.status(204).end();
});

export default router;
