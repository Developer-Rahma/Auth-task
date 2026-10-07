import { Inject, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Types } from 'mongoose';

import { User } from '../../domain/entities/user.entity';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

import { PasswordHasherService } from '../../infrastructure/security/password-hasher.service';

import { ConflictError } from '../../../../common/errors/conflict.error';
import { AuthSessionService } from '../services/auth.service';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface SignupOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class SignupUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    private readonly passwordHasher: PasswordHasherService,

    private readonly authSession: AuthSessionService,
  ) {}

  async execute(input: SignupInput, response: Response): Promise<SignupOutput> {
    const email = input.email.trim().toLowerCase();

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictError('An account with this email already exists.');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: new Types.ObjectId().toString(),
      name: input.name.trim(),
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdUser = await this.userRepository.create(user);

    await this.authSession.createSession(createdUser, response);

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };
  }
}
