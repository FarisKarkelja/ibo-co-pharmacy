import { count, desc, eq, sql } from 'drizzle-orm';
import type { Role, User } from '@ibo/shared';
import { db } from '../../db/client';
import { users } from '../../db/schema';

type UserRow = typeof users.$inferSelect;

export const toUser = (row: UserRow): User => ({
  id: row.id,
  fullName: row.fullName,
  email: row.email,
  phone: row.phone,
  role: row.role,
  createdAt: row.createdAt.toISOString(),
});

export const usersRepository = {
  async findById(id: number) {
    const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return row;
  },

  async findByEmail(email: string) {
    const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return row;
  },

  async create(data: { fullName: string; email: string; phone: string; passwordHash: string; role?: Role }) {
    const [{ id }] = await db.insert(users).values(data).$returningId();
    return (await this.findById(id))!;
  },

  async update(id: number, data: Partial<Pick<UserRow, 'fullName' | 'phone' | 'passwordHash' | 'role'>>) {
    await db.update(users).set(data).where(eq(users.id, id));
    return this.findById(id);
  },

  async delete(id: number) {
    await db.delete(users).where(eq(users.id, id));
  },

  async listWithOrderCount() {
    return db
      .select({
        user: users,
        orderCount: sql<number>`(SELECT COUNT(*) FROM orders o WHERE o.user_id = users.id)`.mapWith(Number),
      })
      .from(users)
      .orderBy(desc(users.createdAt), desc(users.id));
  },

  async countAll() {
    const [row] = await db.select({ value: count() }).from(users);
    return row.value;
  },

  async countAdmins() {
    const [row] = await db.select({ value: count() }).from(users).where(eq(users.role, 'Admin'));
    return row.value;
  },
};
