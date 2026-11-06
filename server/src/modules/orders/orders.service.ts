import { calculateTotals, type Order, type OrderDetails, type OrderStatus, type PickupLocation, toCents, fromCents, TAX_RATE } from '@ibo/shared';
import type { SQL } from 'drizzle-orm';
import { db } from '../../db/client';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { cartRepository } from '../cart/cart.repository';
import { ordersRepository } from './orders.repository';

type SummaryRow = Awaited<ReturnType<typeof ordersRepository.listSummaries>>[number];

function totalsFromSubtotal(subtotal: number) {
  const subtotalCents = toCents(subtotal);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return { subtotal: fromCents(subtotalCents), tax: fromCents(taxCents), total: fromCents(subtotalCents + taxCents) };
}

const toOrder = ({ customerPhone: _phone, ...row }: SummaryRow): Order => ({
  ...row,
  ...totalsFromSubtotal(Number(row.subtotal)),
  createdAt: row.createdAt.toISOString(),
});

async function details(where: SQL): Promise<OrderDetails> {
  const row = await ordersRepository.findSummary(where);
  if (!row) throw notFound('Narudžba ne postoji.');
  const items = await ordersRepository.listItems(row.id);
  return {
    ...toOrder(row),
    customerPhone: row.customerPhone,
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      lineTotal: calculateTotals([{ unitPrice: Number(i.unitPrice), quantity: i.quantity }]).subtotal,
    })),
  };
}

export const ordersService = {
  /**
   * Turns the user's cart into an order inside one transaction: the order, its items
   * (with a snapshot of name and price) and clearing the cart either all succeed or none do.
   */
  async checkout(userId: number, pickupLocation: PickupLocation) {
    const orderId = await db.transaction(async (tx) => {
      const lines = await cartRepository.listForUser(userId, tx);
      if (lines.length === 0) throw badRequest('Korpa je prazna. Dodajte proizvode prije narudžbe.');
      const id = await ordersRepository.create(
        tx,
        { userId, pickupLocation },
        lines.map((l) => ({
          productId: l.productId,
          productName: l.name,
          categoryName: l.categoryName,
          quantity: l.quantity,
          unitPrice: Number(l.unitPrice),
        })),
      );
      await cartRepository.clear(userId, tx);
      return id;
    });
    return details(ordersRepository.byId(orderId));
  },

  async listForUser(userId: number) {
    return (await ordersRepository.listSummaries(ordersRepository.byUser(userId))).map(toOrder);
  },

  /** Returns 404 (not 403) for other users' orders, so order ids cannot be probed. */
  getForUser: (userId: number, orderId: number) => details(ordersRepository.byUserAndId(userId, orderId)),

  async cancelForUser(userId: number, orderId: number) {
    const order = await details(ordersRepository.byUserAndId(userId, orderId));
    if (order.status !== 'Active') throw conflict('Moguće je otkazati samo aktivne narudžbe.');
    await ordersRepository.updateStatus(orderId, 'Cancelled');
    return details(ordersRepository.byId(orderId));
  },

  async list(status?: OrderStatus) {
    return (await ordersRepository.listSummaries(status ? ordersRepository.byStatus(status) : undefined)).map(toOrder);
  },

  get: (id: number) => details(ordersRepository.byId(id)),

  async updateStatus(id: number, status: OrderStatus) {
    await details(ordersRepository.byId(id));
    await ordersRepository.updateStatus(id, status);
    return details(ordersRepository.byId(id));
  },

  async delete(id: number) {
    await details(ordersRepository.byId(id));
    await ordersRepository.delete(id);
  },
};
