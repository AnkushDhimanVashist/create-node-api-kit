import type { PipeTransform } from '@nestjs/common';
import type { z } from 'zod';
import { validate } from '../validate.js';

/**
 * Validates a body / query / param with a Zod schema:
 *   @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput
 */
export class ZodValidationPipe<T extends z.ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    return validate(this.schema, value);
  }
}
