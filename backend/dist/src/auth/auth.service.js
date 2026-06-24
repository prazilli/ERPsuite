"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const cache_service_1 = require("../cache/cache.service");
const audit_service_1 = require("../audit/audit.service");
const mail_service_1 = require("../mail/mail.service");
const roles_repository_1 = require("./repositories/roles.repository");
const users_repository_1 = require("./repositories/users.repository");
const email_verifications_repository_1 = require("./repositories/email-verifications.repository");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    cache;
    auditService;
    mailService;
    rolesRepo;
    usersRepo;
    verificationsRepo;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, cache, auditService, mailService, rolesRepo, usersRepo, verificationsRepo) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.cache = cache;
        this.auditService = auditService;
        this.mailService = mailService;
        this.rolesRepo = rolesRepo;
        this.usersRepo = usersRepo;
        this.verificationsRepo = verificationsRepo;
    }
    async register(dto) {
        const existingUser = await this.usersRepo.findByEmail(dto.email);
        if (existingUser) {
            throw new common_1.BadRequestException('Email address is already registered');
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
        }
        catch (err) {
            throw new common_1.BadRequestException(err.message || 'Registration failed');
        }
        await this.sendOtp(user.user_id, user.email);
        return {
            message: 'Registration initiated successfully. Please check your verification OTP.',
            companyId: user.company_id.toString(),
            email: user.email,
        };
    }
    async sendOtp(userId, email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.logger.log('OTP Generated');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await this.verificationsRepo.create({
            userId,
            email,
            otpCode: otp,
            expiresAt,
        });
        this.logger.log('OTP Saved');
        this.logger.log(`\n==================================================\n`);
        this.logger.log(`[EMAIL DISPATCH] To: ${email}\n`);
        this.logger.log(`Subject: Amdox Technologies Verification Code\n`);
        this.logger.log(`Your 6-Digit OTP is: ${otp}\n`);
        this.logger.log(`This code will expire in 5 minutes.\n`);
        this.logger.log(`==================================================\n`);
        const user = await this.usersRepo.findById(userId);
        const firstName = user?.first_name || 'User';
        try {
            await this.mailService.sendOtpEmail(email, otp, firstName);
            this.logger.log('OTP sent successfully via SMTP');
        }
        catch (err) {
            this.logger.warn(`SMTP email dispatch failed: ${err.message || err}. OTP code [${otp}] is logged to console above.`);
        }
        return otp;
    }
    async verifyOtp(dto) {
        const { email, otp, purpose } = dto;
        const verification = await this.verificationsRepo.findLatestPending(email);
        if (!verification) {
            throw new common_1.BadRequestException('No pending verification found for this email.');
        }
        if (verification.attempts >= 3) {
            throw new common_1.ForbiddenException('This verification is locked due to too many failed attempts (max 3). Please request a new OTP.');
        }
        if (new Date() > verification.expires_at) {
            this.logger.log('OTP expired');
            throw new common_1.BadRequestException('OTP code has expired. Please request a new code.');
        }
        if (verification.otp_code !== otp) {
            const updatedAttempts = verification.attempts + 1;
            await this.verificationsRepo.incrementAttempts(verification.verification_id, verification.attempts);
            if (updatedAttempts >= 3) {
                throw new common_1.ForbiddenException('Maximum verification attempts (3) exceeded. Verification locked. Please request a new OTP.');
            }
            throw new common_1.BadRequestException(`Invalid OTP code. Attempt ${updatedAttempts} of 3 before lockout.`);
        }
        this.logger.log('OTP verified');
        await this.verificationsRepo.markAsVerified(verification.verification_id);
        if (purpose === 'registration') {
            await this.usersRepo.updateUserEmailVerified(verification.user_id, true);
        }
        return {
            message: 'OTP verified successfully.',
            email,
            verified: true,
        };
    }
    async resendOtp(dto) {
        const user = await this.usersRepo.findByEmail(dto.email);
        if (!user) {
            throw new common_1.BadRequestException('No user found with this email address.');
        }
        if (user.email_verified && dto.purpose === 'registration') {
            throw new common_1.BadRequestException('This email is already verified.');
        }
        await this.sendOtp(user.user_id, user.email);
        return {
            message: 'A new OTP code has been sent to your email.',
        };
    }
    async login(dto, ipAddress, userAgent) {
        const user = await this.usersRepo.findByEmail(dto.email);
        if (!user || !user.is_active) {
            await this.auditService.recordLoginAttempt(user ? user.user_id : null, dto.email, ipAddress || 'unknown', userAgent || 'unknown', 'failed', !user ? 'User not found' : 'User is inactive');
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
        if (!isPasswordValid) {
            await this.auditService.recordLoginAttempt(user.user_id, dto.email, ipAddress || 'unknown', userAgent || 'unknown', 'failed', 'Invalid credentials');
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.email_verified) {
            await this.auditService.recordLoginAttempt(user.user_id, dto.email, ipAddress || 'unknown', userAgent || 'unknown', 'failed', 'Email verification pending');
            throw new common_1.BadRequestException('Please verify your email before logging in.');
        }
        const tokens = await this.generateTokens(user.user_id, user.email);
        const hashedToken = await bcrypt.hash(tokens.refreshToken, 10);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                user_id: user.user_id,
                token_hash: hashedToken,
                expires_at: expiresAt,
                revoked: false,
            },
        });
        await this.auditService.recordLoginAttempt(user.user_id, dto.email, ipAddress || 'unknown', userAgent || 'unknown', 'success');
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
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { user_id: userId, revoked: false },
            data: { revoked: true },
        });
        return { success: true, message: 'Logged out successfully' };
    }
    async refreshTokens(userId, refreshToken) {
        const activeTokens = await this.prisma.refreshToken.findMany({
            where: { user_id: userId, revoked: false },
        });
        let matchedToken = null;
        for (const t of activeTokens) {
            if (t.token_hash && (await bcrypt.compare(refreshToken, t.token_hash))) {
                matchedToken = t;
                break;
            }
        }
        if (!matchedToken) {
            await this.prisma.refreshToken.updateMany({
                where: { user_id: userId },
                data: { revoked: true },
            });
            throw new common_1.ForbiddenException('Invalid or reused refresh token. Access revoked.');
        }
        if (matchedToken.expires_at && new Date() > matchedToken.expires_at) {
            throw new common_1.ForbiddenException('Refresh token expired');
        }
        const tokens = await this.generateTokens(userId, matchedToken.email || '');
        await this.prisma.$transaction(async (tx) => {
            await tx.refreshToken.update({
                where: { token_id: matchedToken.token_id },
                data: { revoked: true },
            });
            const hashedNewToken = await bcrypt.hash(tokens.refreshToken, 10);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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
    async requestPasswordReset(dto) {
        const user = await this.usersRepo.findByEmail(dto.email);
        if (!user || !user.is_active) {
            return { message: 'If the email exists, a password reset code has been sent.' };
        }
        await this.sendOtp(user.user_id, user.email);
        return {
            message: 'Password reset OTP code has been sent to your email.',
            email: user.email,
        };
    }
    async confirmPasswordReset(dto) {
        const verifyResult = await this.verifyOtp({
            email: dto.email,
            otp: dto.otp,
            purpose: 'password_reset',
        });
        if (!verifyResult.verified) {
            throw new common_1.BadRequestException('Invalid OTP code verification');
        }
        const user = await this.usersRepo.findByEmail(dto.email);
        if (!user) {
            throw new common_1.BadRequestException('User not found.');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { user_id: user.user_id },
                data: { password_hash: passwordHash },
            });
            await tx.refreshToken.updateMany({
                where: { user_id: user.user_id },
                data: { revoked: true },
            });
        });
        return {
            message: 'Password reset completed successfully. You can now login with your new credentials.',
        };
    }
    async sendTestOtpEmail(email) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.logger.log('OTP Generated');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        let user = await this.usersRepo.findByEmail(email);
        if (!user) {
            user = await this.prisma.user.findFirst({
                include: { role: true, company: true },
            });
        }
        if (!user) {
            throw new common_1.BadRequestException('Cannot send test OTP. No users exist in the database to associate the record with.');
        }
        await this.verificationsRepo.create({
            userId: user.user_id,
            email,
            otpCode: otp,
            expiresAt,
        });
        this.logger.log('OTP Saved');
        const firstName = user?.first_name || 'Test User';
        await this.mailService.sendOtpEmail(email, otp, firstName);
        this.logger.log('OTP sent');
        return {
            success: true,
            message: 'Email sent successfully',
        };
    }
    async generateTokens(userId, email) {
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
    async getDepartmentsByCompanyId(companyId) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        cache_service_1.CacheService,
        audit_service_1.AuditService,
        mail_service_1.MailService,
        roles_repository_1.RolesRepository,
        users_repository_1.UsersRepository,
        email_verifications_repository_1.EmailVerificationsRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map