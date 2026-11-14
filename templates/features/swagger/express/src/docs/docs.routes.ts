import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './openapi.js';

/** Swagger UI at /docs, raw spec at /docs/openapi.json */
export const docsRouter = Router();

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

docsRouter.use(swaggerUi.serve, swaggerUi.setup(openApiDocument));
