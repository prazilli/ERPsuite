import { PrismaService } from '../prisma/prisma.service';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(companyId: bigint, currentUser: any): Promise<{
        company_id: bigint;
        created_at: Date;
        tenant_id: bigint;
        company_name: string;
        company_type: import("@prisma/client").$Enums.CompanyType;
    }>;
    updateProfile(companyId: bigint, data: any, currentUser: any): Promise<{
        company_id: bigint;
        created_at: Date;
        tenant_id: bigint;
        company_name: string;
        company_type: import("@prisma/client").$Enums.CompanyType;
    }>;
    getAnalytics(companyId: bigint, currentUser: any): Promise<{
        kpis: {
            totalEmployees: number;
            activeEmployees: number;
            inactiveEmployees: number;
            attendancePercentage: number;
            employeesOnLeave: number;
            totalClients: number;
            activeClients: number;
            totalLeads: number;
            leadConversionRate: number;
            totalProjects: number;
            activeProjects: number;
            completedProjects: number;
            delayedProjects: number;
            totalRevenue: number;
            totalExpenses: number;
            payrollCost: number;
            vendorPayables: number;
            invoiceReceivables: number;
            netProfit: number;
            profitMargin: number;
            assetUtilization: number;
        };
        trends: {
            monthlyRevenueTrend: {
                name: string;
                revenue: number;
                expense: number;
            }[];
            employeeGrowthTrend: {
                name: string;
                count: any;
            }[];
            leadFunnel: {
                stage: string;
                count: number;
            }[];
            projectStatusDistribution: {
                name: string;
                count: number;
            }[];
            departmentEmployeeDistribution: {
                departmentName: string;
                employeeCount: number;
            }[];
        };
        tables: {
            topProjects: {
                description: string | null;
                company_id: bigint;
                created_at: Date;
                status: string;
                project_id: bigint;
                project_name: string;
                start_date: Date | null;
                end_date: Date | null;
                budget: import("@prisma/client/runtime/library").Decimal;
                cost: import("@prisma/client/runtime/library").Decimal;
                revenue: import("@prisma/client/runtime/library").Decimal;
                completion_percent: number;
            }[];
            pendingInvoices: ({
                client: {
                    name: string;
                    email: string | null;
                    company_id: bigint;
                    phone: string | null;
                    created_at: Date;
                    client_id: bigint;
                    address: string | null;
                };
            } & {
                company_id: bigint;
                created_at: Date;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                invoice_id: bigint;
                client_id: bigint;
                invoice_number: string;
                due_date: Date;
            })[];
            pendingVendorBills: ({
                vendor: {
                    name: string;
                    email: string | null;
                    company_id: bigint;
                    phone: string | null;
                    vendor_id: bigint;
                };
            } & {
                company_id: bigint;
                created_at: Date;
                status: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                due_date: Date;
                bill_id: bigint;
                vendor_id: bigint;
                bill_number: string;
            })[];
        };
        alerts: string[];
    }>;
    private verifyTenant;
}
