import { Router } from 'express';
import { healthService } from './health.service.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json(healthService.live());
});

healthRouter.get('/ready', async (_req, res) => {
  const { ok, body } = await healthService.ready();
  res.status(ok ? 200 : 503).json(body);
});
