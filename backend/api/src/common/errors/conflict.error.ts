import { HttpStatus } from '@nestjs/common';

import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

export class ConflictError extends AppError {
  constructor(message: string, code: ErrorCode = ErrorCode.CONFLICT) {
    super(code, message, HttpStatus.CONFLICT);
  }
}
