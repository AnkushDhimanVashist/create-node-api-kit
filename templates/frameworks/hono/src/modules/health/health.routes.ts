import { Hono } from 'hono';
import { healthService } from './health.service.js';

export const healthRoutes = new Hono();

healthRoutes.get('/', (c) => c.json(healthService.live()));

healthRoutes.get('/ready', async (c) => {
  const { ok, body } = await healthService.ready();
  return c.json(body, ok ? 200 : 503);
});
