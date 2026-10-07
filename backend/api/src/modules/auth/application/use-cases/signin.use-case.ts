import { Inject, Injectable } from '@nestjs/common';

import { Response } from 'express';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

import { PasswordHasherService } from '../../infrastructure/security/password-hasher.service';

import { AuthenticationError } from '../../../../common/errors/authentication.error';
import { ErrorCode } from '../../../../common/errors/error-codes';
import { AuthSessionService } from '../services/auth.service';

@Injectable()
export class SigninUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly passwordHasher: PasswordHasherService,

    private readonly authSession: AuthSessionService,
  ) {}

  async execute(email: string, password: string, response: Response) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new AuthenticationError(
        'Invalid email or password.',
        ErrorCode.INVALID_CREDENTIALS,
      );
    }

    const passwordMatches = await this.passwordHasher.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AuthenticationError(
        'Invalid email or password.',
        ErrorCode.INVALID_CREDENTIALS,
      );
    }

    await this.authSession.createSession(user, response);

    return {
      id: user.id,
      email: user.email,
    };
  }
}
