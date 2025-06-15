import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly logger: LoggingService) {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'info', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('Successfully connected to database', 'Prisma');
    } catch (error) {
      this.logger.logError(
        error instanceof Error
          ? error
          : new Error('Unknown database connection error'),
        'Prisma',
        { operation: 'connect' },
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.info('Successfully disconnected from database', 'Prisma');
    } catch (error) {
      this.logger.logError(
        error instanceof Error
          ? error
          : new Error('Unknown database disconnection error'),
        'Prisma',
        { operation: 'disconnect' },
      );
    }
  }

  /**
   * Helper method to handle database transactions with logging
   */
  async runTransaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    options?: { timeout?: number; maxWait?: number },
  ): Promise<T> {
    const startTime = Date.now();
    const transactionId = Math.random().toString(36).substring(2, 15);

    this.logger.debug(`Starting database transaction`, 'Prisma', {
      transactionId,
      timeout: options?.timeout,
      maxWait: options?.maxWait,
    });

    try {
      const result = await this.$transaction(fn, options);
      const duration = Date.now() - startTime;

      this.logger.debug(
        `Database transaction completed successfully`,
        'Prisma',
        {
          transactionId,
          durationMs: duration,
        },
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        `Database transaction failed after ${duration}ms`,
        error instanceof Error ? error.stack : undefined,
        'Prisma',
        {
          transactionId,
          durationMs: duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      );

      throw error;
    }
  }
}
