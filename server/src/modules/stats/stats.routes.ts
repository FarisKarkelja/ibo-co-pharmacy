import { Router, type Request, type Response } from 'express';
import { count, eq, ne, sql } from 'drizzle-orm';
import { type CategoryRevenue, type DailyOrders, ORDER_STATUSES, type OrdersByStatus, type StatsOverview } from '@ibo/shared';
import { db } from '../../db/client';
import { contactMessages, orderItems, orders } from '../../db/schema';
import { requireAdmin } from '../../middleware/auth';
import { productsRepository } from '../products/products.repository';
import { reviewsService } from '../reviews/reviews.service';
import { usersRepository } from '../users/users.repository';

// Dashboard statistics. Revenue ignores cancelled orders and is shown without VAT.

const lineTotal = sql`${orderItems.quantity} * ${orderItems.unitPrice}`;
const round2 = (n: unknown) => Math.round(Number(n ?? 0) * 100) / 100;

export const statsRouter = Router();
statsRouter.use(requireAdmin);

statsRouter.get('/overview', async (_req: Request, res: Response) => {
  const [[orderTotals], [active], [revenue], totalUsers, totalProducts, reviewSummary, [unread]] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(orders).where(eq(orders.status, 'Active')),
    db
      .select({ value: sql<string>`COALESCE(SUM(${lineTotal}), 0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(ne(orders.status, 'Cancelled')),
    usersRepository.countAll(),
    productsRepository.countAll(),
    reviewsService.summary(),
    db.select({ value: count() }).from(contactMessages).where(eq(contactMessages.isRead, false)),
  ]);
  const body: StatsOverview = {
    totalOrders: orderTotals.value,
    activeOrders: active.value,
    totalRevenue: round2(revenue.value),
    totalUsers,
    totalProducts,
    averageRating: reviewSummary.average,
    unreadMessages: unread.value,
  };
  res.json(body);
});

statsRouter.get('/revenue-by-category', async (_req: Request, res: Response) => {
  const rows = await db
    .select({ category: orderItems.categoryName, revenue: sql<string>`SUM(${lineTotal})` })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(ne(orders.status, 'Cancelled'))
    .groupBy(orderItems.categoryName)
    .orderBy(sql`SUM(${lineTotal}) DESC`);
  const body: CategoryRevenue[] = rows.map((r) => ({ category: r.category, revenue: round2(r.revenue) }));
  res.json(body);
});

statsRouter.get('/orders-by-status', async (_req: Request, res: Response) => {
  const rows = await db.select({ status: orders.status, count: count() }).from(orders).groupBy(orders.status);
  const body: OrdersByStatus[] = ORDER_STATUSES.map((status) => ({
    status,
    count: rows.find((r) => r.status === status)?.count ?? 0,
  }));
  res.json(body);
});

statsRouter.get('/daily-orders', async (req: Request, res: Response) => {
  const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 90);
  const day = sql<string>`DATE_FORMAT(${orders.createdAt}, '%Y-%m-%d')`;
  const rows = await db
    .select({
      date: day,
      orders: sql<number>`COUNT(DISTINCT ${orders.id})`.mapWith(Number),
      revenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.status} <> 'Cancelled' THEN ${lineTotal} ELSE 0 END), 0)`,
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(sql`${orders.createdAt} >= UTC_DATE() - INTERVAL ${days - 1} DAY`)
    .groupBy(day)
    .orderBy(day);

  // Fill days without orders with zeros so the chart has a continuous axis.
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const body: DailyOrders[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = d.toISOString().slice(0, 10);
    const r = byDate.get(key);
    body.push({ date: key, orders: r?.orders ?? 0, revenue: round2(r?.revenue) });
  }
  res.json(body);
});
