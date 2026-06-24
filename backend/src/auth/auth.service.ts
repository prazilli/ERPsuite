import { Injectable, BadRequestException, UnauthorizedException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { RolesRepository } from './repositories/roles.repository';
import { UsersRepository } from './repositories/users.repository';
import { EmailVerificationsRepository } from './repositories/email-verifications.repository';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResetPasswordConfirmDto,
  ResetPasswordRequestDto,
  ResendOtpDto
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cache: CacheService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    private readonly rolesRepo: RolesRepository,
    private readonly usersRepo: UsersRepository,
    private readonly verificationsRepo: EmailVerificationsRepository
  ) {}

  // 1. Register a new user using selected company, department, and role
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.usersRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email address is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    let user;
    try {
      user = await this.usersRepo.createUser({
        companyName: dto.companyName,
        departmentName: dto.departmentName,
        isNewDepartmentRequest: dto.isNewDepartmentRequest,
        roleId: BigInt(dto.roleId),
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        passwordHash,
        phone: dto.phone,
      });
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Registration failed');
    }

    // Generate & send OTP
    await this.sendOtp(user.user_id, user.email);

    return {
      message: 'Registration initiated successfully. Please check your verification OTP.',
      companyId: user.company_id.toString(),
      email: user.email,
    };
  }

  // 2. Generate and Send 6-Digit OTP using Database Verification Table
  async sendOtp(userId: bigint, email: string): Promise<string> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log('OTP Generated');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Save in DB using repository
    await this.verificationsRepo.create({
      userId,
      email,
      otpCode: otp,
      expiresAt,
    });
    this.logger.log('OTP Saved');

    // Log OTP directly to console simulating email dispatch
    this.logger.log(`\n==================================================\n`);
    this.logger.log(`[EMAIL DISPATCH] To: ${email}\n`);
    this.logger.log(`Subject: Amdox Technologies Verification Code\n`);
    this.logger.log(`Your 6-Digit OTP is: ${otp}\n`);
    this.logger.log(`This code will expire in 5 minutes.\n`);
    this.logger.log(`==================================================\n`);

    // Fetch user details for personalizing email
    const user = await this.usersRepo.findById(userId);
    const firstName = user?.first_name || 'User';

    // Dispatch real email asynchronously via SMTP
    try {
      await this.mailService.sendOtpEmail(email, otp, firstName);
      this.logger.log('OTP sent successfully via SMTP');
    } catch (err: any) {
      this.logger.warn(`SMTP email dispatch failed: ${err.message || err}. OTP code [${otp}] is logged to console above.`);
    }

    return otp;
  }

  // 3. Verify OTP with dynamic attempt checks inside the database
  async verifyOtp(dto: VerifyOtpDto) {
    const { email, otp, purpose } = dto;

    // Fetch the latest verification record for the email using repository
    const verification = await this.verificationsRepo.findLatestPending(email);

    if (!verification) {
      throw new BadRequestException('No pending verification found for this email.');
    }

    // 1. Check lockout (locked after 3 failures)
    if (verification.attempts >= 3) {
      throw new ForbiddenException('This verification is locked due to too many failed attempts (max 3). Please request a new OTP.');
    }

    // 2. Check Expiry
    if (new Date() > verification.expires_at) {
      this.logger.log('OTP expired');
      throw new BadRequestException('OTP code has expired. Please request a new code.');
    }

    // 3. Compare OTP
    if (verification.otp_code !== otp) {
      // Increment failure attempts in database
      const updatedAttempts = verification.attempts + 1;
      await this.verificationsRepo.incrementAttempts(verification.verification_id, verification.attempts);

      if (updatedAttempts >= 3) {
        throw new ForbiddenException('Maximum verification attempts (3) exceeded. Verification locked. Please request a new OTP.');
      }

      throw new BadRequestException(`Invalid OTP code. Attempt ${updatedAttempts} of 3 before lockout.`);
    }

    this.logger.log('OTP verified');

    // Mark as verified
    await this.verificationsRepo.markAsVerified(verification.verification_id);

    // Update user status
    if (purpose === 'registration') {
      await this.usersRepo.updateUserEmailVerified(verification.user_id, true);
    }

    return {
      message: 'OTP verified successfully.',
      email,
      verified: true,
    };
  }

  // 4. Resend OTP
  async resendOtp(dto: ResendOtpDto) {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException('No user found with this email address.');
    }

    if (user.email_verified && dto.purpose === 'registration') {
      throw new BadRequestException('This email is already verified.');
    }

    await this.sendOtp(user.user_id, user.email);

    return {
      message: 'A new OTP code has been sent to your email.',
    };
  }

  // 5. Authenticate user and save refresh token in database
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await this.usersRepo.findByEmail(dto.email);

    if (!user || !user.is_active) {
      await this.auditService.recordLoginAttempt(
        user ? user.user_id : null,
        dto.email,
        ipAddress || 'unknown',
        userAgent || 'unknown',
        'failed',
        !user ? 'User not found' : 'User is inactive'
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      await this.auditService.recordLoginAttempt(
        user.user_id,
        dto.email,
        ipAddress || 'unknown',
        userAgent || 'unknown',
        'failed',
        'Invalid credentials'
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if email verified
    if (!user.email_verified) {
      await this.auditService.recordLoginAttempt(
        user.user_id,
        dto.email,
        ipAddress || 'unknown',
        userAgent || 'unknown',
        'failed',
        'Email verification pending'
      );
      throw new BadRequestException('Please verify your email before logging in.');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.user_id, user.email);

    // Save refresh token in DB
    const hashedToken = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.user_id,
        token_hash: hashedToken,
        expires_at: expiresAt,
        revoked: false,
      },
    });

    await this.auditService.recordLoginAttempt(
      user.user_id,
      dto.email,
      ipAddress || 'unknown',
      userAgent || 'unknown',
      'success'
    );

    return {
      verified: true,
      user: {
        id: user.user_id.toString(),
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role.role_name,
        companyId: user.company_id.toString(),
        tenantId: user.company?.tenant_id ? user.company.tenant_id.toString() : null,
        departmentId: user.department_id ? user.department_id.toString() : null,
      },
      ...tokens,
    };
  }

  // 6. Invalidate Refresh Token on Logout
  async logout(userId: bigint) {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked: false },
      data: { revoked: true },
    });
    return { success: true, message: 'Logged out successfully' };
  }

  // 7. Refresh tokens using Rotation (marks old token revoked and writes new one)
  async refreshTokens(userId: bigint, refreshToken: string) {
    // Find active tokens for this user
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: { user_id: userId, revoked: false },
    });

    let matchedToken: any = null;
    for (const t of activeTokens) {
      if (t.token_hash && (await bcrypt.compare(refreshToken, t.token_hash))) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      // Revoke all tokens (token reuse/attack mitigation!)
      await this.prisma.refreshToken.updateMany({
        where: { user_id: userId },
        data: { revoked: true },
      });
      throw new ForbiddenException('Invalid or reused refresh token. Access revoked.');
    }

    // Check expiration
    if (matchedToken.expires_at && new Date() > matchedToken.expires_at) {
      throw new ForbiddenException('Refresh token expired');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(userId, matchedToken.email || '');

    // Rotate tokens (revoke old, add new)
    await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { token_id: matchedToken.token_id },
        data: { revoked: true },
      });

      const hashedNewToken = await bcrypt.hash(tokens.refreshToken, 10);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await tx.refreshToken.create({
        data: {
          user_id: userId,
          token_hash: hashedNewToken,
          expires_at: expiresAt,
          revoked: false,
        },
      });
    });

    return tokens;
  }

  // 8. Reset Password Flow: Request OTP
  async requestPasswordReset(dto: ResetPasswordRequestDto) {
    const user = await this.usersRepo.findByEmail(dto.email);

    if (!user || !user.is_active) {
      // Silent success for email enumeration security
      return { message: 'If the email exists, a password reset code has been sent.' };
    }

    await this.sendOtp(user.user_id, user.email);

    return {
      message: 'Password reset OTP code has been sent to your email.',
      email: user.email,
    };
  }

  // 9. Reset Password Flow: Reset password with OTP verify
  async confirmPasswordReset(dto: ResetPasswordConfirmDto) {
    const verifyResult = await this.verifyOtp({
      email: dto.email,
      otp: dto.otp,
      purpose: 'password_reset',
    });

    if (!verifyResult.verified) {
      throw new BadRequestException('Invalid OTP code verification');
    }

    // Find the user to update
    const user = await this.usersRepo.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      // Update Password
      await tx.user.update({
        where: { user_id: user.user_id },
        data: { password_hash: passwordHash },
      });

      // Revoke all refresh tokens
      await tx.refreshToken.updateMany({
        where: { user_id: user.user_id },
        data: { revoked: true },
      });
    });

    return {
      message: 'Password reset completed successfully. You can now login with your new credentials.',
    };
  }

  // sendTestOtpEmail: test-email dispatcher
  async sendTestOtpEmail(email: string) {
    // Generate a temporary OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.logger.log('OTP Generated');

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Find a user to associate with in order to bypass foreign key constraints
    let user = await this.usersRepo.findByEmail(email);
    if (!user) {
      user = await this.prisma.user.findFirst({
        include: { role: true, company: true },
      });
    }

    if (!user) {
      throw new BadRequestException('Cannot send test OTP. No users exist in the database to associate the record with.');
    }

    // Save in DB
    await this.verificationsRepo.create({
      userId: user.user_id,
      email,
      otpCode: otp,
      expiresAt,
    });
    this.logger.log('OTP Saved');

    const firstName = user?.first_name || 'Test User';

    // Send email
    await this.mailService.sendOtpEmail(email, otp, firstName);
    this.logger.log('OTP sent');

    return {
      success: true,
      message: 'Email sent successfully',
    };
  }

  private async generateTokens(userId: bigint, email: string) {
    const payload = { sub: userId.toString(), email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async getCompanies() {
    return this.prisma.company.findMany({
      select: {
        company_id: true,
        company_name: true,
      },
      orderBy: {
        company_name: 'asc',
      },
    });
  }

  async getDepartmentsByCompanyId(companyId: bigint) {
    return this.prisma.department.findMany({
      where: {
        company_id: companyId,
      },
      select: {
        department_id: true,
        department_name: true,
      },
      orderBy: {
        department_name: 'asc',
      },
    });
  }
}
