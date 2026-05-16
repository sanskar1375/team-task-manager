import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
router.use(requireAuth);

router.get('/me', async (req, res) => {
  const userId = req.user!.id;

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true } },
          tasks: { select: { status: true } },
        },
      },
    },
  });

  const projectsProgress = memberships.map((m) => {
    const total = m.project._count.tasks;
    const done = m.project.tasks.filter((t) => t.status === 'DONE').length;
    return {
      projectId: m.project.id,
      name: m.project.name,
      total,
      done,
      pctDone: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  const myTasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      status: { not: 'DONE' },
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, email: true, name: true } },
    },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  const statusCountsRaw = await prisma.task.groupBy({
    by: ['status'],
    where: { project: { memberships: { some: { userId } } } },
    _count: { _all: true },
  });
  const statusCounts: Record<'TODO' | 'IN_PROGRESS' | 'DONE', number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  for (const row of statusCountsRaw) {
    statusCounts[row.status] = row._count._all;
  }

  const now = new Date();
  const overdue = myTasks.filter((t) => t.dueDate !== null && t.dueDate < now);

  res.json({ myTasks, statusCounts, overdue, projectsProgress });
});

export default router;
