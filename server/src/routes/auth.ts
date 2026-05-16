import { Router } from 'express';
import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from '../lib/hash';
import { signToken } from '../lib/jwt';
import { AppError } from '../lib/errors';
import { SignupSchema, LoginSchema } from '../schemas/auth';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = SignupSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('CONFLICT', 'Email already registered');
  }

  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hash },
    select: { id: true, email: true, name: true },
  });

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.status(201).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = LoginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, password: true },
  });
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password');
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
