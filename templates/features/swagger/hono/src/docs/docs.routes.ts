import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { openApiDocument } from './openapi.js';

/** Swagger UI at /docs, raw spec at /docs/openapi.json */
export const docsRoutes = new Hono();

docsRoutes.get('/openapi.json', (c) => c.json(openApiDocument));
docsRoutes.get('/', swaggerUI({ url: '/docs/openapi.json' }));
