import { describe, expect, it } from 'vitest';
import { request } from './helpers/request.js';

const credentials = { email: 'ada@example.com', password: 'correct-horse-battery' };

describe('Auth API', () => {
  it('registers a user and returns a token', async () => {
    const res = await request('POST', '/api/auth/register', {
      body: { ...credentials, name: 'Ada Lovelace' },
    });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: credentials.email, name: 'Ada Lovelace' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('logs in and reads the current user', async () => {
    await request('POST', '/api/auth/register', { body: { ...credentials, name: 'Ada' } });

    const login = await request('POST', '/api/auth/login', { body: credentials });
    expect(login.status).toBe(200);

    const me = await request('GET', '/api/auth/me', { token: login.body.accessToken });
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(credentials.email);
  });

  it('rejects a wrong password', async () => {
    await request('POST', '/api/auth/register', { body: { ...credentials, name: 'Ada' } });
    const res = await request('POST', '/api/auth/login', {
      body: { ...credentials, password: 'wrong-password' },
    });
    expect(res.status).toBe(401);
  });

  it('rejects an invalid token', async () => {
    const res = await request('GET', '/api/auth/me', { token: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });
});
