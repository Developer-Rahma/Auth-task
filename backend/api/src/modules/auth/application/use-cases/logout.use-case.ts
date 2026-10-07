import { Injectable } from '@nestjs/common';
import { Response } from 'express';

import { AuthCookieService } from '../../infrastructure/security/auth-cookie.service';
import { RefreshSessionRepository } from '../../infrastructure/repositories/refresh-session.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshSessions: RefreshSessionRepository,

    private readonly cookieService: AuthCookieService,
  ) {}

  async execute(userId: string, response: Response): Promise<void> {
    await this.refreshSessions.revokeAllByUserId(userId);

    this.cookieService.clearAuthCookies(response);
  }
}
