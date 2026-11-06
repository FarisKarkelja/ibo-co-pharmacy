import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import type { OrderStatus, PickupLocation } from '@ibo/shared';
import { db, type DbExecutor } from '../../db/client';
import { orderItems, orders, users } from '../../db/schema';

// Aggregates are correlated subqueries instead of GROUP BY, which keeps the
// query valid under MySQL's ONLY_FULL_GROUP_BY mode as well as on MariaDB.
const itemCount = sql<number>`(SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = orders.id)`.mapWith(
  Number,
);
const subtotal = sql<number>`(SELECT COALESCE(SUM(oi.quantity * oi.unit_price), 0) FROM order_items oi WHERE oi.order_id = orders.id)`.mapWith(
  Number,
);

const summaryColumns = {
  id: orders.id,
  userId: orders.userId,
  customerName: users.fullName,
  customerEmail: users.email,
  customerPhone: users.phone,
  pickupLocation: orders.pickupLocation,
  status: orders.status,
  createdAt: orders.createdAt,
  itemCount,
  subtotal,
};

export const ordersRepository = {
  listSummaries(where?: SQL) {
    return db
      .select(summaryColumns)
      .from(orders)
      .innerJoin(users, eq(orders.userId, users.id))
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id));
  },

  async findSummary(where: SQL) {
    const [row] = await db.select(summaryColumns).from(orders).innerJoin(users, eq(orders.userId, users.id)).where(where);
    return row;
  },

  listItems(orderId: number) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.id));
  },

  async create(
    executor: DbExecutor,
    order: { userId: number; pickupLocation: PickupLocation },
    items: { productId: number; productName: string; categoryName: string; quantity: number; unitPrice: number }[],
  ) {
    const [{ id }] = await executor.insert(orders).values(order).$returningId();
    await executor.insert(orderItems).values(items.map((i) => ({ ...i, orderId: id })));
    return id;
  },

  async updateStatus(id: number, status: OrderStatus) {
    await db.update(orders).set({ status }).where(eq(orders.id, id));
  },

  async delete(id: number) {
    await db.delete(orders).where(eq(orders.id, id));
  },

  byId: (id: number) => eq(orders.id, id),
  byUser: (userId: number) => eq(orders.userId, userId),
  byUserAndId: (userId: number, id: number) => and(eq(orders.userId, userId), eq(orders.id, id))!,
  byStatus: (status: OrderStatus) => eq(orders.status, status),
};
