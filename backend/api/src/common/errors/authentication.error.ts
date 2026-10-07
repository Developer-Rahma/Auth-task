import { HttpStatus } from '@nestjs/common';

import { AppError } from './app-error';
import { ErrorCode } from './error-codes';

export class AuthenticationError extends AppError {
  constructor(
    message = 'Authentication failed.',
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
  ) {
    super(code, message, HttpStatus.UNAUTHORIZED);
  }
}
