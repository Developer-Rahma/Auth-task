import { Inject, Injectable } from '@nestjs/common';

import { Response } from 'express';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

import { JwtTokenService } from '../../infrastructure/security/jwt-token.service';
import { RefreshTokenHasherService } from '../../infrastructure/security/refresh-token-hasher.service';

import { AuthenticationError } from '../../../../common/errors/authentication.error';
import { ErrorCode } from '../../../../common/errors/error-codes';
import { RefreshSessionRepository } from '../../infrastructure/repositories/refresh-session.repository';
import { AuthSessionService } from '../services/auth.service';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly jwtTokenService: JwtTokenService,

    private readonly refreshTokenHasher: RefreshTokenHasherService,

    private readonly refreshSessions: RefreshSessionRepository,

    private readonly authSession: AuthSessionService,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(refreshToken: string, response: Response) {
    try {
      const payload =
        await this.jwtTokenService.verifyRefreshToken(refreshToken);

      const session = await this.refreshSessions.findActiveByJti(payload.jti);

      if (!session) {
        throw new Error('Refresh session not found.');
      }

      const tokenHash = this.refreshTokenHasher.hash(refreshToken);

      if (session.tokenHash !== tokenHash) {
        throw new Error('Refresh token does not match session.');
      }

      const user = await this.userRepository.findById(payload.sub);

      if (!user) {
        throw new Error('User not found.');
      }

      // Rotate the refresh token.
      await this.refreshSessions.revoke(payload.jti);

      await this.authSession.createSession(user, response);

      return {
        id: user.id,
        email: user.email,
      };
    } catch {
      throw new AuthenticationError(
        'Invalid or expired refresh session.',
        ErrorCode.UNAUTHORIZED,
      );
    }
  }
}
