import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto, ResetPasswordRequestDto, ResetPasswordConfirmDto, TestEmailDto, ResendOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        companyId: any;
        email: any;
    }>;
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
    refresh(refreshToken: string, userId: string | number): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    resetPasswordRequest(dto: ResetPasswordRequestDto): Promise<{
        message: string;
        email?: undefined;
    } | {
        message: string;
        email: string;
    }>;
    resetPasswordConfirm(dto: ResetPasswordConfirmDto): Promise<{
        message: string;
    }>;
    testEmail(dto: TestEmailDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getCompanies(): Promise<{
        company_id: bigint;
        company_name: string;
    }[]>;
    getDepartments(companyId: string): Promise<{
        department_id: bigint;
        department_name: string;
    }[]>;
}
