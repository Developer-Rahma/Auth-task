import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service';
import { AuthController } from './auth.controller';
import { SignupUseCase } from '../../../application/use-cases/signup.use-case';
import { SigninUseCase } from '../../../application/use-cases/signin.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { RefreshSessionUseCase } from '../../../application/use-cases/refresh-session.use-case';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: SignupUseCase, useValue: {} },
        { provide: SigninUseCase, useValue: {} },
        { provide: LogoutUseCase, useValue: {} },
        { provide: GetCurrentUserUseCase, useValue: {} },
        { provide: RefreshSessionUseCase, useValue: {} },
        { provide: JwtTokenService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
