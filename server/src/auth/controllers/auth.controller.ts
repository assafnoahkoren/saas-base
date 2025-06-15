import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoggingService } from '../../logging/logging.service';
import { Log } from '../../logging/decorators/log.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggingService,
  ) {}

  /**
   * Register a new user
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: false })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    this.logger.info('User registration attempt', 'AuthController', {
      email: registerDto.email,
      hasName: !!registerDto.name,
    });

    return this.authService.register(registerDto);
  }

  /**
   * Verify email with token
   */
  @Get('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: true })
  async verifyEmail(@Param('token') token: string) {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException('Verification token is required');
    }

    this.logger.info('Email verification attempt', 'AuthController', {
      tokenLength: token.length,
    });

    return this.authService.verifyEmail(token);
  }

  /**
   * Resend verification email
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: false })
  async resendVerificationEmail(@Body('email') email: string) {
    if (!email || email.trim().length === 0) {
      throw new BadRequestException('Email is required');
    }

    this.logger.info('Resend verification email request', 'AuthController', {
      email,
    });

    return this.authService.resendVerificationEmail(email);
  }
}
