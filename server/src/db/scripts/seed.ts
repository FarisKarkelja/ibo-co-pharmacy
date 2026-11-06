import fs from 'node:fs';
import path from 'node:path';
import { sql } from 'drizzle-orm';
import { PICKUP_LOCATIONS } from '@ibo/shared';
import { hashPassword } from '../../lib/auth-tokens';
import { UPLOADS_DIR } from '../../middleware/upload';
import { db, pool } from '../client';
import { cartItems, categories, contactMessages, orderItems, orders, products, reviews, users } from '../schema';
import {
  seedAdmin,
  seedCategories,
  seedCustomer,
  seedExtraCustomers,
  seedMessages,
  seedProducts,
  seedReviews,
} from '../seed-data';

const SEED_IMAGES = path.resolve(process.cwd(), 'seed/images');

function copyImage(folder: 'categories' | 'products', file: string) {
  const target = path.join(UPLOADS_DIR, folder);
  fs.mkdirSync(target, { recursive: true });
  fs.copyFileSync(path.join(SEED_IMAGES, folder, file), path.join(target, file));
  return `/uploads/${folder}/${file}`;
}

/** Deterministic pseudo-random numbers, so every seed run produces the same data. */
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export async function seed() {
  console.log('Seeding demo data (existing data is removed)...');

  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  for (const table of [cartItems, orderItems, orders, reviews, contactMessages, products, categories, users]) {
    await db.delete(table);
  }
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);

  // Categories and products
  const categoryIds = new Map<string, number>();
  for (const c of seedCategories) {
    const [{ id }] = await db
      .insert(categories)
      .values({ name: c.name, description: c.description, imageUrl: copyImage('categories', c.image) })
      .$returningId();
    categoryIds.set(c.name, id);
  }

  const productRows: { id: number; name: string; price: number; category: string }[] = [];
  for (const [i, p] of seedProducts.entries()) {
    const [{ id }] = await db
      .insert(products)
      .values({
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: categoryIds.get(p.category)!,
        isPrescriptionRequired: p.rx ?? false,
        isFeatured: p.featured ?? false,
        imageUrl: p.image ? copyImage('products', p.image) : null,
        createdAt: new Date(Date.now() - (seedProducts.length - i) * 3600_000),
      })
      .$returningId();
    productRows.push({ id, name: p.name, price: p.price, category: p.category });
  }

  // Users (hashing in parallel keeps the seed fast)
  const [adminHash, customerHash, otherHash] = await Promise.all([
    hashPassword(seedAdmin.password),
    hashPassword(seedCustomer.password),
    hashPassword(`Demo-${Date.now()}!a`),
  ]);
  await db.insert(users).values({ ...seedAdmin, passwordHash: adminHash, role: 'Admin' });
  const [{ id: customerId }] = await db
    .insert(users)
    .values({ ...seedCustomer, passwordHash: customerHash, role: 'User' })
    .$returningId();
  const customerIds = [customerId];
  for (const c of seedExtraCustomers) {
    const [{ id }] = await db.insert(users).values({ ...c, passwordHash: otherHash, role: 'User' }).$returningId();
    customerIds.push(id);
  }

  // Orders spread over the last 45 days, so the dashboard charts have data
  const rand = random(42);
  const pick = <T>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  for (let i = 0; i < 34; i++) {
    const daysAgo = Math.floor(rand() * 45);
    const createdAt = new Date(Date.now() - daysAgo * 86400_000 - Math.floor(rand() * 10) * 3600_000);
    const status = daysAgo < 3 ? 'Active' : i % 8 === 5 ? 'Cancelled' : 'Completed';
    const [{ id: orderId }] = await db
      .insert(orders)
      .values({ userId: pick(customerIds), pickupLocation: pick(PICKUP_LOCATIONS), status, createdAt })
      .$returningId();
    const chosen = new Set<number>();
    const lines = 1 + Math.floor(rand() * 3);
    while (chosen.size < lines) chosen.add(Math.floor(rand() * productRows.length));
    await db.insert(orderItems).values(
      [...chosen].map((idx) => {
        const p = productRows[idx];
        return {
          orderId,
          productId: p.id,
          productName: p.name,
          categoryName: p.category,
          quantity: 1 + Math.floor(rand() * 3),
          unitPrice: p.price,
        };
      }),
    );
  }

  // Reviews and contact messages
  for (const [i, r] of seedReviews.entries()) {
    await db.insert(reviews).values({
      ...r,
      userId: customerIds[(i + 1) % customerIds.length],
      createdAt: new Date(Date.now() - (i * 5 + 1) * 86400_000),
    });
  }
  await db.insert(contactMessages).values(seedMessages.map((m) => ({ ...m })));

  // Something in the demo customer's cart
  await db.insert(cartItems).values([
    { userId: customerId, productId: productRows[1].id, quantity: 1 },
    { userId: customerId, productId: productRows[8].id, quantity: 2 },
  ]);

  console.log(`  ${seedCategories.length} categories, ${seedProducts.length} products, ${customerIds.length + 1} users, 34 orders`);
  console.log(`  Admin:    ${seedAdmin.email} / ${seedAdmin.password}`);
  console.log(`  Customer: ${seedCustomer.email} / ${seedCustomer.password}`);
}

// Run directly with `npm run db:seed`
if (process.argv[1]?.replace(/\\/g, '/').match(/scripts\/seed\.(ts|js)$/)) {
  seed()
    .then(() => pool.end())
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
