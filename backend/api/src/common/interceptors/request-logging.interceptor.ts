import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, tap } from 'rxjs';

import { Request, Response } from 'express';
import { AppLogger } from '../logging/app-logger.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();

    const request = httpContext.getRequest<Request>();

    const response = httpContext.getResponse<Response>();

    const startedAt = Date.now();

    const requestId = request.header('X-Request-ID') ?? 'unknown';

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;

        this.logger.info('HTTP request completed', {
          requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs,
        });
      }),
    );
  }
}
