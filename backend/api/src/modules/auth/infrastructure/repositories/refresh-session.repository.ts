import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

import {
  RefreshSessionDocument,
  RefreshSessionModel,
} from '../schemas/refresh-session.schema';

@Injectable()
export class RefreshSessionRepository {
  constructor(
    @InjectModel(RefreshSessionModel.name)
    private readonly model: Model<RefreshSessionDocument>,
  ) {}

  async create(data: {
    userId: string;
    jti: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.model.create(data);
  }

  async findActiveByJti(jti: string): Promise<RefreshSessionDocument | null> {
    return this.model
      .findOne({
        jti,
        revokedAt: null,
        expiresAt: {
          $gt: new Date(),
        },
      })
      .exec();
  }
  async revokeAllByUserId(userId: string): Promise<void> {
    await this.model.updateMany(
      {
        userId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }

  async findByJti(jti: string): Promise<RefreshSessionDocument | null> {
    return this.model.findOne({ jti }).exec();
  }
  async revoke(jti: string): Promise<void> {
    await this.model.updateOne(
      {
        jti,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );
  }
}
