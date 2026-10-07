import { Inject, Injectable } from '@nestjs/common';

import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

import { NotFoundError } from '../../../../common/errors/not-found.error';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found.');
    }

    return {
      id: user.id,
      email: user.email,
    };
  }
}
