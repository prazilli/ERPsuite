import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../cache/cache.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { RolesRepository } from './repositories/roles.repository';
import { UsersRepository } from './repositories/users.repository';
import { EmailVerificationsRepository } from './repositories/email-verifications.repository';
import { RegisterDto, LoginDto, VerifyOtpDto, ResetPasswordConfirmDto, ResetPasswordRequestDto, ResendOtpDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly cache;
    private readonly auditService;
    private readonly mailService;
    private readonly rolesRepo;
    private readonly usersRepo;
    private readonly verificationsRepo;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, cache: CacheService, auditService: AuditService, mailService: MailService, rolesRepo: RolesRepository, usersRepo: UsersRepository, verificationsRepo: EmailVerificationsRepository);
    register(dto: RegisterDto): Promise<{
        message: string;
        companyId: any;
        email: any;
    }>;
    sendOtp(userId: bigint, email: string): Promise<string>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        email: string;
        verified: boolean;
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, ipAddress: string, userAgent: string): Promise<{
        accessToken: string;
        refreshToken: string;
        verified: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            companyId: string;
            tenantId: string | null;
            departmentId: string | null;
        };
    }>;
    logout(userId: bigint): Promise<{
        success: boolean;
        message: string;
    }>;
    refreshTokens(userId: bigint, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    requestPasswordReset(dto: ResetPasswordRequestDto): Promise<{
        message: string;
        email?: undefined;
    } | {
        message: string;
        email: string;
    }>;
    confirmPasswordReset(dto: ResetPasswordConfirmDto): Promise<{
        message: string;
    }>;
    sendTestOtpEmail(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateTokens;
    getCompanies(): Promise<{
        company_id: bigint;
        company_name: string;
    }[]>;
    getDepartmentsByCompanyId(companyId: bigint): Promise<{
        department_id: bigint;
        department_name: string;
    }[]>;
}
