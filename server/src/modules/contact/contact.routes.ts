import { Router, type Request, type Response } from 'express';
import { desc, eq } from 'drizzle-orm';
import { contactSchema, type ContactMessage } from '@ibo/shared';
import { db } from '../../db/client';
import { contactMessages } from '../../db/schema';
import { notFound } from '../../lib/errors';
import { idParam } from '../../lib/http';
import { parse } from '../../lib/validate';
import { requireAdmin } from '../../middleware/auth';
import { contactLimiter } from '../../middleware/rate-limit';

// Small module, so the data access lives next to the handlers.
// (The contact form in v1 had no backend; messages now land in the admin panel.)

const toMessage = (r: typeof contactMessages.$inferSelect): ContactMessage => ({ ...r, createdAt: r.createdAt.toISOString() });

async function findOrThrow(id: number) {
  const [row] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
  if (!row) throw notFound('Poruka ne postoji.');
  return row;
}

export const contactRouter = Router();

contactRouter.post('/', contactLimiter, async (req: Request, res: Response) => {
  const input = parse(contactSchema, req.body);
  await db.insert(contactMessages).values(input);
  res.status(201).json({ message: 'Hvala! Vaša poruka je poslana, javit ćemo vam se uskoro.' });
});

contactRouter.get('/', requireAdmin, async (_req: Request, res: Response) => {
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt), desc(contactMessages.id));
  res.json(rows.map(toMessage));
});

contactRouter.patch('/:id/read', requireAdmin, async (req: Request, res: Response) => {
  const id = idParam(req);
  await findOrThrow(id);
  const isRead = req.body?.isRead !== false;
  await db.update(contactMessages).set({ isRead }).where(eq(contactMessages.id, id));
  res.json(toMessage(await findOrThrow(id)));
});

contactRouter.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = idParam(req);
  await findOrThrow(id);
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  res.status(204).end();
});
