import { PrismaService } from '../../prisma/prisma.service';
export declare class EmailVerificationsRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: bigint | number;
        email: string;
        otpCode: string;
        expiresAt: Date;
    }): Promise<{
        user_id: bigint;
        email: string;
        created_at: Date;
        verification_id: bigint;
        otp_code: string;
        expires_at: Date;
        attempts: number;
        verified: boolean;
    }>;
    findLatestPending(email: string): Promise<{
        user_id: bigint;
        email: string;
        created_at: Date;
        verification_id: bigint;
        otp_code: string;
        expires_at: Date;
        attempts: number;
        verified: boolean;
    } | null>;
    incrementAttempts(verificationId: bigint | number, currentAttempts: number): Promise<{
        user_id: bigint;
        email: string;
        created_at: Date;
        verification_id: bigint;
        otp_code: string;
        expires_at: Date;
        attempts: number;
        verified: boolean;
    }>;
    markAsVerified(verificationId: bigint | number): Promise<{
        user_id: bigint;
        email: string;
        created_at: Date;
        verification_id: bigint;
        otp_code: string;
        expires_at: Date;
        attempts: number;
        verified: boolean;
    }>;
}
