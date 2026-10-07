import { HttpStatus } from '@nestjs/common';

import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

export class NotFoundError extends AppError {
  constructor(
    message = 'Resource not found.',
    code: ErrorCode = ErrorCode.NOT_FOUND,
  ) {
    super(code, message, HttpStatus.NOT_FOUND);
  }
}
