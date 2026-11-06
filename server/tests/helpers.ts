import { sql } from 'drizzle-orm';
import request from 'supertest';
import { createApp } from '../src/app';
import { db } from '../src/db/client';
import { cartItems, categories, contactMessages, orderItems, orders, products, reviews, users } from '../src/db/schema';
import { hashPassword } from '../src/lib/auth-tokens';

export const app = createApp();

export const PASSWORD = 'Test123!x';

export async function resetDatabase() {
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  for (const t of [cartItems, orderItems, orders, reviews, contactMessages, products, categories, users]) {
    await db.delete(t);
  }
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
}

let counter = 0;

/** Registers a customer through the API and returns a logged-in agent (cookie jar). */
export async function customerAgent(extra: Record<string, unknown> = {}) {
  const agent = request.agent(app);
  const email = `user${++counter}@example.com`;
  const res = await agent
    .post('/api/auth/register')
    .send({ fullName: 'Test Kupac', email, phone: '061234567', password: PASSWORD, ...extra });
  return { agent, user: res.body, email };
}

/** Admins cannot register through the API, so the test creates one directly in the database. */
export async function adminAgent() {
  const email = `admin${++counter}@example.com`;
  await db.insert(users).values({
    fullName: 'Test Admin',
    email,
    phone: '033123456',
    passwordHash: await hashPassword(PASSWORD),
    role: 'Admin',
  });
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);
  return agent;
}

export async function createProduct(price = 10, overrides: Partial<typeof products.$inferInsert> = {}) {
  const [{ id: categoryId }] = await db
    .insert(categories)
    .values({ name: `Kategorija ${++counter}`, description: '' })
    .$returningId();
  const [{ id }] = await db
    .insert(products)
    .values({ name: `Proizvod ${counter}`, description: 'Opis proizvoda', price, categoryId, ...overrides })
    .$returningId();
  return { id, categoryId };
}
