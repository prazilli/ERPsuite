import { PrismaService } from '../prisma/prisma.service';
export declare class RequestsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    submitRequest(companyId: number, data: any, currentUser: any): Promise<{
        description: string | null;
        company_id: bigint;
        created_at: Date;
        department_name: string;
        request_id: bigint;
        status: string;
        updated_at: Date;
        requested_by_id: bigint;
        approved_by_id: bigint | null;
    }>;
    findAll(companyId: number, currentUser: any): Promise<({
        requested_by: {
            user_id: bigint;
            email: string;
            first_name: string | null;
            last_name: string | null;
        };
        approved_by: {
            user_id: bigint;
            email: string;
            first_name: string | null;
            last_name: string | null;
        } | null;
    } & {
        description: string | null;
        company_id: bigint;
        created_at: Date;
        department_name: string;
        request_id: bigint;
        status: string;
        updated_at: Date;
        requested_by_id: bigint;
        approved_by_id: bigint | null;
    })[]>;
    approveRequest(requestId: number, currentUser: any): Promise<{
        request: {
            description: string | null;
            company_id: bigint;
            created_at: Date;
            department_name: string;
            request_id: bigint;
            status: string;
            updated_at: Date;
            requested_by_id: bigint;
            approved_by_id: bigint | null;
        };
        department: {
            description: string | null;
            company_id: bigint;
            department_id: bigint;
            created_at: Date;
            department_name: string;
            is_custom: boolean;
            created_by: bigint | null;
        };
    }>;
    rejectRequest(requestId: number, currentUser: any): Promise<{
        description: string | null;
        company_id: bigint;
        created_at: Date;
        department_name: string;
        request_id: bigint;
        status: string;
        updated_at: Date;
        requested_by_id: bigint;
        approved_by_id: bigint | null;
    }>;
    private verifyTenant;
    private verifyCompanyAdmin;
}
