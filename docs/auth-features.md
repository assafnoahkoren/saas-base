# Authentication Features Documentation

## Overview
This document outlines the authentication system for our SaaS application, including current features to implement and future SSO integration planning.

## Core Authentication Features

### 1. User Registration
**Description**: Allow new users to create accounts with email and password.

**Features**:
- Email/password signup form
- Input validation and sanitization
- Password strength requirements (min 8 chars, uppercase, lowercase, number, special char)
- Email uniqueness validation
- Account creation with email verification requirement

**Database Schema**:
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  password          String?   // Nullable for SSO users
  emailVerified     Boolean   @default(false)
  emailVerifiedAt   DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Auth tokens
  emailTokens       EmailVerificationToken[]
  passwordTokens    PasswordResetToken[]
  
  // Future SSO support
  authProviders     UserAuthProvider[]
  
  @@map("users")
}
```

**API Endpoints**:
- `POST /auth/register` - Create new user account
- `POST /auth/verify-email` - Verify email with token

**Frontend Components**:
- `RegisterForm` - Registration form with validation
- `EmailVerificationPrompt` - Prompt to check email
- React Router routes: `/register`, `/verify-email`

---

### 2. User Login
**Description**: Authenticate existing users and provide secure session management.

**Features**:
- Email/password authentication
- JWT token generation and validation
- Refresh token mechanism
- Session management
- Rate limiting (5 attempts per 15 minutes)
- Remember me functionality
- Account lockout after failed attempts

**Security Measures**:
- bcrypt password hashing (salt rounds: 12)
- JWT with short expiration (15 minutes) + refresh tokens (7 days)
- HttpOnly cookies for refresh tokens
- CSRF protection

**API Endpoints**:
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate session

**Frontend Components**:
- `LoginForm` - Login form with validation
- `AuthContext` - Global auth state management
- React Router routes: `/login`

---

### 3. Email Verification
**Description**: Verify user email addresses during registration and email changes.

**Features**:
- Generate secure verification tokens
- Send verification emails via MailHog (dev) / SendGrid (prod)
- Token expiration (24 hours)
- Resend verification flow
- Account activation upon verification

**Database Schema**:
```prisma
model EmailVerificationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  userId    String
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("email_verification_tokens")
}
```

**API Endpoints**:
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email

**Frontend Components**:
- `EmailVerificationPage` - Email verification success/error
- `ResendVerificationButton` - Resend verification email
- React Router routes: `/verify-email/:token`

---

### 4. Password Reset
**Description**: Allow users to securely reset forgotten passwords.

**Features**:
- Generate secure reset tokens
- Send password reset emails
- Token validation and expiration (1 hour)
- New password setting with strength validation
- Security notification emails
- Invalidate all existing sessions on password change

**Database Schema**:
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("password_reset_tokens")
}
```

**API Endpoints**:
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)

**Frontend Components**:
- `ForgotPasswordForm` - Request password reset
- `ResetPasswordForm` - Reset password with token
- `ChangePasswordForm` - Change password (in settings)
- React Router routes: `/forgot-password`, `/reset-password/:token`

---

## Frontend Setup Requirements

### React Router Dependencies
```bash
cd webapp
npm install react-router-dom @types/react-router-dom
```

### Route Structure
```typescript
// App routing structure
/login           - Login page
/register        - Registration page
/forgot-password - Password reset request
/reset-password/:token - Password reset form
/verify-email/:token - Email verification
/dashboard       - Protected main app (requires auth)
/settings        - User settings (requires auth)
```

### Protected Routes Implementation
```typescript
// ProtectedRoute component
// AuthContext for global state
// Route guards with redirect logic
// Persistent auth state (localStorage/sessionStorage)
```

---

## Security Considerations

### Password Security
- **Hashing**: bcrypt with salt rounds 12
- **Strength Requirements**: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

### Token Security
- **JWT Access Tokens**: Short expiration (15 minutes)
- **Refresh Tokens**: HttpOnly cookies, 7 days expiration
- **Verification Tokens**: Cryptographically secure, 24 hours expiration
- **Reset Tokens**: Cryptographically secure, 1 hour expiration

### Rate Limiting
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 requests per hour per email
- **Email Verification**: 5 requests per hour per email

### Input Validation
- Email format validation
- Password strength validation
- SQL injection prevention
- XSS protection
- CSRF tokens

---

## Future SSO Support Planning

### Google OAuth 2.0 Integration
**Preparation for future implementation**:

**Database Schema Extensions**:
```prisma
model UserAuthProvider {
  id           String   @id @default(cuid())
  userId       String
  provider     String   // 'google', 'github', etc.
  providerId   String   // Provider's user ID
  email        String
  name         String?
  avatarUrl    String?
  accessToken  String?  // Encrypted
  refreshToken String?  // Encrypted
  expiresAt    DateTime?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerId])
  @@map("user_auth_providers")
}

enum AuthProvider {
  LOCAL
  GOOGLE
  GITHUB
  
  @@map("auth_providers")
}
```

**Future API Endpoints**:
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Handle OAuth callback
- `POST /auth/link-provider` - Link SSO account to existing account
- `DELETE /auth/unlink-provider` - Unlink SSO account

**Frontend Considerations**:
- OAuth popup/redirect handling
- Account linking UI for existing users
- Provider selection on login/register
- Account settings for managing linked providers

### Account Linking Strategy
- **New Users**: Create account with SSO profile data
- **Existing Users**: Link SSO account to existing email
- **Conflicting Emails**: Provide account linking flow
- **Profile Sync**: Keep name/avatar updated from SSO

---

## Implementation Priority

### Phase 1: Core Auth (High Priority)
1. User registration with email/password
2. User login with JWT tokens
3. Basic password reset functionality
4. Email verification system

### Phase 2: Security & UX (Medium Priority)
1. Rate limiting implementation
2. Account lockout mechanisms
3. Remember me functionality
4. Password strength enforcement

### Phase 3: Advanced Features (Low Priority)
1. Session management (view active sessions)
2. Two-factor authentication (TOTP)
3. Security notifications
4. Account recovery options

### Phase 4: SSO Integration (Future)
1. Google OAuth integration
2. Account linking system
3. Provider management UI
4. Migration tools for existing users

---

## Technical Dependencies

### Backend (NestJS)
- `@nestjs/jwt` - JWT token handling
- `@nestjs/passport` - Authentication strategies
- `passport-local` - Local auth strategy
- `passport-google-oauth20` - Google OAuth (future)
- `bcrypt` - Password hashing
- `class-validator` - Input validation
- `nodemailer` - Email sending
- `rate-limiter-flexible` - Rate limiting

### Frontend (React)
- `react-router-dom` - Client-side routing
- `@tanstack/react-query` - API state management
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `axios` - HTTP client

### Email Service
- Development: MailHog (already configured)
- Production: SendGrid or AWS SES

---

## Database Migrations

### Initial Auth Migration
```sql
-- Extend users table
ALTER TABLE users ADD COLUMN password VARCHAR(255);
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP;

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
  id VARCHAR(25) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_id VARCHAR(25) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
  id VARCHAR(25) PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id VARCHAR(25) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Future SSO support
CREATE TABLE user_auth_providers (
  id VARCHAR(25) PRIMARY KEY,
  user_id VARCHAR(25) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(provider, provider_id)
);
```

---

## Testing Strategy

### Unit Tests
- Password hashing/validation
- JWT token generation/validation
- Email/password validation
- Rate limiting logic

### Integration Tests
- Registration flow end-to-end
- Login flow with valid/invalid credentials
- Password reset flow
- Email verification flow

### E2E Tests
- Complete user registration journey
- Login and access protected routes
- Password reset with email
- Email verification process

---

This documentation serves as the blueprint for implementing a secure, scalable authentication system with future SSO capabilities.