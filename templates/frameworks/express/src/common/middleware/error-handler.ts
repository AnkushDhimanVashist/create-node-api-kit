import type { ErrorRequestHandler, RequestHandler } from 'express';
import { notFound, toErrorResponse } from '../errors.js';

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(notFound(`Route ${req.method} ${req.path} not found`));
};

/** Express 5 forwards errors thrown in async handlers here automatically. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { statusCode, body } = toErrorResponse(err);
  if (statusCode >= 500) req.log.error({ err }, 'Unhandled error');
  res.status(statusCode).json(body);
};
