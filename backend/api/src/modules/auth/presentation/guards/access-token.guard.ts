import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationError } from '../../../../common/errors/authentication.error';
import { ErrorCode } from '../../../../common/errors/error-codes';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service';

type AuthenticatedRequest = Request & {
  cookies?: Record<string, unknown>;
  user?: {
    id: string;
    email: string;
  };
};

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const token =
      typeof cookies?.access_token === 'string'
        ? cookies.access_token
        : undefined;

    if (!token) {
      throw new AuthenticationError(
        'Authentication is required.',
        ErrorCode.UNAUTHORIZED,
      );
    }

    try {
      const jwtTokenService = this.jwtTokenService as JwtTokenService & {
        verifyAccessToken: (
          token: string,
        ) => Promise<{ sub?: string; email?: string } | undefined>;
      };

      const payload = await jwtTokenService.verifyAccessToken(token);

      const userId = payload?.sub;
      const userEmail = payload?.email;

      if (!userId || !userEmail) {
        throw new AuthenticationError(
          'Authentication is required.',
          ErrorCode.UNAUTHORIZED,
        );
      }

      request.user = {
        id: userId,
        email: userEmail,
      };

      return true;
    } catch {
      throw new AuthenticationError(
        'Authentication is required.',
        ErrorCode.UNAUTHORIZED,
      );
    }
  }
}
