import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const expiresIn = this.config.getOrThrow<JwtSignOptions['expiresIn']>(
      'jwt.accessExpiresIn',
    );

    return this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      expiresIn,
    });
  }

  async generateRefreshToken(userId: string): Promise<{
    token: string;
    jti: string;
  }> {
    const jti = randomUUID();

    const payload: RefreshTokenPayload = {
      sub: userId,
      jti,
      type: 'refresh',
    };

    const expiresIn = this.config.getOrThrow<JwtSignOptions['expiresIn']>(
      'jwt.refreshExpiresIn',
    );

    const token = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn,
    });

    return {
      token,
      jti,
    };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(
      token,
      {
        secret: this.config.getOrThrow<string>('jwt.accessSecret'),
      },
    );

    if (payload.type !== 'access' || !payload.sub || !payload.email) {
      throw new Error('Invalid access token.');
    }

    return payload;
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
      token,
      {
        secret: this.config.getOrThrow<string>('jwt.refreshSecret'),
      },
    );

    if (payload.type !== 'refresh' || !payload.sub || !payload.jti) {
      throw new Error('Invalid refresh token.');
    }

    return payload;
  }
}
