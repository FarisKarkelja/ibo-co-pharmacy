import type { Request } from 'express';
import { notFound, unauthorized } from './errors';

/** The signed-in user, guaranteed by the requireAuth middleware. */
export function currentUser(req: Request) {
  if (!req.user) throw unauthorized();
  return req.user;
}

/** Numeric :id route parameter; anything else is treated as a missing resource. */
export function idParam(req: Request) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw notFound();
  return id;
}
