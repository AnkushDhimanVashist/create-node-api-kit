import { describe, expect, it } from 'vitest';
import { request } from './helpers/request.js';

// vitest.config sets RATE_LIMIT_MAX for tests. Each test file gets a fresh app,
// so the counter starts at zero here.
const LIMIT = Number(process.env.RATE_LIMIT_MAX);

describe('Rate limiting', () => {
  it(`blocks the request after ${LIMIT} calls`, async () => {
    for (let i = 0; i < LIMIT; i++) {
      const res = await request('GET', '/api/users');
      expect(res.status).not.toBe(429);
    }
    const blocked = await request('GET', '/api/users');
    expect(blocked.status).toBe(429);
    expect(blocked.body.error.code).toBe('TOO_MANY_REQUESTS');
  });

  it('never limits health checks', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
  });
});
