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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ApprovalsService = class ApprovalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPendingApprovals(companyId, currentUser) {
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
    async actionApproval(approvalId, action, comments, currentUser) {
        const approval = await this.prisma.approval.findUnique({
            where: { approval_id: approvalId },
            include: { requested_by: true },
        });
        if (!approval)
            throw new common_1.NotFoundException('Approval request not found');
        this.verifyAdminOrDeptHead(approval.company_id, currentUser);
        if (approval.status !== 'PENDING') {
            throw new common_1.BadRequestException('Approval request has already been processed. Current status: ' + approval.status);
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedApproval = await tx.approval.update({
                where: { approval_id: approvalId },
                data: {
                    status: action,
                    comments,
                    approved_by_id: BigInt(currentUser.id),
                },
            });
            const recordId = approval.record_id;
            if (approval.module === 'LEAVE_REQUEST') {
                const leave = await tx.leaveRequest.findUnique({ where: { leave_id: recordId } });
                if (!leave)
                    throw new common_1.NotFoundException('Leave record not found');
                await tx.leaveRequest.update({
                    where: { leave_id: recordId },
                    data: { status: action },
                });
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
                if (!expense)
                    throw new common_1.NotFoundException('Expense record not found');
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
                if (!bill)
                    throw new common_1.NotFoundException('Vendor Bill not found');
                await tx.vendorBill.update({
                    where: { bill_id: recordId },
                    data: { status: action },
                });
                await tx.notification.create({
                    data: {
                        user_id: approval.requested_by_id,
                        title: `Vendor Bill ${action.toLowerCase()}`,
                        message: `Vendor bill #${bill.bill_number} for $${bill.amount} has been ${action.toLowerCase()}.${comments ? ` Reason: ${comments}` : ''}`,
                        is_read: false,
                    },
                });
            }
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
    verifyAdminOrDeptHead(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation.');
        }
        const validRoles = ['Company Head / CEO', 'CEO', 'Department Head', 'DEPARTMENT_HEAD', 'Company Admin'];
        if (!validRoles.includes(currentUser.roleName)) {
            throw new common_1.ForbiddenException('Only administrators and managers can process approval registers.');
        }
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map