import { RequestsService } from './requests.service';
export declare class RequestsController {
    private readonly requestsService;
    constructor(requestsService: RequestsService);
    submitRequest(companyId: number, body: any, user: any): Promise<{
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
    findAll(companyId: number, user: any): Promise<({
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
    approveRequest(id: number, user: any): Promise<{
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
    rejectRequest(id: number, user: any): Promise<{
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
}
