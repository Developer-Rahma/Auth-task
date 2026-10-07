/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-codes';
import { AppLogger } from '../logging/app-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();

    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const requestIdHeader = request.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader)
      ? (requestIdHeader[0] ?? 'unknown')
      : (requestIdHeader ?? 'unknown');

    /**
     * Expected application errors
     */
    if (exception instanceof AppError) {
      this.logger.warn(exception.message, {
        requestId,
        code: exception.code,
        method: request.method,
        path: request.originalUrl,
      });

      response.status(exception.statusCode).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
        },
        requestId,
      });

      return;
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const code =
        status === HttpStatus.TOO_MANY_REQUESTS
          ? ErrorCode.RATE_LIMIT_EXCEEDED
          : this.mapHttpStatusToErrorCode(status);

      const message =
        status === HttpStatus.TOO_MANY_REQUESTS
          ? 'Too many requests. Please try again later.'
          : this.extractHttpExceptionMessage(exception);

      this.logger.warn(exception.message, {
        requestId,
        code,
        method: request.method,
        path: request.originalUrl,
      });

      response.status(status).json({
        success: false,
        error: {
          code,
          message,
        },
        requestId,
      });

      return;
    }

    /**
     * Unexpected system error
     */
    this.logger.error(
      'Unhandled application error',
      {
        requestId,
        method: request.method,
        path: request.originalUrl,
      },
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong. Please try again later.',
      },
      requestId,
    });
  }

  private mapHttpStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_ERROR;

      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;

      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;

      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;

      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;

      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }

  private extractHttpExceptionMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (
      typeof response === 'object' &&
      response !== null &&
      'message' in response
    ) {
      const message = (response as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return 'Request failed.';
  }
}
