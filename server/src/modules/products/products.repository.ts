import { and, asc, count, desc, eq, like, type SQL } from 'drizzle-orm';
import type { Product, ProductSort } from '@ibo/shared';
import { db } from '../../db/client';
import { categories, products } from '../../db/schema';

const columns = {
  id: products.id,
  name: products.name,
  description: products.description,
  price: products.price,
  isPrescriptionRequired: products.isPrescriptionRequired,
  isFeatured: products.isFeatured,
  imageUrl: products.imageUrl,
  categoryId: products.categoryId,
  categoryName: categories.name,
  createdAt: products.createdAt,
};

const baseQuery = () => db.select(columns).from(products).innerJoin(categories, eq(products.categoryId, categories.id));
type Row = Awaited<ReturnType<typeof baseQuery>>[number];

const toProduct = (r: Row): Product => ({ ...r, price: Number(r.price), createdAt: r.createdAt.toISOString() });

const orderBy: Record<ProductSort, SQL[]> = {
  newest: [desc(products.createdAt), desc(products.id)],
  'name-asc': [asc(products.name)],
  'name-desc': [desc(products.name)],
  'price-asc': [asc(products.price), asc(products.name)],
  'price-desc': [desc(products.price), asc(products.name)],
};

export interface ProductFilters {
  categoryId?: number;
  search?: string;
  featured?: boolean;
  prescription?: boolean;
}

function where(f: ProductFilters) {
  const conditions: SQL[] = [];
  if (f.categoryId) conditions.push(eq(products.categoryId, f.categoryId));
  // LIKE wildcards in user input are escaped so "%" searches for a literal percent sign
  if (f.search) conditions.push(like(products.name, `%${f.search.replace(/[\\%_]/g, '\\$&')}%`));
  if (f.featured !== undefined) conditions.push(eq(products.isFeatured, f.featured));
  if (f.prescription !== undefined) conditions.push(eq(products.isPrescriptionRequired, f.prescription));
  return conditions.length ? and(...conditions) : undefined;
}

export const productsRepository = {
  async list(filters: ProductFilters, sort: ProductSort, page: number, pageSize: number) {
    const condition = where(filters);
    const [rows, [{ total }]] = await Promise.all([
      baseQuery()
        .where(condition)
        .orderBy(...orderBy[sort])
        .limit(pageSize)
        .offset((page - 1) * pageSize),
      db.select({ total: count() }).from(products).where(condition),
    ]);
    return { items: rows.map(toProduct), total };
  },

  async findById(id: number) {
    const [row] = await baseQuery().where(eq(products.id, id));
    return row ? toProduct(row) : undefined;
  },

  async create(data: typeof products.$inferInsert) {
    const [{ id }] = await db.insert(products).values(data).$returningId();
    return (await this.findById(id))!;
  },

  async update(id: number, data: Partial<typeof products.$inferInsert>) {
    await db.update(products).set(data).where(eq(products.id, id));
    return this.findById(id);
  },

  async delete(id: number) {
    await db.delete(products).where(eq(products.id, id));
  },

  async countAll() {
    const [row] = await db.select({ value: count() }).from(products);
    return row.value;
  },
};
