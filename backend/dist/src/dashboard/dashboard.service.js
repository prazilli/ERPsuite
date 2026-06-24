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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmployeeDashboard(userId, companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                department: true,
                role: true,
                employee_profile: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        const welcome = {
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            designation: user.employee_profile?.job_title || 'Employee',
            department: user.department?.department_name || 'General',
        };
        const attendanceToday = await this.prisma.attendance.findFirst({
            where: { user_id: userId, date: today },
        });
        const attendanceStatus = attendanceToday
            ? {
                status: attendanceToday.status,
                checkIn: attendanceToday.check_in,
                checkOut: attendanceToday.check_out,
            }
            : {
                status: 'ABSENT_OR_UNCHECKED',
                checkIn: null,
                checkOut: null,
            };
        let workingHoursToday = 0;
        if (attendanceToday && attendanceToday.check_in) {
            const end = attendanceToday.check_out ? new Date(attendanceToday.check_out) : new Date();
            const diffMs = end.getTime() - new Date(attendanceToday.check_in).getTime();
            workingHoursToday = Math.max(0, parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2)));
        }
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const pastAttendance = await this.prisma.attendance.findMany({
            where: { user_id: userId, date: { gte: thirtyDaysAgo } },
        });
        const totalDays = pastAttendance.length || 1;
        const presentDays = pastAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendancePercentage = Math.round((presentDays / totalDays) * 100);
        const projectAssignments = await this.prisma.projectAssignment.findMany({
            where: { user_id: userId },
            include: { project: true },
        });
        const assignedProjects = projectAssignments.map(pa => ({
            projectId: pa.project.project_id.toString(),
            name: pa.project.project_name,
            role: pa.role,
            status: pa.project.status,
            completionPercent: pa.project.completion_percent,
        }));
        const tasks = await this.prisma.task.findMany({
            where: { assigned_to_id: userId },
        });
        const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED').map(t => ({
            taskId: t.task_id.toString(),
            name: t.name,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
        }));
        const nowTime = new Date();
        const overdueTasks = pendingTasks.filter(t => t.dueDate && new Date(t.dueDate) < nowTime);
        const todayStr = new Date().toISOString().split('T')[0];
        const tasksDueToday = pendingTasks.filter(t => {
            if (!t.dueDate)
                return false;
            const dStr = new Date(t.dueDate).toISOString().split('T')[0];
            return dStr === todayStr;
        });
        const leaveBalances = await this.prisma.leaveBalance.findMany({
            where: { user_id: userId },
        });
        const upcomingHolidays = await this.prisma.holiday.findMany({
            where: { company_id: companyId, date: { gte: today } },
            orderBy: { date: 'asc' },
            take: 5,
        });
        const recentTimesheets = await this.prisma.timesheet.findMany({
            where: { user_id: userId },
            include: { task: true },
            orderBy: { date: 'desc' },
            take: 5,
        });
        const assetAssignments = await this.prisma.assetAssignment.findMany({
            where: { user_id: userId, returned_at: null },
            include: { asset: true },
        });
        const assignedAssets = assetAssignments.map(aa => ({
            assetId: aa.asset.asset_id.toString(),
            name: aa.asset.name,
            serialNumber: aa.asset.serial_number,
            condition: aa.asset.condition,
            assignedAt: aa.assigned_at,
        }));
        const notifications = await this.prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 5,
        });
        const announcements = await this.prisma.announcement.findMany({
            where: {
                company_id: companyId,
                OR: [
                    { target_audience: 'ALL' },
                    { target_audience: user.department?.department_name || '' },
                ],
            },
            orderBy: { created_at: 'desc' },
            take: 5,
        });
        const upcomingMeetings = await this.prisma.meeting.findMany({
            where: { company_id: companyId, start_time: { gte: new Date() } },
            orderBy: { start_time: 'asc' },
            take: 5,
        });
        const salaryStructure = await this.prisma.salaryStructure.findUnique({
            where: { user_id: userId },
        });
        const recentPayrolls = await this.prisma.payroll.findMany({
            where: { user_id: userId },
            orderBy: { month: 'desc' },
            take: 3,
        });
        return {
            welcome,
            attendanceStatus,
            workingHoursToday,
            attendancePercentage,
            assignedProjects,
            pendingTasks,
            overdueTasksCount: overdueTasks.length,
            tasksDueTodayCount: tasksDueToday.length,
            leaveBalances,
            upcomingHolidays,
            timesheets: recentTimesheets.map(t => ({
                timesheetId: t.timesheet_id.toString(),
                taskName: t.task.name,
                date: t.date,
                hoursLogged: Number(t.hours_logged),
                description: t.description,
            })),
            assignedAssets,
            notifications,
            announcements,
            upcomingMeetings,
            salaryStructure: salaryStructure ? {
                baseSalary: Number(salaryStructure.base_salary),
                allowances: Number(salaryStructure.allowances),
                deductions: Number(salaryStructure.deductions),
                netSalary: Number(salaryStructure.base_salary) + Number(salaryStructure.allowances) - Number(salaryStructure.deductions)
            } : null,
            recentPayrolls: recentPayrolls.map(p => ({
                payrollId: p.payroll_id.toString(),
                month: p.month,
                netPaid: Number(p.net_paid),
                status: p.status,
            })),
        };
    }
    async getDepartmentHeadDashboard(deptId, companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const department = await this.prisma.department.findUnique({
            where: { department_id: deptId },
        });
        if (!department)
            throw new Error('Department not found');
        const teamCount = await this.prisma.user.count({
            where: { department_id: deptId, company_id: companyId, is_active: true },
        });
        const deptUsers = await this.prisma.user.findMany({
            where: { department_id: deptId, company_id: companyId },
            select: { user_id: true, first_name: true, last_name: true },
        });
        const deptUserIds = deptUsers.map(u => u.user_id);
        const projectsInDept = await this.prisma.project.findMany({
            where: {
                company_id: companyId,
                status: 'ACTIVE',
                assignments: {
                    some: { user_id: { in: deptUserIds } },
                },
            },
            include: {
                assignments: {
                    include: { user: true },
                },
            },
        });
        const todayAttendance = await this.prisma.attendance.findMany({
            where: {
                user_id: { in: deptUserIds },
                date: today,
            },
        });
        const presentCount = todayAttendance.filter(a => a.status === 'PRESENT').length;
        const lateCount = todayAttendance.filter(a => a.status === 'LATE').length;
        const teamAttendance = {
            present: presentCount,
            late: lateCount,
            absent: deptUserIds.length - (presentCount + lateCount),
            totalMembers: deptUserIds.length,
        };
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const timesheets = await this.prisma.timesheet.findMany({
            where: {
                user_id: { in: deptUserIds },
                date: { gte: sevenDaysAgo },
            },
        });
        const totalHoursLogged = timesheets.reduce((acc, t) => acc + Number(t.hours_logged), 0);
        const totalBudget = projectsInDept.reduce((acc, p) => acc + Number(p.budget), 0);
        const totalCost = projectsInDept.reduce((acc, p) => acc + Number(p.cost), 0);
        const pendingLeaves = await this.prisma.approval.findMany({
            where: {
                company_id: companyId,
                module: 'LEAVE_REQUEST',
                status: 'PENDING',
                requested_by: {
                    department_id: deptId,
                    role: { role_name: { notIn: ['Department Head', 'DEPARTMENT_HEAD'] } }
                },
            },
            include: {
                requested_by: true,
            },
        });
        const pendingExpenses = await this.prisma.approval.findMany({
            where: {
                company_id: companyId,
                module: 'EXPENSE',
                status: 'PENDING',
                requested_by: {
                    department_id: deptId,
                    role: { role_name: { notIn: ['Department Head', 'DEPARTMENT_HEAD'] } }
                },
            },
            include: {
                requested_by: true,
            },
        });
        const resourceAllocation = await Promise.all(deptUsers.map(async (u) => {
            const count = await this.prisma.projectAssignment.count({
                where: { user_id: u.user_id },
            });
            return {
                name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
                projectsCount: count,
            };
        }));
        const projectStatusCounts = await this.prisma.project.groupBy({
            by: ['status'],
            where: {
                company_id: companyId,
                assignments: { some: { user_id: { in: deptUserIds } } },
            },
            _count: { project_id: true },
        });
        const projectStatusChart = projectStatusCounts.map(item => ({
            status: item.status,
            count: item._count.project_id,
        }));
        const announcements = await this.prisma.announcement.findMany({
            where: {
                company_id: companyId,
                OR: [
                    { target_audience: 'ALL' },
                    { target_audience: department.department_name },
                ],
            },
            orderBy: { created_at: 'desc' },
            take: 5,
        });
        const upcomingMeetings = await this.prisma.meeting.findMany({
            where: { company_id: companyId, start_time: { gte: new Date() } },
            orderBy: { start_time: 'asc' },
            take: 5,
        });
        return {
            departmentName: department.department_name,
            teamMembersCount: teamCount,
            activeProjectsCount: projectsInDept.length,
            teamAttendance,
            productivity: {
                totalHoursLogged,
                averageHoursPerMember: parseFloat((totalHoursLogged / (teamCount || 1)).toFixed(1)),
            },
            budget: {
                allocated: totalBudget,
                utilized: totalCost,
                utilizationPercent: totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0,
            },
            pendingApprovals: {
                leaves: pendingLeaves.map(pl => ({
                    approvalId: pl.approval_id.toString(),
                    recordId: pl.record_id.toString(),
                    employeeName: `${pl.requested_by.first_name || ''} ${pl.requested_by.last_name || ''}`.trim(),
                    createdAt: pl.created_at,
                })),
                expenses: pendingExpenses.map(pe => ({
                    approvalId: pe.approval_id.toString(),
                    recordId: pe.record_id.toString(),
                    employeeName: `${pe.requested_by.first_name || ''} ${pe.requested_by.last_name || ''}`.trim(),
                    createdAt: pe.created_at,
                })),
            },
            resourceAllocation,
            projectStatusChart,
            announcements,
            upcomingMeetings,
        };
    }
    async getCeoDashboard(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const company = await this.prisma.company.findUnique({
            where: { company_id: companyId },
            select: { company_name: true }
        });
        const totalEmployees = await this.prisma.user.count({
            where: { company_id: companyId },
        });
        const activeEmployees = await this.prisma.user.count({
            where: { company_id: companyId, is_active: true },
        });
        const totalClients = await this.prisma.client.count({
            where: { company_id: companyId },
        });
        const activeProjects = await this.prisma.project.count({
            where: { company_id: companyId, status: 'ACTIVE' },
        });
        const currentYearMonth = new Date().toISOString().substring(0, 7);
        const currentMonthInvoices = await this.prisma.invoice.findMany({
            where: {
                company_id: companyId,
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });
        const monthlyRevenue = currentMonthInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
        const currentMonthExpenses = await this.prisma.expense.findMany({
            where: {
                company_id: companyId,
                status: 'APPROVED',
                created_at: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });
        const monthlyExpenses = currentMonthExpenses.reduce((acc, exp) => acc + Number(exp.amount), 0);
        const currentMonthPayroll = await this.prisma.payroll.findMany({
            where: {
                user: { company_id: companyId },
                month: currentYearMonth,
            },
        });
        const payrollCost = currentMonthPayroll.reduce((acc, pay) => acc + Number(pay.net_paid), 0);
        const netProfit = monthlyRevenue - (monthlyExpenses + payrollCost);
        const invoices = await this.prisma.invoice.findMany({
            where: { company_id: companyId },
            include: { client: true },
        });
        const clientRevenueMap = {};
        for (const inv of invoices) {
            const clientId = inv.client_id.toString();
            if (!clientRevenueMap[clientId]) {
                clientRevenueMap[clientId] = { name: inv.client.name, revenue: 0 };
            }
            clientRevenueMap[clientId].revenue += Number(inv.amount);
        }
        const topClients = Object.values(clientRevenueMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        const departments = await this.prisma.department.findMany({
            where: { company_id: companyId },
            include: {
                users: {
                    include: {
                        project_assignments: {
                            include: { project: true },
                        },
                    },
                },
            },
        });
        const departmentPerformance = departments.map(d => {
            const staffCount = d.users.length;
            const projectIds = new Set();
            d.users.forEach(u => u.project_assignments.forEach(pa => projectIds.add(pa.project_id.toString())));
            return {
                name: d.department_name,
                staffCount,
                projectsCount: projectIds.size,
            };
        });
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const pastInvoices = await this.prisma.invoice.findMany({
            where: { company_id: companyId, created_at: { gte: sixMonthsAgo } },
        });
        const monthlyRevTrend = {};
        pastInvoices.forEach(inv => {
            const m = new Date(inv.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyRevTrend[m] = (monthlyRevTrend[m] || 0) + Number(inv.amount);
        });
        const revenueTrends = Object.entries(monthlyRevTrend).map(([month, amount]) => ({ month, amount }));
        const pastExpenses = await this.prisma.expense.findMany({
            where: { company_id: companyId, status: 'APPROVED', created_at: { gte: sixMonthsAgo } },
        });
        const monthlyExpTrend = {};
        pastExpenses.forEach(exp => {
            const m = new Date(exp.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
            monthlyExpTrend[m] = (monthlyExpTrend[m] || 0) + Number(exp.amount);
        });
        const expenseTrends = Object.entries(monthlyExpTrend).map(([month, amount]) => ({ month, amount }));
        const projects = await this.prisma.project.findMany({ where: { company_id: companyId } });
        const projectHealth = {
            onTrack: projects.filter(p => p.completion_percent >= 50 && p.status === 'ACTIVE').length,
            delayed: projects.filter(p => p.status === 'ACTIVE' && p.end_date && new Date(p.end_date) < new Date() && p.completion_percent < 100).length,
            planning: projects.filter(p => p.completion_percent < 10).length,
            completed: projects.filter(p => p.status === 'COMPLETED' || p.completion_percent === 100).length,
        };
        const leads = await this.prisma.lead.findMany({ where: { company_id: companyId } });
        const funnelStages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];
        const leadConversion = funnelStages.map(stage => ({
            stage,
            count: leads.filter(l => l.status === stage).length,
        }));
        const outstandingInvoices = await this.prisma.invoice.findMany({
            where: {
                company_id: companyId,
                status: { in: ['UNPAID', 'OVERDUE'] },
            },
            include: { client: true },
            orderBy: { due_date: 'asc' },
            take: 5,
        });
        const vendorBills = await this.prisma.vendorBill.findMany({
            where: { company_id: companyId },
        });
        const billSummary = {
            pendingAmount: vendorBills.filter(b => b.status === 'PENDING').reduce((acc, b) => acc + Number(b.amount), 0),
            paidAmount: vendorBills.filter(b => b.status === 'PAID').reduce((acc, b) => acc + Number(b.amount), 0),
            totalBills: vendorBills.length,
        };
        const employeeProfiles = await this.prisma.employeeProfile.findMany({
            include: { user: { select: { company_id: true } } },
            where: { user: { company_id: companyId } },
        });
        const growthTrend = {};
        employeeProfiles.forEach(ep => {
            const m = new Date(ep.hire_date).toLocaleString('default', { month: 'short', year: 'numeric' });
            growthTrend[m] = (growthTrend[m] || 0) + 1;
        });
        const employeeGrowth = Object.entries(growthTrend).map(([month, count]) => ({ month, count }));
        const pendingDepartmentHeadLeaves = await this.prisma.approval.findMany({
            where: {
                company_id: companyId,
                module: 'LEAVE_REQUEST',
                status: 'PENDING',
                requested_by: { role: { role_name: { in: ['Department Head', 'DEPARTMENT_HEAD'] } } },
            },
            include: { requested_by: true },
        });
        return {
            companyName: company?.company_name || 'Enterprise',
            stats: {
                totalEmployees,
                activeEmployees,
                totalClients,
                activeProjects,
            },
            financials: {
                monthlyRevenue,
                monthlyExpenses,
                payrollCost,
                netProfit,
            },
            topClients,
            departmentPerformance,
            revenueTrends,
            expenseTrends,
            projectHealth,
            leadConversion,
            outstandingInvoices: outstandingInvoices.map(inv => ({
                invoiceId: inv.invoice_id.toString(),
                invoiceNumber: inv.invoice_number,
                clientName: inv.client.name,
                amount: Number(inv.amount),
                dueDate: inv.due_date,
                status: inv.status,
            })),
            billSummary,
            employeeGrowth,
            pendingDepartmentHeadLeaves: pendingDepartmentHeadLeaves.map(pl => ({
                approvalId: pl.approval_id.toString(),
                recordId: pl.record_id.toString(),
                employeeName: `${pl.requested_by.first_name || ''} ${pl.requested_by.last_name || ''}`.trim(),
                createdAt: pl.created_at,
            })),
        };
    }
    async getPendingDepartmentRequests(companyId) {
        const requests = await this.prisma.departmentCreationRequest.findMany({
            where: {
                company_id: companyId,
                status: 'pending',
            },
            include: {
                requested_by: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return requests.map(req => ({
            requestId: req.request_id.toString(),
            departmentName: req.department_name,
            description: req.description,
            status: req.status,
            createdAt: req.created_at,
            requestedBy: req.requested_by
                ? `${req.requested_by.first_name || ''} ${req.requested_by.last_name || ''}`.trim()
                : 'Unknown',
            requesterEmail: req.requested_by?.email || '',
        }));
    }
    async approveDepartmentRequest(requestId, ceoId) {
        return this.prisma.$transaction(async (tx) => {
            const request = await tx.departmentCreationRequest.findUnique({
                where: { request_id: requestId },
            });
            if (!request) {
                throw new Error('Department creation request not found');
            }
            if (request.status !== 'pending') {
                throw new Error('Department creation request is already processed');
            }
            const dept = await tx.department.create({
                data: {
                    company_id: request.company_id,
                    department_name: request.department_name,
                    is_custom: true,
                },
            });
            await tx.departmentFeature.create({
                data: {
                    department_id: dept.department_id,
                    feature_name: 'analytics',
                    enabled: true,
                },
            });
            await tx.user.update({
                where: { user_id: request.requested_by_id },
                data: { department_id: dept.department_id },
            });
            await tx.departmentCreationRequest.update({
                where: { request_id: requestId },
                data: {
                    status: 'approved',
                    approved_by_id: ceoId,
                },
            });
            await tx.notification.create({
                data: {
                    user_id: request.requested_by_id,
                    title: 'Department Approved',
                    message: `Your request for the department "${request.department_name}" has been approved by the CEO.`,
                },
            });
            return {
                success: true,
                message: 'Department approved and created successfully.',
                departmentId: dept.department_id.toString(),
            };
        });
    }
    async rejectDepartmentRequest(requestId, ceoId) {
        const request = await this.prisma.departmentCreationRequest.findUnique({
            where: { request_id: requestId },
        });
        if (!request) {
            throw new Error('Department creation request not found');
        }
        if (request.status !== 'pending') {
            throw new Error('Department creation request is already processed');
        }
        await this.prisma.departmentCreationRequest.update({
            where: { request_id: requestId },
            data: {
                status: 'rejected',
                approved_by_id: ceoId,
            },
        });
        await this.prisma.notification.create({
            data: {
                user_id: request.requested_by_id,
                title: 'Department Request Rejected',
                message: `Your request for the department "${request.department_name}" was rejected.`,
            },
        });
        return {
            success: true,
            message: 'Department creation request rejected.',
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map