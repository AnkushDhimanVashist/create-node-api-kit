import { Catch, HttpException } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { logger } from '../../lib/logger.js';
import { AppError, toErrorResponse } from '../errors.js';

/** Every error ends up here and leaves as the same JSON shape. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const error =
      exception instanceof HttpException ? new AppError(exception.getStatus(), exception.message) : exception;
    const { statusCode, body } = toErrorResponse(error);
    if (statusCode >= 500) logger.error({ err: exception }, 'Unhandled error');
    res.status(statusCode).json(body);
  }
}
