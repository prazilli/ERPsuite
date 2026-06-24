import { PrismaService } from '../prisma/prisma.service';
export interface AuditLogEntry {
    id: string;
    user_id: string | null;
    emailAttempted: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed';
    failureReason: string | null;
    loginTime: Date;
    user?: {
        id: string;
        name: string;
        email: string;
        role: {
            name: string;
        };
    };
}
export declare class AuditService {
    private readonly prisma;
    private readonly logger;
    private static readonly auditLogsBuffer;
    constructor(prisma: PrismaService);
    recordLoginAttempt(userId: bigint | null, emailAttempted: string, ipAddress: string, userAgent: string, status: 'success' | 'failed', failureReason?: string | null): Promise<void>;
    getLoginLogs(companyId: bigint, currentUser: any): Promise<AuditLogEntry[]>;
    private verifyTenant;
    private verifyAdminOrAuditor;
}
