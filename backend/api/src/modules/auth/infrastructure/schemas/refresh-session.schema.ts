import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type RefreshSessionDocument = HydratedDocument<RefreshSessionModel>;

@Schema({
  collection: 'refresh_sessions',
  timestamps: true,
})
export class RefreshSessionModel {
  @Prop({
    required: true,
    index: true,
  })
  userId!: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  jti!: string;

  @Prop({
    required: true,
  })
  tokenHash!: string;

  @Prop({
    required: true,
    index: true,
  })
  expiresAt!: Date;

  @Prop({
    type: Date,
    default: null,
  })
  revokedAt!: Date | null;
}

export const RefreshSessionSchema =
  SchemaFactory.createForClass(RefreshSessionModel);
