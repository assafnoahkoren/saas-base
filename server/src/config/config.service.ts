import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService extends ConfigService {
  // Database Configuration
  get databaseUrl(): string {
    return (
      this.get<string>('DATABASE_URL') ||
      'postgresql://postgres:postgres@localhost:5432/saas_dev'
    );
  }

  get postgresHost(): string {
    return this.get<string>('POSTGRES_HOST') || 'localhost';
  }

  get postgresPort(): number {
    return this.get<number>('POSTGRES_PORT') || 5432;
  }

  get postgresUser(): string {
    return this.get<string>('POSTGRES_USER') || 'postgres';
  }

  get postgresPassword(): string {
    return this.get<string>('POSTGRES_PASSWORD') || 'postgres';
  }

  get postgresDatabase(): string {
    return this.get<string>('POSTGRES_DATABASE') || 'saas_dev';
  }

  // Redis Configuration
  get redisUrl(): string {
    return this.get<string>('REDIS_URL') || 'redis://localhost:6379';
  }

  get redisHost(): string {
    return this.get<string>('REDIS_HOST') || 'localhost';
  }

  get redisPort(): number {
    return this.get<number>('REDIS_PORT') || 6379;
  }

  // RabbitMQ Configuration
  get rabbitmqUrl(): string {
    return (
      this.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672'
    );
  }

  get rabbitmqHost(): string {
    return this.get<string>('RABBITMQ_HOST') || 'localhost';
  }

  get rabbitmqPort(): number {
    return this.get<number>('RABBITMQ_PORT') || 5672;
  }

  get rabbitmqUser(): string {
    return this.get<string>('RABBITMQ_USER') || 'admin';
  }

  get rabbitmqPassword(): string {
    return this.get<string>('RABBITMQ_PASSWORD') || 'admin';
  }

  get rabbitmqManagementUrl(): string {
    return (
      this.get<string>('RABBITMQ_MANAGEMENT_URL') || 'http://localhost:15672'
    );
  }

  // Email Configuration (MailHog)
  get smtpHost(): string {
    return this.get<string>('SMTP_HOST') || 'localhost';
  }

  get smtpPort(): number {
    return this.get<number>('SMTP_PORT') || 1025;
  }

  get mailhogWebUrl(): string {
    return this.get<string>('MAILHOG_WEB_URL') || 'http://localhost:8025';
  }

  // Loki Configuration
  get lokiUrl(): string {
    return this.get<string>('LOKI_URL') || 'http://localhost:3100';
  }

  // Grafana Configuration
  get grafanaUrl(): string {
    return this.get<string>('GRAFANA_URL') || 'http://localhost:3000';
  }

  get grafanaUser(): string {
    return this.get<string>('GRAFANA_USER') || 'admin';
  }

  get grafanaPassword(): string {
    return this.get<string>('GRAFANA_PASSWORD') || 'admin';
  }

  // Promtail Configuration
  get promtailPort(): number {
    return this.get<number>('PROMTAIL_PORT') || 9080;
  }

  // Application Configuration
  get nodeEnv(): string {
    return this.get<string>('NODE_ENV') || 'development';
  }

  get port(): number {
    return this.get<number>('PORT') || 8888;
  }

  get logLevel(): string {
    return this.get<string>('LOG_LEVEL') || 'debug';
  }

  get enableConsoleLogger(): boolean {
    return this.get<string>('ENABLE_CONSOLE_LOGGER') === 'true';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}
