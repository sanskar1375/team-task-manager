import jwt from 'jsonwebtoken';
import { env } from './env';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

const EXPIRES_IN = '7d';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token payload');
  }
  const { sub, email, name } = decoded as Record<string, unknown>;
  if (typeof sub !== 'string' || typeof email !== 'string' || typeof name !== 'string') {
    throw new Error('Invalid token payload shape');
  }
  return { sub, email, name };
}
