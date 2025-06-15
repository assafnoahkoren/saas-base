import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/logging.service';
import { AppConfigService } from '../../config/config.service';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggingService,
    private readonly config: AppConfigService,
  ) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    // Use MailHog for development
    this.transporter = nodemailer.createTransport({
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: false, // true for 465, false for other ports
      auth: undefined, // MailHog doesn't require auth
    });

    this.logger.info(
      'Email transporter initialized for development',
      'EmailVerification',
    );
  }

  /**
   * Generate a secure verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create and send email verification token
   */
  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const token = this.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store token in database
    await this.prisma.emailVerificationToken.create({
      data: {
        token,
        email,
        userId,
        expiresAt,
      },
    });

    // Send verification email
    const verificationUrl = `${this.config.isDevelopment ? 'http://localhost:5173' : 'https://yourdomain.com'}/verify-email/${token}`;

    const mailOptions = {
      from: '"SaaS App" <noreply@saasapp.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to SaaS App!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.info(
        `Verification email sent to ${email}`,
        'EmailVerification',
        {
          userId,
          email,
          tokenExpiry: expiresAt,
        },
      );
    } catch (error) {
      this.logger.logError(
        error instanceof Error
          ? error
          : new Error('Failed to send verification email'),
        'EmailVerification',
        { userId, email },
      );
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Verify email token and mark user as verified
   */
  async verifyEmailToken(
    token: string,
  ): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Find the token
      const verificationToken =
        await this.prisma.emailVerificationToken.findUnique({
          where: { token },
          include: { user: true },
        });

      if (!verificationToken) {
        return {
          success: false,
          message: 'Invalid verification token',
        };
      }

      // Check if token has expired
      if (new Date() > verificationToken.expiresAt) {
        // Clean up expired token
        await this.prisma.emailVerificationToken.delete({
          where: { id: verificationToken.id },
        });

        return {
          success: false,
          message: 'Verification token has expired',
        };
      }

      // Update user as verified
      await this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Delete the used token
      await this.prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      this.logger.info(`Email verified successfully`, 'EmailVerification', {
        userId: verificationToken.userId,
        email: verificationToken.email,
      });

      return {
        success: true,
        message: 'Email verified successfully',
        userId: verificationToken.userId,
      };
    } catch (error) {
      this.logger.logError(
        error instanceof Error ? error : new Error('Email verification failed'),
        'EmailVerification',
        { token },
      );

      return {
        success: false,
        message: 'Email verification failed',
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.emailVerified) {
        return {
          success: false,
          message: 'Email is already verified',
        };
      }

      // Delete any existing tokens for this user
      await this.prisma.emailVerificationToken.deleteMany({
        where: { userId: user.id },
      });

      // Send new verification email
      await this.sendVerificationEmail(user.id, user.email);

      return {
        success: true,
        message: 'Verification email sent',
      };
    } catch (error) {
      this.logger.logError(
        error instanceof Error
          ? error
          : new Error('Failed to resend verification email'),
        'EmailVerification',
        { email },
      );

      return {
        success: false,
        message: 'Failed to resend verification email',
      };
    }
  }

  /**
   * Clean up expired tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.prisma.emailVerificationToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      this.logger.info(
        `Cleaned up ${result.count} expired email verification tokens`,
        'EmailVerification',
      );
      return result.count;
    } catch (error) {
      this.logger.logError(
        error instanceof Error
          ? error
          : new Error('Failed to cleanup expired tokens'),
        'EmailVerification',
      );
      return 0;
    }
  }
}
