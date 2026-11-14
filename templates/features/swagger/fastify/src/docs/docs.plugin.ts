import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import { openApiDocument } from './openapi.js';

/** Swagger UI at /docs, raw spec at /docs/json */
export async function docsPlugin(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    mode: 'static',
    specification: { document: openApiDocument as never },
  });
  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
}
