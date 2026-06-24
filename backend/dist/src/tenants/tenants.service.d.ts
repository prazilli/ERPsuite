import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createTenant(name: string): Promise<{
        created_at: Date;
        tenant_id: bigint;
        tenant_name: string;
    }>;
    getTenant(tenantId: bigint, currentUser: any): Promise<{
        tenant_id: string;
        tenant_name: string;
        created_at: Date;
        companies: {
            company_id: string;
            company_name: string;
            company_type: import("@prisma/client").$Enums.CompanyType;
            created_at: Date;
        }[];
    }>;
    updateTenant(tenantId: bigint, name: string, currentUser: any): Promise<{
        tenant_id: string;
        tenant_name: string;
        created_at: Date;
    }>;
    private verifyTenantAccess;
}
