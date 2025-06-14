import { LoggingService } from '../logging.service';
import { LogMetadata } from '../interfaces/log-level.interface';

/**
 * Decorator that automatically logs method entry and exit
 * @param logLevel - Optional log level (default: 'debug')
 * @param includeArgs - Whether to include method arguments in logs (default: false)
 * @param includeResult - Whether to include method result in logs (default: false)
 */
export function Log(options?: {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  includeArgs?: boolean;
  includeResult?: boolean;
}) {
  const {
    logLevel = 'debug',
    includeArgs = false,
    includeResult = false,
  } = options || {};

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const method = descriptor.value as (...args: any[]) => any;

    descriptor.value = function (
      this: { logger?: LoggingService; loggingService?: LoggingService },
      ...args: any[]
    ): any {
      // Get logger instance - assumes the class has a logger property
      const logger: LoggingService | undefined =
        this.logger || this.loggingService;

      if (!logger) {
        console.warn(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `@Log decorator used on ${(target.constructor as { name: string }).name}.${propertyName} but no logger found. Inject LoggingService as 'logger' or 'loggingService'.`,
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return method.apply(this, args);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const className = (target.constructor as { name: string }).name;
      const startTime = Date.now();

      const metadata: LogMetadata = {
        method: propertyName,
        className,
        duration: 0,
      };

      if (includeArgs && args.length > 0) {
        metadata.arguments = sanitizeLogData(args);
      }

      // Log method entry
      if (logLevel === 'error') {
        logger.error(
          `Method ${className}.${propertyName} started`,
          undefined,
          className,
          metadata,
        );
      } else {
        const logMethod = logger[logLevel];
        if (typeof logMethod === 'function') {
          logMethod.call(
            logger,
            `Method ${className}.${propertyName} started`,
            className,
            metadata,
          );
        }
      }

      const handleResult = (result: any): any => {
        const duration = Date.now() - startTime;

        const successMetadata: LogMetadata = {
          ...metadata,
          duration,
          success: true,
        };

        if (includeResult && result !== undefined) {
          successMetadata.result = sanitizeLogData(result);
        }

        // Log successful completion
        if (logLevel === 'error') {
          logger.error(
            `Method ${className}.${propertyName} completed successfully in ${duration}ms`,
            undefined,
            className,
            successMetadata,
          );
        } else {
          const logMethod = logger[logLevel];
          if (typeof logMethod === 'function') {
            logMethod.call(
              logger,
              `Method ${className}.${propertyName} completed successfully in ${duration}ms`,
              className,
              successMetadata,
            );
          }
        }

        return result;
      };

      const handleError = (error: unknown): never => {
        const duration = Date.now() - startTime;
        const errorObj = error as Error;

        const errorMetadata: LogMetadata = {
          ...metadata,
          duration,
          success: false,
          errorName: errorObj.name,
          errorMessage: errorObj.message,
        };

        // Log error
        logger.error(
          `Method ${className}.${propertyName} failed after ${duration}ms: ${errorObj.message}`,
          errorObj.stack,
          className,
          errorMetadata,
        );

        throw error;
      };

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const result = method.apply(this, args);

        // Handle both sync and async methods
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (result && typeof result.then === 'function') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          return result.then(handleResult).catch(handleError);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return handleResult(result);
        }
      } catch (error: unknown) {
        return handleError(error);
      }
    };

    return descriptor;
  };
}

/**
 * Helper function to sanitize sensitive data from logs
 */
function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean'
  ) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  if (typeof data === 'object') {
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'key',
      'authorization',
      'apiKey',
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }

    return sanitized;
  }

  return data;
}
