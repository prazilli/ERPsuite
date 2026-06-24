import { CrmService } from './crm.service';
export declare class CrmController {
    private readonly crmService;
    constructor(crmService: CrmService);
    getLeads(user: any): Promise<{
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
    createLead(body: any, user: any): Promise<{
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
    updateLead(leadId: string, body: any, user: any): Promise<{
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
    deleteLead(leadId: string, user: any): Promise<{
        success: boolean;
    }>;
    getClients(user: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        client_id: bigint;
        address: string | null;
    }[]>;
    createClient(body: any, user: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        created_at: Date;
        client_id: bigint;
        address: string | null;
    }>;
}
