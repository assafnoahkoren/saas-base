import { Injectable } from '@nestjs/common';
import { LoggingService } from './logging/logging.service';
import { Log } from './logging/decorators/log.decorator';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggingService) {}

  @Log({ logLevel: 'info', includeResult: true })
  getHello(): string {
    this.logger.info('Hello endpoint called', 'AppService');
    return 'Hello World!';
  }
}
