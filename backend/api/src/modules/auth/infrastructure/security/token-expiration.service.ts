import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenExpirationService {
  constructor(private readonly config: ConfigService) {}

  getRefreshExpirationDate(): Date {
    const expiresIn = this.config.getOrThrow<string>('jwt.refreshExpiresIn');

    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error('Unsupported JWT refresh expiration format.');
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(Date.now() + value * multipliers[unit]);
  }
}
