import { calculateTotals, type CartSummary } from '@ibo/shared';
import { notFound } from '../../lib/errors';
import { productsRepository } from '../products/products.repository';
import { cartRepository } from './cart.repository';

export const cartService = {
  async getSummary(userId: number): Promise<CartSummary> {
    const rows = await cartRepository.listForUser(userId);
    const items = rows.map((r) => {
      const unitPrice = Number(r.unitPrice);
      return {
        productId: r.productId,
        name: r.name,
        imageUrl: r.imageUrl,
        unitPrice,
        quantity: r.quantity,
        lineTotal: calculateTotals([{ unitPrice, quantity: r.quantity }]).subtotal,
        isPrescriptionRequired: r.isPrescriptionRequired,
      };
    });
    return {
      items,
      itemCount: items.reduce((n, i) => n + i.quantity, 0),
      ...calculateTotals(items),
    };
  },

  async add(userId: number, productId: number, quantity: number) {
    if (!(await productsRepository.findById(productId))) throw notFound('Proizvod ne postoji.');
    await cartRepository.add(userId, productId, quantity);
    return this.getSummary(userId);
  },

  async setQuantity(userId: number, productId: number, quantity: number) {
    if (!(await cartRepository.setQuantity(userId, productId, quantity))) throw notFound('Proizvod nije u korpi.');
    return this.getSummary(userId);
  },

  async remove(userId: number, productId: number) {
    if (!(await cartRepository.remove(userId, productId))) throw notFound('Proizvod nije u korpi.');
    return this.getSummary(userId);
  },

  async clear(userId: number) {
    await cartRepository.clear(userId);
    return this.getSummary(userId);
  },
};
