import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import {
  type Request as ExpressRequest,
  type Response as ExpressResponse,
} from 'express';
import { SignupUseCase } from '../../../application/use-cases/signup.use-case';

import { SignupDto } from '../../dto/signup.dto';
import { SigninUseCase } from '../../../application/use-cases/signin.use-case';
import { SigninDto } from '../../dto/signin.dto';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { AccessTokenGuard } from '../../guards/access-token.guard';
import { type AuthenticatedRequest } from '../../../../../common/types/authenticated-request';
import { AuthenticationError } from '../../../../../common/errors/authentication.error';
import { ErrorCode } from '../../../../../common/errors/error-codes';
import { RefreshSessionUseCase } from '../../../application/use-cases/refresh-session.use-case';
import { LogoutUseCase } from '../../../application/use-cases/logout.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly signinUseCase: SigninUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly refreshSessionUseCase: RefreshSessionUseCase,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true })
    response: ExpressResponse,
  ) {
    return this.signupUseCase.execute(
      {
        name: dto.name,
        email: dto.email,
        password: dto.password,
      },
      response,
    );
  }
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true })
    response: ExpressResponse,
  ) {
    return this.signinUseCase.execute(dto.email, dto.password, response);
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async me(@Req() request: AuthenticatedRequest) {
    return this.getCurrentUserUseCase.execute(request.user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req()
    request: Omit<ExpressRequest, 'cookies'> & {
      cookies?: Record<string, unknown>;
    },
    @Res({ passthrough: true })
    response: ExpressResponse,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new AuthenticationError(
        'Authentication is required.',
        ErrorCode.UNAUTHORIZED,
      );
    }

    return this.refreshSessionUseCase.execute(refreshToken, response);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true })
    response: ExpressResponse,
  ) {
    await this.logoutUseCase.execute(request.user.id, response);
  }
}
