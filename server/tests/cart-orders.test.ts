import { beforeEach, describe, expect, it } from 'vitest';
import { adminAgent, createProduct, customerAgent, resetDatabase } from './helpers';

beforeEach(resetDatabase);

describe('cart', () => {
  it('requires login', async () => {
    const { agent } = await customerAgent();
    await agent.post('/api/auth/logout');
    await agent.get('/api/cart').expect(401);
  });

  it('uses the price from the database, not from the request (v1 trusted unit_price)', async () => {
    const { id } = await createProduct(40.45);
    const { agent } = await customerAgent();

    const res = await agent.post('/api/cart/items').send({ productId: id, quantity: 2, unitPrice: 0.01 }).expect(201);

    expect(res.body.items[0].unitPrice).toBe(40.45);
    expect(res.body.subtotal).toBe(80.9);
    expect(res.body.tax).toBe(13.75); // 17% VAT, rounded to cents
    expect(res.body.total).toBe(94.65);
  });

  it('merges repeated adds into one line', async () => {
    const { id } = await createProduct(5);
    const { agent } = await customerAgent();
    await agent.post('/api/cart/items').send({ productId: id, quantity: 1 });
    const res = await agent.post('/api/cart/items').send({ productId: id, quantity: 3 });
    expect(res.body.items).toHaveLength(1);
    expect(res.body.itemCount).toBe(4);
  });

  it('keeps carts separate between users', async () => {
    const { id } = await createProduct(5);
    const alice = await customerAgent();
    const bob = await customerAgent();
    await alice.agent.post('/api/cart/items').send({ productId: id, quantity: 1 });
    expect((await bob.agent.get('/api/cart')).body.items).toHaveLength(0);
  });

  it('validates quantity and unknown products', async () => {
    const { id } = await createProduct(5);
    const { agent } = await customerAgent();
    await agent.post('/api/cart/items').send({ productId: id, quantity: 0 }).expect(400);
    await agent.post('/api/cart/items').send({ productId: 999999, quantity: 1 }).expect(404);
  });
});

describe('checkout and orders', () => {
  it('creates an order from the cart with a price snapshot and empties the cart', async () => {
    const { id } = await createProduct(12.5);
    const { agent } = await customerAgent();
    await agent.post('/api/cart/items').send({ productId: id, quantity: 2 });

    const order = (await agent.post('/api/orders/checkout').send({ pickupLocation: 'Teheranski Trg 7' }).expect(201)).body;

    expect(order).toMatchObject({ status: 'Active', pickupLocation: 'Teheranski Trg 7', subtotal: 25, itemCount: 2 });
    expect(order.items[0]).toMatchObject({ quantity: 2, unitPrice: 12.5 });
    expect((await agent.get('/api/cart')).body.items).toHaveLength(0);
  });

  it('refuses checkout with an empty cart or an unknown location', async () => {
    const { agent } = await customerAgent();
    await agent.post('/api/orders/checkout').send({ pickupLocation: 'Teheranski Trg 7' }).expect(400);
    await agent.post('/api/orders/checkout').send({ pickupLocation: 'Negdje drugo' }).expect(400);
  });

  it("hides other customers' orders (404) and lets the owner cancel an active order once", async () => {
    const { id } = await createProduct(3);
    const owner = await customerAgent();
    const other = await customerAgent();
    await owner.agent.post('/api/cart/items').send({ productId: id });
    const order = (await owner.agent.post('/api/orders/checkout').send({ pickupLocation: 'Patriotske Lige 35' })).body;

    await other.agent.get(`/api/orders/me/${order.id}`).expect(404);
    await other.agent.post(`/api/orders/me/${order.id}/cancel`).expect(404);

    const cancelled = await owner.agent.post(`/api/orders/me/${order.id}/cancel`).expect(200);
    expect(cancelled.body.status).toBe('Cancelled');
    await owner.agent.post(`/api/orders/me/${order.id}/cancel`).expect(409);
  });

  it('keeps order history when a product is deleted', async () => {
    const { id } = await createProduct(7);
    const { agent } = await customerAgent();
    await agent.post('/api/cart/items').send({ productId: id });
    const order = (await agent.post('/api/orders/checkout').send({ pickupLocation: 'Teheranski Trg 7' })).body;

    const admin = await adminAgent();
    await admin.delete(`/api/products/${id}`).expect(204);

    const details = (await agent.get(`/api/orders/me/${order.id}`).expect(200)).body;
    expect(details.items[0]).toMatchObject({ productId: null, productName: expect.stringContaining('Proizvod') });
  });

  it('lets only admins list orders and change their status', async () => {
    const { id } = await createProduct(3);
    const customer = await customerAgent();
    await customer.agent.post('/api/cart/items').send({ productId: id });
    const order = (await customer.agent.post('/api/orders/checkout').send({ pickupLocation: 'Teheranski Trg 7' })).body;

    await customer.agent.get('/api/orders').expect(403);
    await customer.agent.patch(`/api/orders/${order.id}/status`).send({ status: 'Completed' }).expect(403);

    const admin = await adminAgent();
    expect((await admin.get('/api/orders').expect(200)).body).toHaveLength(1);
    const updated = await admin.patch(`/api/orders/${order.id}/status`).send({ status: 'Completed' }).expect(200);
    expect(updated.body.status).toBe('Completed');
  });
});
