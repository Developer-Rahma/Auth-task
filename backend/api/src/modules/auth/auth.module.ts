import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordHasherService } from './infrastructure/security/password-hasher.service';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { RefreshTokenHasherService } from './infrastructure/security/refresh-token-hasher.service';
import { TokenExpirationService } from './infrastructure/security/token-expiration.service';
import { AuthCookieService } from './infrastructure/security/auth-cookie.service';
import { UserModel, UserSchema } from './infrastructure/schemas/user.schema';
import {
  RefreshSessionModel,
  RefreshSessionSchema,
} from './infrastructure/schemas/refresh-session.schema';
import { AuthController } from './presentation/controllers/auth/auth.controller';
import { MongoUserRepository } from './infrastructure/repositories/mongo-user.repository';
import { RefreshSessionRepository } from './infrastructure/repositories/refresh-session.repository';
import { AuthSessionService } from './application/services/auth.service';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { SigninUseCase } from './application/use-cases/signin.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';

@Module({
  imports: [
    JwtModule.register({}),

    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
      {
        name: RefreshSessionModel.name,
        schema: RefreshSessionSchema,
      },
    ]),
  ],

  controllers: [AuthController],

  providers: [
    MongoUserRepository,
    RefreshSessionRepository,

    PasswordHasherService,
    JwtTokenService,
    RefreshTokenHasherService,
    TokenExpirationService,
    AuthCookieService,
    SigninUseCase,
    AuthSessionService,
    SignupUseCase,
    GetCurrentUserUseCase,
    LogoutUseCase,
    RefreshSessionUseCase,

    {
      provide: USER_REPOSITORY,
      useExisting: MongoUserRepository,
    },
  ],

  exports: [USER_REPOSITORY],
})
export class AuthModule {}
