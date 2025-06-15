import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [PrismaModule, LoggingModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, EmailVerificationService],
  exports: [AuthService, PasswordService, EmailVerificationService],
})
export class AuthModule {}
