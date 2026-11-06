import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { adminAgent, app, customerAgent, PASSWORD, resetDatabase } from './helpers';

beforeEach(resetDatabase);

const adminOnly: [string, string][] = [
  ['get', '/api/users'],
  ['get', '/api/stats/overview'],
  ['get', '/api/contact'],
  ['post', '/api/categories'],
  ['post', '/api/products'],
  ['delete', '/api/products/1'],
];

describe('access control', () => {
  it.each(adminOnly)('%s %s: 401 for guests, 403 for customers', async (method, url) => {
    await (request(app) as any)[method](url).expect(401);
    const { agent } = await customerAgent();
    await (agent as any)[method](url).expect(403);
  });

  it('keeps public catalog endpoints open', async () => {
    await request(app).get('/api/categories').expect(200);
    await request(app).get('/api/products').expect(200);
    await request(app).get('/api/reviews').expect(200);
  });

  it('lets authors edit their own reviews but not others', async () => {
    const author = await customerAgent();
    const other = await customerAgent();
    const review = (
      await author.agent
        .post('/api/reviews')
        .send({ location: 'Both', rating: 5, comment: 'Odlična usluga!', userId: 999 })
        .expect(201)
    ).body;
    expect(review.userId).toBe(author.user.id); // user id comes from the session

    await other.agent.patch(`/api/reviews/${review.id}`).send({ comment: 'Promijenjeno' }).expect(403);
    await author.agent.patch(`/api/reviews/${review.id}`).send({ comment: 'Još bolje!' }).expect(200);

    const admin = await adminAgent();
    await admin.delete(`/api/reviews/${review.id}`).expect(204);
  });

  it('requires the current password to change it or delete the account', async () => {
    const { agent, email } = await customerAgent();
    await agent.patch('/api/users/me/password').send({ currentPassword: 'Wrong123!', newPassword: 'Novi123!x' }).expect(400);
    await agent.patch('/api/users/me/password').send({ currentPassword: PASSWORD, newPassword: 'Novi123!x' }).expect(200);
    await request(app).post('/api/auth/login').send({ email, password: 'Novi123!x' }).expect(200);

    await agent.delete('/api/users/me').send({ password: 'Wrong123!' }).expect(400);
    await agent.delete('/api/users/me').send({ password: 'Novi123!x' }).expect(204);
    await request(app).post('/api/auth/login').send({ email, password: 'Novi123!x' }).expect(401);
  });

  it('stops working immediately after an admin deletes the user', async () => {
    const { agent, user } = await customerAgent();
    const admin = await adminAgent();
    await admin.delete(`/api/users/${user.id}`).expect(204);
    await agent.get('/api/cart').expect(401);
  });
});
