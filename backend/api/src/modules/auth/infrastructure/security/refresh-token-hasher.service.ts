import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class RefreshTokenHasherService {
  hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
