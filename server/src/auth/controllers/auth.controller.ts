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
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { LoggingService } from '../../logging/logging.service';
import { Log } from '../../logging/decorators/log.decorator';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';

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

  /**
   * Login user
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: false })
  login(
    @Request() req: Express.Request & { user: AuthenticatedUser },
    @Body() loginDto: LoginDto,
  ) {
    this.logger.info('User login successful', 'AuthController', {
      userId: req.user.id,
      email: req.user.email,
      rememberMe: !!loginDto.rememberMe,
    });

    return this.authService.login(req.user, loginDto.rememberMe);
  }

  /**
   * Refresh access token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: false })
  async refresh(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }

    return this.authService.refreshToken(refreshToken);
  }

  /**
   * Get current user
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: true })
  async getCurrentUser(@CurrentUser() user: AuthenticatedUser) {
    const fullUser = await this.authService.findUserById(user.id);

    if (!fullUser) {
      throw new BadRequestException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = fullUser;
    return userWithoutPassword;
  }

  /**
   * Logout user (client-side handling, no server-side session)
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Log({ logLevel: 'info', includeArgs: false, includeResult: false })
  // eslint-disable-next-line @typescript-eslint/require-await
  async logout(@CurrentUser() user: AuthenticatedUser) {
    this.logger.info('User logged out', 'AuthController', {
      userId: user.id,
      email: user.email,
    });

    return { message: 'Logout successful' };
  }
}
