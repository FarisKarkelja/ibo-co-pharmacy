import type { Role } from '@ibo/shared';

declare global {
  namespace Express {
    interface Request {
      user?: { id: number; role: Role; fullName: string; email: string };
    }
  }
}

export {};
