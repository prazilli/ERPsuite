import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get pending approvals in company
  async getPendingApprovals(companyId: bigint, currentUser: any) {
    this.verifyAdminOrDeptHead(companyId, currentUser);

    const isDeptHead = currentUser.roleName === 'Department Head' || currentUser.roleName === 'DEPARTMENT_HEAD';
    const isCeo = currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'CEO';

    return this.prisma.approval.findMany({
      where: {
        company_id: companyId,
        status: 'PENDING',
        ...(isDeptHead ? {
          requested_by: {
            department_id: currentUser.departmentId,
            role: {
              role_name: {
                notIn: ['Department Head', 'DEPARTMENT_HEAD'],
              },
            },
          },
        } : isCeo ? {
          OR: [
            { module: { not: 'LEAVE_REQUEST' } },
            { requested_by: { role: { role_name: { in: ['Department Head', 'DEPARTMENT_HEAD'] } } } },
          ],
        } : {}),
      },
      include: {
        requested_by: {
          include: { role: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Action approval request (APPROVE/REJECT)
  async actionApproval(approvalId: bigint, action: 'APPROVED' | 'REJECTED', comments: string, currentUser: any) {
    const approval = await this.prisma.approval.findUnique({
      where: { approval_id: approvalId },
      include: { requested_by: true },
    });

    if (!approval) throw new NotFoundException('Approval request not found');
    this.verifyAdminOrDeptHead(approval.company_id, currentUser);

    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval request has already been processed. Current status: ' + approval.status);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Approval record
      const updatedApproval = await tx.approval.update({
        where: { approval_id: approvalId },
        data: {
          status: action,
          comments,
          approved_by_id: BigInt(currentUser.id),
        },
      });

      const recordId = approval.record_id;

      // 2. Handle secondary module updates based on module type
      if (approval.module === 'LEAVE_REQUEST') {
        const leave = await tx.leaveRequest.findUnique({ where: { leave_id: recordId } });
        if (!leave) throw new NotFoundException('Leave record not found');

        // Update Leave request status
        await tx.leaveRequest.update({
          where: { leave_id: recordId },
          data: { status: action },
        });

        // Deduct balance on approval
        if (action === 'APPROVED') {
          const start = new Date(leave.start_date);
          const end = new Date(leave.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          await tx.leaveBalance.updateMany({
            where: { user_id: leave.user_id, leave_type: leave.leave_type },
            data: {
              used: {
                increment: days,
              },
            },
          });
        }

        // Notify employee
        await tx.notification.create({
          data: {
            user_id: leave.user_id,
            title: `Leave Request ${action.toLowerCase()}`,
            message: `Your leave request for ${leave.leave_type} (${leave.start_date.toISOString().substring(0, 10)}) has been ${action.toLowerCase()}.${comments ? ` Reason: ${comments}` : ''}`,
            is_read: false,
          },
        });
      }
      else if (approval.module === 'EXPENSE') {
        const expense = await tx.expense.findUnique({ where: { expense_id: recordId } });
        if (!expense) throw new NotFoundException('Expense record not found');

        await tx.expense.update({
          where: { expense_id: recordId },
          data: { status: action },
        });

        await tx.notification.create({
          data: {
            user_id: expense.user_id,
            title: `Expense Claim ${action.toLowerCase()}`,
            message: `Your expense claim of $${expense.amount} for ${expense.category} has been ${action.toLowerCase()}.${comments ? ` Reason: ${comments}` : ''}`,
            is_read: false,
          },
        });
      }
      else if (approval.module === 'VENDOR_BILL') {
        const bill = await tx.vendorBill.findUnique({ where: { bill_id: recordId } });
        if (!bill) throw new NotFoundException('Vendor Bill not found');

        await tx.vendorBill.update({
          where: { bill_id: recordId },
          data: { status: action },
        });

        // Notify department head or bill initiator
        await tx.notification.create({
          data: {
            user_id: approval.requested_by_id,
            title: `Vendor Bill ${action.toLowerCase()}`,
            message: `Vendor bill #${bill.bill_number} for $${bill.amount} has been ${action.toLowerCase()}.${comments ? ` Reason: ${comments}` : ''}`,
            is_read: false,
          },
        });
      }

      // 3. Automatically record to audit logs
      await tx.auditLog.create({
        data: {
          user_id: BigInt(currentUser.id),
          module: approval.module,
          action: action,
          record_id: approvalId,
          old_values: `status: PENDING`,
          new_values: `status: ${action}, comments: ${comments}`,
          ip_address: '127.0.0.1',
        },
      });

      return updatedApproval;
    });
  }

  // Role verification helper
  private verifyAdminOrDeptHead(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation.');
    }
    
    const validRoles = ['Company Head / CEO', 'CEO', 'Department Head', 'DEPARTMENT_HEAD', 'Company Admin'];
    if (!validRoles.includes(currentUser.roleName)) {
      throw new ForbiddenException('Only administrators and managers can process approval registers.');
    }
  }
}
