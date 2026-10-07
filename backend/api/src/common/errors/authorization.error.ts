import { HttpStatus } from '@nestjs/common';

import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

export class AuthorizationError extends AppError {
  constructor(
    message = 'You are not allowed to perform this action.',
    code: ErrorCode = ErrorCode.FORBIDDEN,
  ) {
    super(code, message, HttpStatus.FORBIDDEN);
  }
}
