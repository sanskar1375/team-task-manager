import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { requireAuth } from '../middleware/requireAuth';
import { requireProjectRole } from '../middleware/requireProjectRole';
import { AppError } from '../lib/errors';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas/project';
import { AddMemberSchema, UpdateMemberRoleSchema } from '../schemas/member';
import { CreateTaskSchema, ListTaskQuerySchema } from '../schemas/task';

const router = Router();
router.use(requireAuth);

router.post('/', async (req, res) => {
  const { name, description } = CreateProjectSchema.parse(req.body);
  const project = await prisma.project.create({
    data: {
      name,
      description,
      memberships: {
        create: { userId: req.user!.id, role: 'ADMIN' },
      },
    },
  });
  res.status(201).json({ ...project, myRole: 'ADMIN' as const, _count: { tasks: 0, memberships: 1 } });
});

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId: req.user!.id } } },
    include: {
      memberships: {
        where: { userId: req.user!.id },
        select: { role: true },
      },
      _count: { select: { tasks: true, memberships: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
      myRole: p.memberships[0]?.role,
      taskCount: p._count.tasks,
      memberCount: p._count.memberships,
    }))
  );
});

router.get('/:id', requireProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.projectId },
    include: { _count: { select: { tasks: true, memberships: true } } },
  });
  if (!project) throw new AppError('NOT_FOUND', 'Project not found');
  res.json({ ...project, myRole: req.projectRole });
});

router.patch('/:id', requireProjectRole('ADMIN'), async (req, res) => {
  const data = UpdateProjectSchema.parse(req.body);
  const project = await prisma.project.update({
    where: { id: req.projectId },
    data,
  });
  res.json({ ...project, myRole: req.projectRole });
});

router.delete('/:id', requireProjectRole('ADMIN'), async (req, res) => {
  await prisma.project.delete({ where: { id: req.projectId } });
  res.status(204).end();
});

router.get('/:id/members', requireProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  const members = await prisma.membership.findMany({
    where: { projectId: req.projectId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  res.json(
    members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
    }))
  );
});

router.post('/:id/members', requireProjectRole('ADMIN'), async (req, res) => {
  const { email, role } = AddMemberSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'No user with that email');
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_projectId: { userId: user.id, projectId: req.projectId! } },
  });
  if (existing) {
    throw new AppError('CONFLICT', 'User is already a member of this project');
  }

  const membership = await prisma.membership.create({
    data: { userId: user.id, projectId: req.projectId!, role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  res.status(201).json({
    id: membership.id,
    role: membership.role,
    joinedAt: membership.joinedAt,
    user: membership.user,
  });
});

router.patch('/:id/members/:userId', requireProjectRole('ADMIN'), async (req, res) => {
  const { role } = UpdateMemberRoleSchema.parse(req.body);
  const { userId } = req.params;

  const target = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId: req.projectId! } },
  });
  if (!target) throw new AppError('NOT_FOUND', 'Membership not found');

  if (target.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = await prisma.membership.count({
      where: { projectId: req.projectId, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new AppError('CONFLICT', 'Cannot demote the last admin of a project');
    }
  }

  const updated = await prisma.membership.update({
    where: { userId_projectId: { userId, projectId: req.projectId! } },
    data: { role },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  res.json({
    id: updated.id,
    role: updated.role,
    joinedAt: updated.joinedAt,
    user: updated.user,
  });
});

router.delete('/:id/members/:userId', requireProjectRole('ADMIN'), async (req, res) => {
  const { userId } = req.params;

  const target = await prisma.membership.findUnique({
    where: { userId_projectId: { userId, projectId: req.projectId! } },
  });
  if (!target) throw new AppError('NOT_FOUND', 'Membership not found');

  if (target.role === 'ADMIN') {
    const adminCount = await prisma.membership.count({
      where: { projectId: req.projectId, role: 'ADMIN' },
    });
    if (adminCount <= 1) {
      throw new AppError('CONFLICT', 'Cannot remove the last admin of a project');
    }
  }

  await prisma.membership.delete({
    where: { userId_projectId: { userId, projectId: req.projectId! } },
  });

  res.status(204).end();
});

router.post('/:id/tasks', requireProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  const { title, description, assigneeId, priority, dueDate } = CreateTaskSchema.parse(req.body);

  if (assigneeId) {
    const member = await prisma.membership.findUnique({
      where: { userId_projectId: { userId: assigneeId, projectId: req.projectId! } },
    });
    if (!member) {
      throw new AppError('VALIDATION_ERROR', 'Assignee must be a member of this project');
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      assigneeId: assigneeId ?? null,
      priority: priority ?? 'MEDIUM',
      dueDate: dueDate ?? null,
      projectId: req.projectId!,
    },
    include: { assignee: { select: { id: true, email: true, name: true } } },
  });

  res.status(201).json(task);
});

router.get('/:id/tasks', requireProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  const { status, assigneeId, overdue } = ListTaskQuerySchema.parse(req.query);

  const where: Prisma.TaskWhereInput = { projectId: req.projectId };
  if (status) where.status = status;
  if (assigneeId) where.assigneeId = assigneeId;
  if (overdue) {
    where.dueDate = { lt: new Date() };
    if (!status) where.status = { not: 'DONE' };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: { assignee: { select: { id: true, email: true, name: true } } },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  });

  res.json(tasks);
});

export default router;
