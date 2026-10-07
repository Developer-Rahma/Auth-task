import { Injectable, Logger } from '@nestjs/common';

export interface LogContext {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  userId?: string;
  code?: string;
  [key: string]: unknown;
}

@Injectable()
export class AppLogger {
  private readonly logger = new Logger('Application');

  info(message: string, context?: LogContext): void {
    this.logger.log(this.format(message, context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.format(message, context));
  }

  error(message: string, context?: LogContext, trace?: string): void {
    this.logger.error(this.format(message, context), trace);
  }

  private format(message: string, context?: LogContext): string {
    if (!context) {
      return message;
    }

    return JSON.stringify({
      message,
      ...context,
    });
  }
}
