import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incomingRequestId = request.header('X-Request-ID');

    const requestId = incomingRequestId?.trim() || randomUUID();

    request.headers['x-request-id'] = requestId;

    response.setHeader('X-Request-ID', requestId);

    next();
  }
}
