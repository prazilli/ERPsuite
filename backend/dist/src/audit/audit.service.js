"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuditService = class AuditService {
    static { AuditService_1 = this; }
    prisma;
    logger = new common_1.Logger(AuditService_1.name);
    static auditLogsBuffer = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async recordLoginAttempt(userId, emailAttempted, ipAddress, userAgent, status, failureReason = null) {
        const logId = Math.random().toString(36).substring(2, 11).toUpperCase();
        let userDetails = undefined;
        if (userId) {
            const u = await this.prisma.user.findUnique({
                where: { user_id: userId },
                include: { role: true },
            });
            if (u) {
                userDetails = {
                    id: u.user_id.toString(),
                    name: `${u.first_name} ${u.last_name}`.trim(),
                    email: u.email,
                    role: { name: u.role.role_name },
                };
            }
        }
        const logEntry = {
            id: logId,
            user_id: userId ? userId.toString() : null,
            emailAttempted,
            ipAddress,
            userAgent,
            status,
            failureReason,
            loginTime: new Date(),
            user: userDetails,
        };
        AuditService_1.auditLogsBuffer.unshift(logEntry);
        if (AuditService_1.auditLogsBuffer.length > 200) {
            AuditService_1.auditLogsBuffer.pop();
        }
        this.logger.log(`[AUDIT SECURITY TRAIL] ID: ${logId} | Status: ${status.toUpperCase()} | User: ${emailAttempted} | IP: ${ipAddress}`);
    }
    async getLoginLogs(companyId, currentUser) {
        this.verifyAdminOrAuditor(companyId, currentUser);
        const currentUserCompanyIdStr = currentUser.companyId.toString();
        return AuditService_1.auditLogsBuffer.filter((log) => {
            if (currentUser.roleName === 'Super Admin')
                return true;
            if (log.user && log.user.id) {
                return log.user_id && BigInt(log.user_id) === companyId;
            }
            const adminDomain = currentUser.email.split('@')[1];
            const attemptDomain = log.emailAttempted.split('@')[1];
            return adminDomain === attemptDomain;
        });
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
    verifyAdminOrAuditor(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        const allowedRoles = ['Company Head / CEO', 'Company Admin', 'Super Admin', 'Auditor', 'IT Head'];
        const userRole = currentUser.roleName;
        const isItHead = userRole === 'Department Head' && currentUser.departmentId && currentUser.permissions?.includes('view_audit_logs');
        if (!allowedRoles.includes(userRole) && !isItHead) {
            throw new common_1.ForbiddenException('You do not have permissions to view system security audit logs.');
        }
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map