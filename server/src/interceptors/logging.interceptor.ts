import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { LoggingService } from '../logging/logging.service';

interface RequestWithId extends Request {
  requestId: string;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithId>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = uuidv4();

    // Add request ID to request object for later use
    request.requestId = requestId;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, url, headers, body, query, params } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress || '';
    const startTime = Date.now();

    // Log request start
    this.logger.logRequestStart(method, url, requestId, {
      userAgent,
      ip,
      body: this.sanitizeBody(body),
      query,
      params,
    });

    return next.handle().pipe(
      tap({
        next: (data: unknown) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.logRequestEnd(
            method,
            url,
            statusCode,
            duration,
            requestId,
            {
              userAgent,
              ip,
              responseSize: JSON.stringify(data).length,
            },
          );
        },
        error: (error: unknown) => {
          const duration = Date.now() - startTime;
          const errorObj = error as Error & { status?: number };
          const statusCode = errorObj.status || response.statusCode || 500;

          this.logger.error(
            `Request failed: ${method} ${url} - ${statusCode} (${duration}ms)`,
            errorObj.stack,
            'HTTP',
            {
              requestId,
              method,
              url,
              statusCode,
              duration,
              userAgent,
              ip,
              errorName: errorObj.name,
              errorMessage: errorObj.message,
              type: 'request_error',
            },
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'key',
      'authorization',
    ];

    const sanitized: Record<string, unknown> = {
      ...(body as Record<string, unknown>),
    };

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
