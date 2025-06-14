import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger, Logger, format, transports } from 'winston';
import { AppConfigService } from '../config/config.service';
import {
  LogLevel,
  LogMetadata,
  LogContext,
  LogEntry,
} from './interfaces/log-level.interface';

@Injectable()
export class LoggingService implements LoggerService {
  private readonly logger: Logger;
  private readonly serviceName: string = 'saas-server';

  constructor(private readonly configService: AppConfigService) {
    this.logger = this.createLogger();
  }

  private createLogger(): Logger {
    const transportsList: any[] = [];

    // Add console transport if enabled via configuration or for error logging
    if (this.configService.enableConsoleLogger) {
      const consoleTransport = new transports.Console({
        format: format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          format.colorize(),
          format.printf(
            ({ timestamp, level, message, service, component, ...meta }) => {
              const serviceStr = String(service);
              const componentStr =
                typeof component === 'string' ? component : undefined;
              const contextInfo = componentStr
                ? `[${serviceStr}:${componentStr}]`
                : `[${serviceStr}]`;
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : '';
              return `${String(timestamp)} ${String(level)} ${contextInfo} ${String(message)} ${metaStr}`;
            },
          ),
        ),
      });

      transportsList.push(consoleTransport);
    } else {
      // Even if console logging is disabled, always log errors to console
      const errorConsoleTransport = new transports.Console({
        level: 'error',
        format: format.combine(
          format.timestamp(),
          format.errors({ stack: true }),
          format.colorize(),
          format.printf(
            ({ timestamp, level, message, service, component, ...meta }) => {
              const serviceStr = String(service);
              const componentStr =
                typeof component === 'string' ? component : undefined;
              const contextInfo = componentStr
                ? `[${serviceStr}:${componentStr}]`
                : `[${serviceStr}]`;
              const metaStr = Object.keys(meta).length
                ? JSON.stringify(meta, null, 2)
                : '';
              return `${String(timestamp)} ${String(level)} ${contextInfo} ${String(message)} ${metaStr}`;
            },
          ),
        ),
      });

      transportsList.push(errorConsoleTransport);
    }

    // Add Loki transport if not in test mode and Loki URL is configured
    if (!this.configService.isTest && this.configService.lokiUrl) {
      try {
        // Use require for winston-loki as it's a CommonJS module
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const LokiTransport = require('winston-loki');
        const lokiTransport = new LokiTransport({
          host: this.configService.lokiUrl,
          labels: {
            service: this.serviceName,
            environment: this.configService.nodeEnv,
          },
          json: true,
          format: format.json(),
          replaceTimestamp: true,
          onConnectionError: () => {
            // Silently ignore connection errors - Loki might not be available
          },
          gracefulShutdown: true,
          timeout: 10000,
          clearOnError: true,
          batching: true,
          interval: 5,
        });
        transportsList.push(lokiTransport);
        console.info('Loki transport initialized successfully');
      } catch (error) {
        console.error('Error initializing Loki transport:', error);
        console.warn(
          'Running without Loki transport - logs will only appear in console',
        );
      }
    }

    // This should rarely happen now since we always have error console transport
    if (transportsList.length === 0) {
      console.warn(
        'No logging transports configured, adding emergency console transport',
      );
      transportsList.push(
        new transports.Console({
          format: format.simple(),
        }),
      );
    }

    return createLogger({
      level: this.configService.logLevel,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: {
        service: this.serviceName,
        environment: this.configService.nodeEnv,
      },
      transports: transportsList,
      exceptionHandlers: [new transports.Console()],
      rejectionHandlers: [new transports.Console()],
    });
  }

  log(message: string, context?: string, metadata?: LogMetadata): void {
    this.info(message, context, metadata);
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: LogMetadata,
  ): void {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      context: context
        ? { service: this.serviceName, component: context }
        : undefined,
      metadata: {
        ...metadata,
        stack: trace,
      },
      timestamp: new Date(),
    };

    this.logger.error(logEntry);
  }

  warn(message: string, context?: string, metadata?: LogMetadata): void {
    const logEntry: LogEntry = {
      level: LogLevel.WARN,
      message,
      context: context
        ? { service: this.serviceName, component: context }
        : undefined,
      metadata,
      timestamp: new Date(),
    };

    this.logger.warn(logEntry);
  }

  debug(message: string, context?: string, metadata?: LogMetadata): void {
    const logEntry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      context: context
        ? { service: this.serviceName, component: context }
        : undefined,
      metadata,
      timestamp: new Date(),
    };

    this.logger.debug(logEntry);
  }

  verbose(message: string, context?: string, metadata?: LogMetadata): void {
    this.debug(message, context, metadata);
  }

  info(message: string, context?: string, metadata?: LogMetadata): void {
    const logEntry: LogEntry = {
      level: LogLevel.INFO,
      message,
      context: context
        ? { service: this.serviceName, component: context }
        : undefined,
      metadata,
      timestamp: new Date(),
    };

    this.logger.info(logEntry);
  }

  logWithLevel(
    level: LogLevel,
    message: string,
    context?: LogContext,
    metadata?: LogMetadata,
  ): void {
    const logEntry: LogEntry = {
      level,
      message,
      context: context || { service: this.serviceName },
      metadata,
      timestamp: new Date(),
    };

    this.logger.log(level, logEntry);
  }

  logError(error: Error, context?: string, metadata?: LogMetadata): void {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message: error.message,
      context: context
        ? { service: this.serviceName, component: context }
        : undefined,
      metadata: {
        ...metadata,
        stack: error.stack,
        name: error.name,
      },
      timestamp: new Date(),
      error,
    };

    this.logger.error(logEntry);
  }

  logRequestStart(
    method: string,
    url: string,
    requestId: string,
    metadata?: LogMetadata,
  ): void {
    this.info(`Request started: ${method} ${url}`, 'HTTP', {
      ...metadata,
      requestId,
      method,
      url,
      type: 'request_start',
    });
  }

  logRequestEnd(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    requestId: string,
    metadata?: LogMetadata,
  ): void {
    this.info(
      `Request completed: ${method} ${url} - ${statusCode} (${duration}ms)`,
      'HTTP',
      {
        ...metadata,
        requestId,
        method,
        url,
        statusCode,
        duration,
        type: 'request_end',
      },
    );
  }

  createChildLogger(component: string): LoggingService {
    const childLogger = Object.create(this) as LoggingService;
    Object.defineProperty(childLogger, 'serviceName', {
      value: `${this.serviceName}:${component}`,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    return childLogger;
  }
}
