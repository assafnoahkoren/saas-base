import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Get the logging service and set it as the default logger
  const logger = app.get(LoggingService);
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
