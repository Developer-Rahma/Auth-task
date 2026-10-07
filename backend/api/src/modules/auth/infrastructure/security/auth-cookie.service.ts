import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthCookieService {
  private readonly accessCookieName = 'access_token';

  private readonly refreshCookieName = 'refresh_token';

  constructor(private readonly config: ConfigService) {}

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.config.getOrThrow<boolean>('cookies.secure');

    const sameSite = this.config.getOrThrow<'strict' | 'lax' | 'none'>(
      'cookies.sameSite',
    );

    response.cookie(this.accessCookieName, accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie(this.refreshCookieName, refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie(this.accessCookieName, {
      httpOnly: true,
      path: '/',
    });

    response.clearCookie(this.refreshCookieName, {
      httpOnly: true,
      path: '/api/auth',
    });
  }

  getAccessCookieName(): string {
    return this.accessCookieName;
  }

  getRefreshCookieName(): string {
    return this.refreshCookieName;
  }
}
