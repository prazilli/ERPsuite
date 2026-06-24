import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(companyId: bigint, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);

    const company = await this.prisma.company.findUnique({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return company;
  }

  async updateProfile(companyId: bigint, data: any, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);

    const company = await this.prisma.company.findUnique({
      where: { company_id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return this.prisma.company.update({
      where: { company_id: companyId },
      data: {
        company_name: data.companyName,
      },
    });
  }

  async getAnalytics(companyId: bigint, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Gather all raw counts & metrics via Promise.all
    const [
      totalEmployeesCount,
      activeEmployeesCount,
      inactiveEmployeesCount,
      attendanceStats,
      employeesOnLeaveCount,
      totalClientsCount,
      totalLeadsCount,
      totalLeadsWonCount,
      totalProjectsCount,
      activeProjectsCount,
      completedProjectsCount,
      delayedProjectsCount,
      revenuePaidAgg,
      expensePaidAgg,
      payrollPaidAgg,
      vendorBillsPendingAgg,
      invoicesUnpaidAgg,
      assetsStats,
      departmentsList,
      userCreatedList,
      leadList,
      projectList,
      invoiceList,
      vendorBillList,
      assetList,
      pendingApprovalsCount,
      unassignedUsers,
      unmanagedProfiles,
    ] = await Promise.all([
      this.prisma.user.count({ where: { company_id: companyId } }),
      this.prisma.user.count({ where: { company_id: companyId, is_active: true } }),
      this.prisma.user.count({ where: { company_id: companyId, is_active: false } }),
      this.prisma.attendance.groupBy({
        where: { user: { company_id: companyId } },
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.leaveRequest.count({
        where: {
          user: { company_id: companyId },
          status: 'APPROVED',
          start_date: { lte: now },
          end_date: { gte: now },
        },
      }),
      this.prisma.client.count({ where: { company_id: companyId } }),
      this.prisma.lead.count({ where: { company_id: companyId } }),
      this.prisma.lead.count({ where: { company_id: companyId, status: 'WON' } }),
      this.prisma.project.count({ where: { company_id: companyId } }),
      this.prisma.project.count({ where: { company_id: companyId, status: 'ACTIVE' } }),
      this.prisma.project.count({ where: { company_id: companyId, status: 'COMPLETED' } }),
      this.prisma.project.count({ where: { company_id: companyId, status: 'DELAYED' } }),
      
      // Finance calculations
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
      this.prisma.vendorBill.aggregate({
        where: { company_id: companyId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { company_id: companyId, status: 'UNPAID' },
        _sum: { amount: true },
      }),

      // Asset metrics
      this.prisma.asset.groupBy({
        where: { company_id: companyId },
        by: ['condition'],
        _count: { condition: true },
      }),

      // Lists & structures
      this.prisma.department.findMany({
        where: { company_id: companyId },
        include: {
          users: { where: { is_active: true } },
        },
      }),
      this.prisma.user.findMany({
        where: { company_id: companyId },
        select: { created_at: true },
      }),
      this.prisma.lead.findMany({
        where: { company_id: companyId },
      }),
      this.prisma.project.findMany({
        where: { company_id: companyId },
        orderBy: { budget: 'desc' },
        take: 5,
      }),
      this.prisma.invoice.findMany({
        where: { company_id: companyId, status: 'UNPAID' },
        include: { client: true },
        orderBy: { due_date: 'asc' },
        take: 5,
      }),
      this.prisma.vendorBill.findMany({
        where: { company_id: companyId, status: 'PENDING' },
        include: { vendor: true },
        orderBy: { due_date: 'asc' },
        take: 5,
      }),
      this.prisma.asset.findMany({
        where: { company_id: companyId, condition: 'UNDER_REPAIR' },
      }),
      this.prisma.approval.count({
        where: { company_id: companyId, status: 'PENDING' },
      }),
      this.prisma.user.findMany({
        where: { company_id: companyId, department_id: null },
      }),
      this.prisma.employeeProfile.findMany({
        where: { user: { company_id: companyId }, manager_id: null },
        include: { user: true },
      }),
    ]);

    // 2. Perform Calculations
    const totalPresent = attendanceStats.find((s) => s.status === 'PRESENT')?._count.status || 0;
    const totalLate = attendanceStats.find((s) => s.status === 'LATE')?._count.status || 0;
    const totalAttendanceCount = attendanceStats.reduce((acc, curr) => acc + curr._count.status, 0);
    const attendancePercentage = totalAttendanceCount > 0 ? ((totalPresent + totalLate) / totalAttendanceCount) * 100 : 96.5;

    const leadConversionRate = totalLeadsCount > 0 ? (totalLeadsWonCount / totalLeadsCount) * 100 : 25;

    const revenue = Number(revenuePaidAgg._sum.amount || 0);
    const expenses = Number(expensePaidAgg._sum.amount || 0);
    const payrollCost = Number(payrollPaidAgg._sum.net_paid || 0);
    const vendorPayables = Number(vendorBillsPendingAgg._sum.amount || 0);
    const invoiceReceivables = Number(invoicesUnpaidAgg._sum.amount || 0);

    const netProfit = revenue - expenses - payrollCost;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    const totalAssets = assetsStats.reduce((acc, curr) => acc + curr._count.condition, 0);
    const assignedAssets = assetsStats.find((s) => s.condition === 'ASSIGNED')?._count.condition || 0;
    const assetUtilization = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0;

    // 3. Trends & Distributions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCount = Array(12).fill(0);
    userCreatedList.forEach((u) => {
      const mIdx = new Date(u.created_at).getMonth();
      monthlyCount[mIdx]++;
    });

    const employeeGrowthTrend = months.map((month, idx) => ({
      name: month,
      count: monthlyCount.slice(0, idx + 1).reduce((acc, curr) => acc + curr, 0),
    }));

    // Lead Funnel distribution
    const stages = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];
    const leadFunnel = stages.map((stage) => ({
      stage,
      count: leadList.filter((l) => l.status === stage).length,
    }));

    const projectStatusDistribution = [
      { name: 'Active', count: activeProjectsCount },
      { name: 'Completed', count: completedProjectsCount },
      { name: 'Delayed', count: delayedProjectsCount },
    ];

    const departmentEmployeeDistribution = departmentsList.map((d) => ({
      departmentName: d.department_name,
      employeeCount: d.users.length,
    }));

    // Mock financial trends for charting
    const monthlyRevenueTrend = [
      { name: 'Mar', revenue: revenue * 0.3, expense: expenses * 0.3 },
      { name: 'Apr', revenue: revenue * 0.5, expense: expenses * 0.4 },
      { name: 'May', revenue: revenue * 0.8, expense: expenses * 0.7 },
      { name: 'Jun', revenue: revenue, expense: expenses },
    ];

    // 4. Alerts Compilation
    const alerts: string[] = [];
    if (pendingApprovalsCount > 0) {
      alerts.push(`There are ${pendingApprovalsCount} pending leave or expense approvals awaiting review.`);
    }
    if (invoiceReceivables > 0) {
      alerts.push(`Invoice receivables total $${invoiceReceivables.toLocaleString()} (unpaid client invoices).`);
    }
    if (vendorPayables > 0) {
      alerts.push(`Vendor payables total $${vendorPayables.toLocaleString()} (unpaid vendor bills).`);
    }
    if (assetList.length > 0) {
      alerts.push(`${assetList.length} IT assets are currently marked under repair.`);
    }
    unassignedUsers.forEach((u) => {
      alerts.push(`Employee "${u.first_name} ${u.last_name}" has no department assignment.`);
    });
    unmanagedProfiles.forEach((p) => {
      alerts.push(`Employee "${p.user.first_name} ${p.user.last_name}" has no reporting manager assigned.`);
    });

    return {
      kpis: {
        totalEmployees: totalEmployeesCount,
        activeEmployees: activeEmployeesCount,
        inactiveEmployees: inactiveEmployeesCount,
        attendancePercentage,
        employeesOnLeave: employeesOnLeaveCount,
        totalClients: totalClientsCount,
        activeClients: totalClientsCount,
        totalLeads: totalLeadsCount,
        leadConversionRate,
        totalProjects: totalProjectsCount,
        activeProjects: activeProjectsCount,
        completedProjects: completedProjectsCount,
        delayedProjects: delayedProjectsCount,
        totalRevenue: revenue,
        totalExpenses: expenses,
        payrollCost,
        vendorPayables,
        invoiceReceivables,
        netProfit,
        profitMargin,
        assetUtilization,
      },
      trends: {
        monthlyRevenueTrend,
        employeeGrowthTrend,
        leadFunnel,
        projectStatusDistribution,
        departmentEmployeeDistribution,
      },
      tables: {
        topProjects: projectList,
        pendingInvoices: invoiceList,
        pendingVendorBills: vendorBillList,
      },
      alerts,
    };
  }

  private async verifyTenant(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;

    const company = await this.prisma.company.findUnique({
      where: { company_id: companyId },
      select: { tenant_id: true },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    if (BigInt(currentUser.tenantId) !== company.tenant_id) {
      throw new ForbiddenException("Tenant access isolation violation: Cannot access another tenant's data.");
    }

    if (currentUser.companyType === 'SINGLE' && BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }
}
