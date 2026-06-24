import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
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
    role: { name: string };
  };
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  // Shared global in-memory audit buffer
  private static readonly auditLogsBuffer: AuditLogEntry[] = [];

  constructor(private readonly prisma: PrismaService) {}

  // Log a login attempt (called by AuthService)
  async recordLoginAttempt(
    userId: bigint | null,
    emailAttempted: string,
    ipAddress: string,
    userAgent: string,
    status: 'success' | 'failed',
    failureReason: string | null = null
  ) {
    const logId = Math.random().toString(36).substring(2, 11).toUpperCase();
    
    let userDetails: any = undefined;
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

    const logEntry: AuditLogEntry = {
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

    // Push to buffer and keep it capped at 200 logs
    AuditService.auditLogsBuffer.unshift(logEntry);
    if (AuditService.auditLogsBuffer.length > 200) {
      AuditService.auditLogsBuffer.pop();
    }

    this.logger.log(`[AUDIT SECURITY TRAIL] ID: ${logId} | Status: ${status.toUpperCase()} | User: ${emailAttempted} | IP: ${ipAddress}`);
  }

  async getLoginLogs(companyId: bigint, currentUser: any) {
    this.verifyAdminOrAuditor(companyId, currentUser);

    const currentUserCompanyIdStr = currentUser.companyId.toString();

    // Filter buffer logs by matching company domain or company ID
    return AuditService.auditLogsBuffer.filter((log) => {
      // Super admin sees everything
      if (currentUser.roleName === 'Super Admin') return true;

      // Match by company association
      if (log.user && log.user.id) {
        return log.user_id && BigInt(log.user_id) === companyId;
      }

      // Fallback: match by email domain match
      const adminDomain = currentUser.email.split('@')[1];
      const attemptDomain = log.emailAttempted.split('@')[1];
      return adminDomain === attemptDomain;
    });
  }

  private verifyTenant(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }

  private verifyAdminOrAuditor(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    
    const allowedRoles = ['Company Head / CEO', 'Company Admin', 'Super Admin', 'Auditor', 'IT Head'];
    const userRole = currentUser.roleName;

    const isItHead = userRole === 'Department Head' && currentUser.departmentId && currentUser.permissions?.includes('view_audit_logs');

    if (!allowedRoles.includes(userRole) && !isItHead) {
      throw new ForbiddenException('You do not have permissions to view system security audit logs.');
    }
  }
}
