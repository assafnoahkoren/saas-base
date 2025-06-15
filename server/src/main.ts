import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get services
  const logger = app.get(LoggingService);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: true, // Allow any origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  logger.info('CORS enabled for all origins', 'Bootstrap');

  // Set the logging service as the default logger
  app.useLogger(logger);

  const port = process.env.PORT ?? 8888;

  await app.listen(port);

  logger.info(`Application is running on port ${port}`, 'Bootstrap', {
    port: Number(port),
    environment: process.env.NODE_ENV || 'development',
  });
}

bootstrap().catch((error) => {
  console.error('Application failed to start:', error);
  process.exit(1);
});
