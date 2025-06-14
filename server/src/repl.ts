import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}

bootstrap().catch((error) => {
  console.error('REPL failed to start:', error);
  process.exit(1);
});
