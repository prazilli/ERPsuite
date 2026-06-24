import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getTenant(id: string, user: any): Promise<{
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
    updateTenant(id: string, tenantName: string, user: any): Promise<{
        tenant_id: string;
        tenant_name: string;
        created_at: Date;
    }>;
}
