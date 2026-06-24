import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getEmployeeDashboard(userId: bigint, companyId: bigint): Promise<{
        welcome: {
            name: string;
            designation: string;
            department: string;
        };
        attendanceStatus: {
            status: string;
            checkIn: Date | null;
            checkOut: Date | null;
        };
        workingHoursToday: number;
        attendancePercentage: number;
        assignedProjects: {
            projectId: string;
            name: string;
            role: string;
            status: string;
            completionPercent: number;
        }[];
        pendingTasks: {
            taskId: string;
            name: string;
            status: string;
            priority: string;
            dueDate: Date | null;
        }[];
        overdueTasksCount: number;
        tasksDueTodayCount: number;
        leaveBalances: {
            user_id: bigint;
            leave_type: string;
            balance_id: bigint;
            allocated: number;
            used: number;
        }[];
        upcomingHolidays: {
            name: string;
            company_id: bigint;
            date: Date;
            holiday_id: bigint;
        }[];
        timesheets: {
            timesheetId: string;
            taskName: string;
            date: Date;
            hoursLogged: number;
            description: string | null;
        }[];
        assignedAssets: {
            assetId: string;
            name: string;
            serialNumber: string;
            condition: string;
            assignedAt: Date;
        }[];
        notifications: {
            message: string;
            user_id: bigint;
            created_at: Date;
            notification_id: bigint;
            title: string;
            is_read: boolean;
        }[];
        announcements: {
            company_id: bigint;
            created_at: Date;
            updated_at: Date;
            title: string;
            announcement_id: bigint;
            content: string;
            target_audience: string | null;
        }[];
        upcomingMeetings: {
            description: string | null;
            company_id: bigint;
            created_at: Date;
            title: string;
            meeting_id: bigint;
            start_time: Date;
            end_time: Date;
            meeting_link: string | null;
            location: string | null;
        }[];
        salaryStructure: {
            baseSalary: number;
            allowances: number;
            deductions: number;
            netSalary: number;
        } | null;
        recentPayrolls: {
            payrollId: string;
            month: string;
            netPaid: number;
            status: string;
        }[];
    }>;
    getDepartmentHeadDashboard(deptId: bigint, companyId: bigint): Promise<{
        departmentName: string;
        teamMembersCount: number;
        activeProjectsCount: number;
        teamAttendance: {
            present: number;
            late: number;
            absent: number;
            totalMembers: number;
        };
        productivity: {
            totalHoursLogged: number;
            averageHoursPerMember: number;
        };
        budget: {
            allocated: number;
            utilized: number;
            utilizationPercent: number;
        };
        pendingApprovals: {
            leaves: {
                approvalId: string;
                recordId: string;
                employeeName: string;
                createdAt: Date;
            }[];
            expenses: {
                approvalId: string;
                recordId: string;
                employeeName: string;
                createdAt: Date;
            }[];
        };
        resourceAllocation: {
            name: string;
            projectsCount: number;
        }[];
        projectStatusChart: {
            status: string;
            count: number;
        }[];
        announcements: {
            company_id: bigint;
            created_at: Date;
            updated_at: Date;
            title: string;
            announcement_id: bigint;
            content: string;
            target_audience: string | null;
        }[];
        upcomingMeetings: {
            description: string | null;
            company_id: bigint;
            created_at: Date;
            title: string;
            meeting_id: bigint;
            start_time: Date;
            end_time: Date;
            meeting_link: string | null;
            location: string | null;
        }[];
    }>;
    getCeoDashboard(companyId: bigint): Promise<{
        companyName: string;
        stats: {
            totalEmployees: number;
            activeEmployees: number;
            totalClients: number;
            activeProjects: number;
        };
        financials: {
            monthlyRevenue: number;
            monthlyExpenses: number;
            payrollCost: number;
            netProfit: number;
        };
        topClients: {
            name: string;
            revenue: number;
        }[];
        departmentPerformance: {
            name: string;
            staffCount: number;
            projectsCount: number;
        }[];
        revenueTrends: {
            month: string;
            amount: number;
        }[];
        expenseTrends: {
            month: string;
            amount: number;
        }[];
        projectHealth: {
            onTrack: number;
            delayed: number;
            planning: number;
            completed: number;
        };
        leadConversion: {
            stage: string;
            count: number;
        }[];
        outstandingInvoices: {
            invoiceId: string;
            invoiceNumber: string;
            clientName: string;
            amount: number;
            dueDate: Date;
            status: string;
        }[];
        billSummary: {
            pendingAmount: number;
            paidAmount: number;
            totalBills: number;
        };
        employeeGrowth: {
            month: string;
            count: number;
        }[];
        pendingDepartmentHeadLeaves: {
            approvalId: string;
            recordId: string;
            employeeName: string;
            createdAt: Date;
        }[];
    }>;
    getPendingDepartmentRequests(companyId: bigint): Promise<{
        requestId: string;
        departmentName: string;
        description: string | null;
        status: string;
        createdAt: Date;
        requestedBy: string;
        requesterEmail: string;
    }[]>;
    approveDepartmentRequest(requestId: bigint, ceoId: bigint): Promise<{
        success: boolean;
        message: string;
        departmentId: string;
    }>;
    rejectDepartmentRequest(requestId: bigint, ceoId: bigint): Promise<{
        success: boolean;
        message: string;
    }>;
}
