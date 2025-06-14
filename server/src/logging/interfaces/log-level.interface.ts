export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogMetadata {
  [key: string]: any;
  requestId?: string;
  userId?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
  stack?: string;
  name?: string;
}

export interface LogContext {
  service: string;
  component?: string;
  method?: string;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  metadata?: LogMetadata;
  timestamp: Date;
  error?: Error;
}
