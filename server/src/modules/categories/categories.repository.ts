import { asc, count, eq, sql } from 'drizzle-orm';
import type { Category } from '@ibo/shared';
import { db } from '../../db/client';
import { categories, products } from '../../db/schema';

type CategoryRow = typeof categories.$inferSelect;

// Correlated subquery written with explicit table names: drizzle leaves columns
// unqualified in single-table selects, which would make "id" ambiguous here.
const productCount = sql<number>`(SELECT COUNT(*) FROM products p WHERE p.category_id = categories.id)`.mapWith(Number);

const toCategory = (row: CategoryRow, count: number): Category => ({ ...row, productCount: count });

export const categoriesRepository = {
  async list() {
    const rows = await db.select({ c: categories, productCount }).from(categories).orderBy(asc(categories.id));
    return rows.map((r) => toCategory(r.c, r.productCount));
  },

  async findById(id: number) {
    const [row] = await db.select({ c: categories, productCount }).from(categories).where(eq(categories.id, id));
    return row ? toCategory(row.c, row.productCount) : undefined;
  },

  async create(data: { name: string; description: string; imageUrl: string | null }) {
    const [{ id }] = await db.insert(categories).values(data).$returningId();
    return (await this.findById(id))!;
  },

  async update(id: number, data: Partial<Omit<CategoryRow, 'id'>>) {
    await db.update(categories).set(data).where(eq(categories.id, id));
    return this.findById(id);
  },

  async delete(id: number) {
    await db.delete(categories).where(eq(categories.id, id));
  },

  async countProducts(id: number) {
    const [row] = await db.select({ value: count() }).from(products).where(eq(products.categoryId, id));
    return row.value;
  },
};
