import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app, customerAgent, PASSWORD, resetDatabase } from './helpers';

beforeEach(resetDatabase);

describe('auth', () => {
  it('registers a customer and sets an httpOnly session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Amra Hodžić', email: 'Amra@Example.com', phone: '061234567', password: PASSWORD })
      .expect(201);

    expect(res.body).toMatchObject({ fullName: 'Amra Hodžić', email: 'amra@example.com', role: 'User' });
    expect(res.body).not.toHaveProperty('passwordHash');
    const cookie = res.headers['set-cookie']?.[0] ?? '';
    expect(cookie).toContain('iboco_session=');
    expect(cookie).toContain('HttpOnly');
  });

  it('ignores a role sent by the client (v1 allowed registering as Admin)', async () => {
    const { user, agent } = await customerAgent({ role: 'Admin' });
    expect(user.role).toBe('User');
    await agent.get('/api/stats/overview').expect(403);
  });

  it('rejects weak passwords and duplicate emails', async () => {
    const weak = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Test', email: 'a@example.com', phone: '061234567', password: 'password' })
      .expect(400);
    expect(weak.body.error.code).toBe('VALIDATION_ERROR');
    expect(weak.body.error.details.password).toBeDefined();

    const { email } = await customerAgent();
    await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Drugi', email, phone: '061234567', password: PASSWORD })
      .expect(409);
  });

  it('logs in with correct credentials only, with the same message for unknown emails', async () => {
    const { email } = await customerAgent();
    await request(app).post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);

    const wrongPassword = await request(app).post('/api/auth/login').send({ email, password: 'Wrong123!' }).expect(401);
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: PASSWORD })
      .expect(401);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });

  it('returns the current user from /auth/me and null after logout', async () => {
    const { agent, email } = await customerAgent();
    expect((await agent.get('/api/auth/me').expect(200)).body.email).toBe(email);
    await agent.post('/api/auth/logout').expect(204);
    expect((await agent.get('/api/auth/me').expect(200)).body).toBeNull();
  });

  it('rejects a forged session cookie', async () => {
    await request(app).get('/api/cart').set('Cookie', 'iboco_session=not-a-real-token').expect(401);
  });
});
