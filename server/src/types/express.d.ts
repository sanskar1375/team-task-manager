import type { Role } from '@prisma/client';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
      projectRole?: Role;
      projectId?: string;
    }
  }
}
