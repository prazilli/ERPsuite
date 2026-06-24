import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    getInvoices(user: any): Promise<({
        client: {
            name: string;
            email: string | null;
            company_id: bigint;
            phone: string | null;
            created_at: Date;
            client_id: bigint;
            address: string | null;
        };
        payments: {
            amount: import("@prisma/client/runtime/library").Decimal;
            invoice_id: bigint;
            payment_id: bigint;
            payment_method: string;
            paid_at: Date;
        }[];
    } & {
        company_id: bigint;
        created_at: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoice_id: bigint;
        client_id: bigint;
        invoice_number: string;
        due_date: Date;
    })[]>;
    createInvoice(body: any, user: any): Promise<{
        company_id: bigint;
        created_at: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        invoice_id: bigint;
        client_id: bigint;
        invoice_number: string;
        due_date: Date;
    }>;
    payInvoice(invoiceId: string, body: any, user: any): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        invoice_id: bigint;
        payment_id: bigint;
        payment_method: string;
        paid_at: Date;
    }>;
    getExpenses(user: any): Promise<({
        user: {
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
        description: string | null;
        user_id: bigint;
        company_id: bigint;
        created_at: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        expense_id: bigint;
        category: string;
    })[]>;
    createExpense(body: any, user: any): Promise<{
        description: string | null;
        user_id: bigint;
        company_id: bigint;
        created_at: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        expense_id: bigint;
        category: string;
    }>;
    getVendorBills(user: any): Promise<({
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
    })[]>;
    createVendorBill(body: any, user: any): Promise<{
        company_id: bigint;
        created_at: Date;
        status: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        due_date: Date;
        bill_id: bigint;
        vendor_id: bigint;
        bill_number: string;
    }>;
    getVendors(user: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        vendor_id: bigint;
    }[]>;
    createVendor(body: any, user: any): Promise<{
        name: string;
        email: string | null;
        company_id: bigint;
        phone: string | null;
        vendor_id: bigint;
    }>;
    getFinancialAnalytics(user: any): Promise<{
        revenue: number;
        expenses: number;
        payrollCost: number;
        totalCost: number;
        netProfit: number;
        profitMargin: number;
    }>;
}
