import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLoginLogs(companyId: number, user: any): Promise<import("./audit.service").AuditLogEntry[]>;
}
