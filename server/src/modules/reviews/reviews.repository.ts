import { avg, count, desc, eq, sql } from 'drizzle-orm';
import type { Review, ReviewLocation } from '@ibo/shared';
import { db } from '../../db/client';
import { reviews, users } from '../../db/schema';

const columns = {
  id: reviews.id,
  userId: reviews.userId,
  authorName: users.fullName,
  location: reviews.location,
  rating: reviews.rating,
  comment: reviews.comment,
  createdAt: reviews.createdAt,
};

const baseQuery = () => db.select(columns).from(reviews).innerJoin(users, eq(reviews.userId, users.id));
type Row = Awaited<ReturnType<typeof baseQuery>>[number];
const toReview = (r: Row): Review => ({ ...r, createdAt: r.createdAt.toISOString() });

export const reviewsRepository = {
  async list(limit: number, location?: ReviewLocation) {
    const rows = await baseQuery()
      .where(location ? eq(reviews.location, location) : undefined)
      .orderBy(desc(reviews.createdAt), desc(reviews.id))
      .limit(limit);
    return rows.map(toReview);
  },

  async findById(id: number) {
    const [row] = await baseQuery().where(eq(reviews.id, id));
    return row ? toReview(row) : undefined;
  },

  async create(data: typeof reviews.$inferInsert) {
    const [{ id }] = await db.insert(reviews).values(data).$returningId();
    return (await this.findById(id))!;
  },

  async update(id: number, data: Partial<Pick<typeof reviews.$inferInsert, 'comment' | 'rating'>>) {
    await db.update(reviews).set(data).where(eq(reviews.id, id));
    return (await this.findById(id))!;
  },

  async delete(id: number) {
    await db.delete(reviews).where(eq(reviews.id, id));
  },

  async summary() {
    const [totals] = await db.select({ average: avg(reviews.rating), count: count() }).from(reviews);
    const dist = await db
      .select({ rating: reviews.rating, count: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(reviews)
      .groupBy(reviews.rating);
    return { average: Number(totals.average ?? 0), count: totals.count, dist };
  },
};
