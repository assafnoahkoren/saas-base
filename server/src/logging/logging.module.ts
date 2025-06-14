import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingService } from './logging.service';
import { AppConfigService } from '../config/config.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [AppConfigService, LoggingService],
  exports: [LoggingService, AppConfigService],
})
export class LoggingModule {}
