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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getInvoices(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.invoice.findMany({
            where: { company_id: companyId },
            include: {
                client: true,
                payments: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createInvoice(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.invoice.create({
            data: {
                company_id: companyId,
                client_id: BigInt(data.clientId),
                invoice_number: data.invoiceNumber,
                amount: Number(data.amount),
                status: data.status || 'UNPAID',
                due_date: new Date(data.dueDate),
            },
        });
    }
    async payInvoice(invoiceId, data, currentUser) {
        const invoice = await this.prisma.invoice.findUnique({ where: { invoice_id: invoiceId } });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        this.verifyTenant(invoice.company_id, currentUser);
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    invoice_id: invoiceId,
                    amount: Number(data.amount),
                    payment_method: data.paymentMethod || 'BANK_TRANSFER',
                    paid_at: data.paidAt ? new Date(data.paidAt) : new Date(),
                },
            });
            await tx.invoice.update({
                where: { invoice_id: invoiceId },
                data: {
                    status: 'PAID',
                },
            });
            const invoiceNum = invoice.invoice_number;
            const associatedProject = await tx.project.findFirst({
                where: {
                    company_id: invoice.company_id,
                    project_name: { contains: invoiceNum.substring(0, 8) },
                },
            });
            if (associatedProject) {
                await tx.project.update({
                    where: { project_id: associatedProject.project_id },
                    data: {
                        revenue: {
                            increment: Number(data.amount),
                        },
                    },
                });
            }
            return payment;
        });
    }
    async getExpenses(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.expense.findMany({
            where: { company_id: companyId },
            include: {
                user: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createExpense(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.expense.create({
                data: {
                    company_id: companyId,
                    user_id: BigInt(currentUser.id),
                    category: data.category,
                    amount: Number(data.amount),
                    description: data.description,
                    status: 'PENDING',
                },
            });
            await tx.approval.create({
                data: {
                    company_id: companyId,
                    module: 'EXPENSE',
                    record_id: expense.expense_id,
                    requested_by_id: BigInt(currentUser.id),
                    status: 'PENDING',
                },
            });
            return expense;
        });
    }
    async getVendorBills(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.vendorBill.findMany({
            where: { company_id: companyId },
            include: {
                vendor: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async createVendorBill(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.$transaction(async (tx) => {
            const bill = await tx.vendorBill.create({
                data: {
                    company_id: companyId,
                    vendor_id: BigInt(data.vendorId),
                    bill_number: data.billNumber,
                    amount: Number(data.amount),
                    status: 'PENDING',
                    due_date: new Date(data.dueDate),
                },
            });
            await tx.approval.create({
                data: {
                    company_id: companyId,
                    module: 'VENDOR_BILL',
                    record_id: bill.bill_id,
                    requested_by_id: BigInt(currentUser.id),
                    status: 'PENDING',
                },
            });
            return bill;
        });
    }
    async getVendors(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.vendor.findMany({
            where: { company_id: companyId },
            orderBy: { name: 'asc' },
        });
    }
    async createVendor(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.vendor.create({
            data: {
                company_id: companyId,
                name: data.name,
                email: data.email,
                phone: data.phone,
            },
        });
    }
    async getFinancialAnalytics(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        const [paidInvoices, approvedExpenses, paidPayroll] = await Promise.all([
            this.prisma.invoice.aggregate({
                where: { company_id: companyId, status: 'PAID' },
                _sum: { amount: true },
            }),
            this.prisma.expense.aggregate({
                where: { company_id: companyId, status: 'APPROVED' },
                _sum: { amount: true },
            }),
            this.prisma.payroll.aggregate({
                where: { user: { company_id: companyId }, status: 'PAID' },
                _sum: { net_paid: true },
            }),
        ]);
        const revenue = Number(paidInvoices._sum.amount || 0);
        const expenses = Number(approvedExpenses._sum.amount || 0);
        const payrollCost = Number(paidPayroll._sum.net_paid || 0);
        const totalCost = expenses + payrollCost;
        const netProfit = revenue - totalCost;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        return {
            revenue,
            expenses,
            payrollCost,
            totalCost,
            netProfit,
            profitMargin,
        };
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map