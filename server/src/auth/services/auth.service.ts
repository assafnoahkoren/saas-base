import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from './password.service';
import { EmailVerificationService } from './email-verification.service';
import { LoggingService } from '../../logging/logging.service';
import { RegisterDto } from '../dto/register.dto';
import { RegisterResponse } from '../interfaces/auth.interface';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly logger: LoggingService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<RegisterResponse> {
    const { email, name, password } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Validate password strength (additional check beyond DTO validation)
      const passwordValidation =
        this.passwordService.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new BadRequestException(passwordValidation.errors.join(', '));
      }

      // Hash the password
      const hashedPassword = await this.passwordService.hashPassword(password);

      // Create the user
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name: name?.trim() || null,
          password: hashedPassword,
          emailVerified: false,
        },
      });

      // Send verification email
      await this.emailVerificationService.sendVerificationEmail(
        user.id,
        user.email,
      );

      this.logger.info(`New user registered`, 'Auth', {
        userId: user.id,
        email: user.email,
        hasName: !!user.name,
      });

      return {
        success: true,
        message:
          'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          emailVerified: user.emailVerified,
        },
      };
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error('Registration failed'),
        'Auth',
        { email, hasName: !!name },
      );

      // Re-throw known exceptions
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      // Handle unexpected errors
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    return this.emailVerificationService.verifyEmailToken(token);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    return this.emailVerificationService.resendVerificationEmail(email);
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login user and return JWT tokens
   */
  login(user: AuthenticatedUser, rememberMe?: boolean) {
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    const payload: JwtPayload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? '30d' : '7d',
    });

    this.logger.info('User logged in', 'Auth', {
      userId: user.id,
      email: user.email,
      rememberMe: !!rememberMe,
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        emailVerified: user.emailVerified,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const user = await this.findUserById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload: JwtPayload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return {
        access_token: accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
