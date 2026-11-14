import { describe, expect, it } from 'vitest';
import { request } from './helpers/request.js';

describe('GET /health', () => {
  it('reports the service is alive', async () => {
    const res = await request('GET', '/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request('GET', '/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});
