import { HttpStatus } from '@nestjs/common';
import type { ErrorCode } from './error-codes';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: HttpStatus,
  ) {
    super(message);

    this.name = 'AppError';

    Error.captureStackTrace(this, AppError);
  }
}
