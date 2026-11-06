import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import type { Role } from '@ibo/shared';
import { db } from '../db/client';
import { users } from '../db/schema';
import { AUTH_COOKIE, verifyToken } from '../lib/auth-tokens';
import { forbidden, unauthorized } from '../lib/errors';

// Reads the session cookie and loads the user from the database on every request.
// Loading from the DB (instead of trusting the token alone) means a deleted user
// or a changed role takes effect immediately.
async function loadUser(req: Request) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return undefined;
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return undefined;
  }
  const [user] = await db
    .select({ id: users.id, role: users.role, fullName: users.fullName, email: users.email })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);
  return user;
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.user = await loadUser(req);
  next();
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const user = await loadUser(req);
  if (!user) throw unauthorized();
  req.user = user;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

export const requireAdmin = [requireAuth, requireRole('Admin')];
