import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt';
import { AppError } from '../lib/errors';
import { prisma } from '../prisma';

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 'Missing or invalid Authorization header'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'Empty bearer token'));
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(new AppError('UNAUTHORIZED', 'Invalid or expired token'));
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return next(new AppError('UNAUTHORIZED', 'User no longer exists'));
  }

  req.user = user;
  return next();
}
