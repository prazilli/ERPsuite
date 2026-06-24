export declare class RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    companyName: string;
    departmentName?: string;
    isNewDepartmentRequest?: boolean;
    roleId: string | number;
}
export declare class ResendOtpDto {
    email: string;
    purpose: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
    purpose: string;
}
export declare class ResetPasswordRequestDto {
    email: string;
}
export declare class ResetPasswordConfirmDto {
    email: string;
    otp: string;
    newPassword: string;
}
export declare class TestEmailDto {
    email: string;
}
