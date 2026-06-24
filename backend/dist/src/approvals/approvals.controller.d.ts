import { ApprovalsService } from './approvals.service';
export declare class ApprovalsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
    getPendingApprovals(user: any): Promise<({
        requested_by: {
            role: {
                role_id: bigint;
                role_name: string;
                description: string | null;
            };
        } & {
            role_id: bigint;
            user_id: bigint;
            email: string;
            company_id: bigint;
            department_id: bigint | null;
            first_name: string | null;
            last_name: string | null;
            password_hash: string;
            phone: string | null;
            is_active: boolean;
            email_verified: boolean;
            created_at: Date;
        };
    } & {
        company_id: bigint;
        created_at: Date;
        status: string;
        updated_at: Date;
        requested_by_id: bigint;
        approved_by_id: bigint | null;
        approval_id: bigint;
        module: string;
        record_id: bigint;
        comments: string | null;
    })[]>;
    actionApproval(approvalId: string, action: 'APPROVED' | 'REJECTED', comments: string, user: any): Promise<{
        company_id: bigint;
        created_at: Date;
        status: string;
        updated_at: Date;
        requested_by_id: bigint;
        approved_by_id: bigint | null;
        approval_id: bigint;
        module: string;
        record_id: bigint;
        comments: string | null;
    }>;
}
