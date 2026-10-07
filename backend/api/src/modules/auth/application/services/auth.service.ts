import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { User } from '../../domain/entities/user.entity';

import { JwtTokenService } from '../../infrastructure/security/jwt-token.service';
import { RefreshTokenHasherService } from '../../infrastructure/security/refresh-token-hasher.service';
import { TokenExpirationService } from '../../infrastructure/security/token-expiration.service';
import { AuthCookieService } from '../../infrastructure/security/auth-cookie.service';
import { RefreshSessionRepository } from '../../infrastructure/repositories/refresh-session.repository';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly refreshTokenHasher: RefreshTokenHasherService,
    private readonly tokenExpirationService: TokenExpirationService,
    private readonly cookieService: AuthCookieService,
    private readonly refreshSessions: RefreshSessionRepository,
  ) {}

  async createSession(user: User, response: Response): Promise<void> {
    const accessToken = await this.jwtTokenService.generateAccessToken(
      user.id,
      user.email,
    );

    const { token: refreshToken, jti } =
      await this.jwtTokenService.generateRefreshToken(user.id);

    const tokenHash = this.refreshTokenHasher.hash(refreshToken);

    const expiresAt = this.tokenExpirationService.getRefreshExpirationDate();

    await this.refreshSessions.create({
      userId: user.id,
      jti,
      tokenHash,
      expiresAt,
    });

    this.cookieService.setAuthCookies(response, accessToken, refreshToken);
  }
}
