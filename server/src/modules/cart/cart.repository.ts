import { and, asc, eq, sql } from 'drizzle-orm';
import { MAX_CART_QUANTITY } from '@ibo/shared';
import { db, type DbExecutor } from '../../db/client';
import { cartItems, categories, products } from '../../db/schema';

export const cartRepository = {
  /** Cart lines joined with the *current* product data (price is never stored in the cart). */
  listForUser(userId: number, executor: DbExecutor = db) {
    return executor
      .select({
        productId: products.id,
        name: products.name,
        imageUrl: products.imageUrl,
        unitPrice: products.price,
        quantity: cartItems.quantity,
        isPrescriptionRequired: products.isPrescriptionRequired,
        categoryName: categories.name,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(asc(cartItems.id));
  },

  /** Adds a product or increases its quantity in one statement (capped at the max quantity). */
  async add(userId: number, productId: number, quantity: number) {
    await db
      .insert(cartItems)
      .values({ userId, productId, quantity })
      .onDuplicateKeyUpdate({
        set: { quantity: sql`LEAST(${cartItems.quantity} + ${quantity}, ${MAX_CART_QUANTITY})` },
      });
  },

  async setQuantity(userId: number, productId: number, quantity: number) {
    const [result] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return result.affectedRows > 0;
  },

  async remove(userId: number, productId: number) {
    const [result] = await db
      .delete(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return result.affectedRows > 0;
  },

  clear(userId: number, executor: DbExecutor = db) {
    return executor.delete(cartItems).where(eq(cartItems.userId, userId));
  },
};
