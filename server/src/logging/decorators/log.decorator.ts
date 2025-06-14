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
  ) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      // Get logger instance - assumes the class has a logger property
      const logger: LoggingService = this.logger || this.loggingService;

      if (!logger) {
        console.warn(
          `@Log decorator used on ${target.constructor.name}.${propertyName} but no logger found. Inject LoggingService as 'logger' or 'loggingService'.`,
        );
        return method.apply(this, args);
      }

      const className = target.constructor.name;
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
        (logger as any)[logLevel](
          `Method ${className}.${propertyName} started`,
          className,
          metadata,
        );
      }

      try {
        const result = await method.apply(this, args);
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
          (logger as any)[logLevel](
            `Method ${className}.${propertyName} completed successfully in ${duration}ms`,
            className,
            successMetadata,
          );
        }

        return result;
      } catch (error: unknown) {
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
