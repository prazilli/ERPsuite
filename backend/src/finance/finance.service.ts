import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  // List invoices in company
  async getInvoices(companyId: bigint, currentUser: any) {
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

  // Create invoice
  async createInvoice(companyId: bigint, data: any, currentUser: any) {
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

  // Register Payment for Invoice
  async payInvoice(invoiceId: bigint, data: any, currentUser: any) {
    const invoice = await this.prisma.invoice.findUnique({ where: { invoice_id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    this.verifyTenant(invoice.company_id, currentUser);

    return this.prisma.$transaction(async (tx) => {
      // Record payment
      const payment = await tx.payment.create({
        data: {
          invoice_id: invoiceId,
          amount: Number(data.amount),
          payment_method: data.paymentMethod || 'BANK_TRANSFER',
          paid_at: data.paidAt ? new Date(data.paidAt) : new Date(),
        },
      });

      // Update invoice status to PAID
      await tx.invoice.update({
        where: { invoice_id: invoiceId },
        data: {
          status: 'PAID',
        },
      });

      // Update project revenue if associated (simulated check)
      // E.g. find a project matching the invoice number or description and update revenue
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

  // List expenses
  async getExpenses(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.expense.findMany({
      where: { company_id: companyId },
      include: {
        user: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Create expense
  async createExpense(companyId: bigint, data: any, currentUser: any) {
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

      // Create workflow approval entry
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

  // List vendor bills
  async getVendorBills(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.vendorBill.findMany({
      where: { company_id: companyId },
      include: {
        vendor: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Create vendor bill
  async createVendorBill(companyId: bigint, data: any, currentUser: any) {
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

      // Create workflow approval entry
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

  // List vendors
  async getVendors(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.vendor.findMany({
      where: { company_id: companyId },
      orderBy: { name: 'asc' },
    });
  }

  // Create vendor
  async createVendor(companyId: bigint, data: any, currentUser: any) {
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

  // Calculate financial margin analytics
  async getFinancialAnalytics(companyId: bigint, currentUser: any) {
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

  // Tenant helper
  private verifyTenant(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }
}
