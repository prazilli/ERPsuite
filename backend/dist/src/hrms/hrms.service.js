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
exports.HrmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HrmsService = class HrmsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployees(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.user.findMany({
            where: { company_id: companyId },
            include: {
                department: true,
                role: true,
                employee_profile: true,
                salary_structure: true,
            },
        });
    }
    async getProfile(userId, currentUser) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                department: true,
                role: true,
                employee_profile: {
                    include: {
                        manager: true,
                    },
                },
                salary_structure: true,
                leave_balances: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('Employee not found');
        }
        this.verifyTenant(user.company_id, currentUser);
        return user;
    }
    async updateProfile(userId, data, currentUser) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Employee not found');
        this.verifyTenant(user.company_id, currentUser);
        if (currentUser.roleName !== 'Company Head / CEO' && BigInt(currentUser.id) !== userId) {
            throw new common_1.ForbiddenException('Unauthorized to edit this employee profile');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { user_id: userId },
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    phone: data.phone,
                },
            });
            if (data.jobTitle || data.managerId || data.status) {
                await tx.employeeProfile.upsert({
                    where: { user_id: userId },
                    create: {
                        user_id: userId,
                        job_title: data.jobTitle || 'Associate',
                        hire_date: data.hireDate ? new Date(data.hireDate) : new Date(),
                        manager_id: data.managerId ? BigInt(data.managerId) : null,
                        status: data.status || 'ACTIVE',
                    },
                    update: {
                        job_title: data.jobTitle,
                        manager_id: data.managerId ? BigInt(data.managerId) : null,
                        status: data.status,
                    },
                });
            }
            if (data.baseSalary !== undefined && currentUser.roleName === 'Company Head / CEO') {
                await tx.salaryStructure.upsert({
                    where: { user_id: userId },
                    create: {
                        user_id: userId,
                        base_salary: Number(data.baseSalary),
                        allowances: Number(data.allowances || 0),
                        deductions: Number(data.deductions || 0),
                    },
                    update: {
                        base_salary: Number(data.baseSalary),
                        allowances: Number(data.allowances || 0),
                        deductions: Number(data.deductions || 0),
                    },
                });
            }
            return { success: true };
        });
    }
    async getAttendance(userId, currentUser) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Employee not found');
        this.verifyTenant(user.company_id, currentUser);
        return this.prisma.attendance.findMany({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
        });
    }
    async checkIn(userId, currentUser) {
        if (BigInt(currentUser.id) !== userId) {
            throw new common_1.ForbiddenException('Cannot check in on behalf of another user');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.attendance.findFirst({
            where: { user_id: userId, date: today },
        });
        if (existing) {
            throw new common_1.BadRequestException('Already checked in today');
        }
        const checkInTime = new Date();
        let status = 'PRESENT';
        const cutoff = new Date();
        cutoff.setHours(9, 30, 0, 0);
        if (checkInTime.getTime() > cutoff.getTime()) {
            status = 'LATE';
        }
        return this.prisma.attendance.create({
            data: {
                user_id: userId,
                date: today,
                check_in: checkInTime,
                status,
            },
        });
    }
    async checkOut(userId, currentUser) {
        if (BigInt(currentUser.id) !== userId) {
            throw new common_1.ForbiddenException('Cannot check out on behalf of another user');
        }
        const attendance = await this.prisma.attendance.findFirst({
            where: { user_id: userId },
            orderBy: { check_in: 'desc' },
        });
        if (!attendance) {
            throw new common_1.BadRequestException('Must check in before checking out');
        }
        if (attendance.check_out) {
            throw new common_1.BadRequestException('Already checked out today');
        }
        return this.prisma.attendance.update({
            where: { attendance_id: attendance.attendance_id },
            data: {
                check_out: new Date(),
            },
        });
    }
    async applyLeave(userId, data, currentUser) {
        if (BigInt(currentUser.id) !== userId) {
            throw new common_1.ForbiddenException('Cannot submit leave on behalf of another user');
        }
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: { employee_profile: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Employee not found');
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (startDate.getTime() > endDate.getTime()) {
            throw new common_1.BadRequestException('Start date must be before or equal to End date');
        }
        return this.prisma.$transaction(async (tx) => {
            const leaveRequest = await tx.leaveRequest.create({
                data: {
                    user_id: userId,
                    leave_type: data.leaveType,
                    start_date: startDate,
                    end_date: endDate,
                    reason: data.reason,
                    status: 'PENDING',
                },
            });
            const approval = await tx.approval.create({
                data: {
                    company_id: user.company_id,
                    module: 'LEAVE_REQUEST',
                    record_id: leaveRequest.leave_id,
                    requested_by_id: userId,
                    status: 'PENDING',
                },
            });
            const notifyUserId = user.employee_profile?.manager_id ||
                (await tx.user.findFirst({ where: { company_id: user.company_id, role_id: 1n } }))?.user_id;
            if (notifyUserId) {
                await tx.notification.create({
                    data: {
                        user_id: notifyUserId,
                        title: 'New Leave Approval Pending',
                        message: `${currentUser.name} applied for ${data.leaveType} from ${data.startDate} to ${data.endDate}.`,
                        is_read: false,
                    },
                });
            }
            return leaveRequest;
        });
    }
    async getLeaveRequests(userId, currentUser) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Employee not found');
        this.verifyTenant(user.company_id, currentUser);
        const leaves = await this.prisma.leaveRequest.findMany({
            where: { user_id: userId },
            orderBy: { start_date: 'desc' },
        });
        const leaveIds = leaves.map(l => l.leave_id);
        const approvals = await this.prisma.approval.findMany({
            where: {
                module: 'LEAVE_REQUEST',
                record_id: { in: leaveIds },
            },
        });
        console.log('leaveIds:', leaveIds);
        console.log('approvals:', approvals.map(a => a.approval_id));
        const result = leaves.map(leave => {
            const approval = approvals.find(a => BigInt(a.record_id) === BigInt(leave.leave_id));
            return {
                ...leave,
                manager_comments: approval?.comments || null,
            };
        });
        console.log('result with manager_comments:', result.map(r => r.manager_comments));
        return result;
    }
    async getTeamLeaveRequests(currentUser) {
        if (currentUser.roleName !== 'Department Head' && currentUser.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Unauthorized to view team leaves');
        }
        return this.prisma.leaveRequest.findMany({
            where: {
                user: {
                    company_id: currentUser.companyId,
                    ...(currentUser.roleName === 'Department Head' ? { department_id: currentUser.departmentId } : {}),
                },
            },
            include: {
                user: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getPayrollHistory(userId, currentUser) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Employee not found');
        this.verifyTenant(user.company_id, currentUser);
        return this.prisma.payroll.findMany({
            where: { user_id: userId },
            orderBy: { month: 'desc' },
        });
    }
    async getHolidays(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.holiday.findMany({
            where: { company_id: companyId },
            orderBy: { date: 'asc' },
        });
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
};
exports.HrmsService = HrmsService;
exports.HrmsService = HrmsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HrmsService);
//# sourceMappingURL=hrms.service.js.map