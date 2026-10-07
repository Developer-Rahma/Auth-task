import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { AuthSessionService } from './auth.service';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service';
import { RefreshTokenHasherService } from '../../infrastructure/security/refresh-token-hasher.service';
import { TokenExpirationService } from '../../infrastructure/security/token-expiration.service';
import { AuthCookieService } from '../../infrastructure/security/auth-cookie.service';
import { RefreshSessionRepository } from '../../infrastructure/repositories/refresh-session.repository';

describe('AuthService', () => {
  let service: AuthSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSessionService,
        { provide: JwtTokenService, useValue: {} },
        { provide: RefreshTokenHasherService, useValue: {} },
        { provide: TokenExpirationService, useValue: {} },
        { provide: AuthCookieService, useValue: {} },
        { provide: RefreshSessionRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthSessionService>(AuthSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
