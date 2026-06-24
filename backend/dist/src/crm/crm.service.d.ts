import { PrismaService } from '../prisma/prisma.service';
export declare class CrmService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getLeads(companyId: bigint, currentUser: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        status: string;
        lead_id: bigint;
        value: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
    }[]>;
    createLead(companyId: bigint, data: any, currentUser: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        status: string;
        lead_id: bigint;
        value: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
    }>;
    updateLead(leadId: bigint, data: any, currentUser: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        status: string;
        lead_id: bigint;
        value: import("@prisma/client/runtime/library").Decimal;
        source: string | null;
    }>;
    deleteLead(leadId: bigint, currentUser: any): Promise<{
        success: boolean;
    }>;
    getClients(companyId: bigint, currentUser: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        client_id: bigint;
        address: string | null;
    }[]>;
    createClient(companyId: bigint, data: any, currentUser: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        client_id: bigint;
        address: string | null;
    }>;
    private verifyTenant;
}
