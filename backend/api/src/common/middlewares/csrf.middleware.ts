import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { randomBytes } from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    const cookies = request.cookies as
      Record<string, string | undefined> | undefined;

    let token = cookies?.['XSRF-TOKEN'];

    if (!token) {
      token = randomBytes(32).toString('hex');

      response.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    if (!safeMethods.includes(request.method)) {
      const headerToken = request.header('X-XSRF-TOKEN');

      if (!headerToken || headerToken !== token) {
        response.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Invalid CSRF token.',
          },
        });

        return;
      }
    }

    next();
  }
}
