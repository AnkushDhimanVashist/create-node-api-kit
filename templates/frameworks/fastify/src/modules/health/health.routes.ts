import type { FastifyPluginAsync } from 'fastify';
import { healthService } from './health.service.js';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => healthService.live());

  app.get('/ready', async (_request, reply) => {
    const { ok, body } = await healthService.ready();
    return reply.status(ok ? 200 : 503).send(body);
  });
};
