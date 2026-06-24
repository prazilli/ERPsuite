import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(companyId: bigint, data: any, currentUser: any) {
    await this.verifyCompanyAdmin(companyId, currentUser);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Department
      const dept = await tx.department.create({
        data: {
          company_id: companyId,
          department_name: data.name,
          description: data.description,
          is_custom: true,
          created_by: currentUser.id,
        },
      });

      // 2. Create features enabled
      const features = data.featuresEnabled || ['analytics', 'tasks'];
      for (const f of features) {
        await tx.departmentFeature.create({
          data: {
            department_id: dept.department_id,
            feature_name: f,
            enabled: true,
          },
        });
      }

      return dept;
    });
  }

  async findAll(companyId: bigint, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);

    const isEmployeeOrSupervisor = (currentUser.roleName === 'Employee' || currentUser.roleName === 'Supervisor') && currentUser.departmentId;

    const departments = await this.prisma.department.findMany({
      where: {
        company_id: companyId,
        ...(isEmployeeOrSupervisor ? { department_id: BigInt(currentUser.departmentId) } : {}),
      },
      include: {
        features: true,
        users: {
          where: {
            role: {
              role_name: 'Department Head',
            },
          },
        },
      },
    });

    return departments.map((dept) => {
      const headUser = dept.users[0];
      return {
        department_id: dept.department_id,
        company_id: dept.company_id,
        department_name: dept.department_name,
        description: dept.description,
        is_custom: dept.is_custom,
        created_by: dept.created_by,
        created_at: dept.created_at,
        features: dept.features,
        head: headUser
          ? {
              id: headUser.user_id.toString(),
              name: `${headUser.first_name} ${headUser.last_name}`.trim(),
              email: headUser.email,
            }
          : null,
      };
    });
  }

  async findOne(id: bigint, currentUser: any) {
    const dept = await this.prisma.department.findUnique({
      where: { department_id: id },
      include: {
        features: true,
        users: {
          where: {
            role: {
              role_name: 'Department Head',
            },
          },
        },
      },
    });

    if (!dept) {
      throw new NotFoundException('Department not found');
    }

    await this.verifyTenant(dept.company_id, currentUser);
    this.verifyDepartmentIsolation(dept.department_id, currentUser);

    const headUser = dept.users[0];
    return {
      department_id: dept.department_id,
      company_id: dept.company_id,
      department_name: dept.department_name,
      description: dept.description,
      is_custom: dept.is_custom,
      created_by: dept.created_by,
      created_at: dept.created_at,
      features: dept.features,
      head: headUser
        ? {
            id: headUser.user_id.toString(),
            name: `${headUser.first_name} ${headUser.last_name}`.trim(),
            email: headUser.email,
          }
        : null,
    };
  }

  async update(id: bigint, data: any, currentUser: any) {
    const dept = await this.findOne(id, currentUser);

    // Authorization checks
    const isCompanyAdmin = (currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin') && BigInt(currentUser.companyId) === dept.company_id;
    const isSuperAdmin = currentUser.roleName === 'Super Admin';

    if (!isCompanyAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only Company Head / CEO or Super Admin can modify department configurations.');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.department_name = data.name;
    if (data.description !== undefined) updateData.description = data.description;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Core
      const updatedDept = await tx.department.update({
        where: { department_id: id },
        data: updateData,
      });

      // 2. Sync Features if provided
      if (data.featuresEnabled !== undefined) {
        // Clear previous
        await tx.departmentFeature.deleteMany({
          where: { department_id: id },
        });

        // Add updated
        for (const feature of data.featuresEnabled) {
          await tx.departmentFeature.create({
            data: {
              department_id: id,
              feature_name: feature,
              enabled: true,
            },
          });
        }
      }

      return tx.department.findUnique({
        where: { department_id: id },
        include: { features: true },
      });
    });
  }

  async remove(id: bigint, currentUser: any) {
    const dept = await this.findOne(id, currentUser);
    await this.verifyCompanyAdmin(dept.company_id, currentUser);

    return this.prisma.department.delete({
      where: { department_id: id },
    });
  }

  // Get dynamic dashboard metrics based on features
  async getMetrics(id: bigint, currentUser: any) {
    const dept = await this.findOne(id, currentUser);
    const deptName = dept.department_name.toLowerCase();

    if (deptName.includes('finance')) {
      return {
        revenue: [150000, 185000, 220000, 210000, 245000, 270000],
        expenses: [90000, 95000, 110000, 115000, 120000, 135000],
        apAmount: 45000,
        arAmount: 89000,
        budgetAllocated: 500000,
        recentTransactions: [
          { date: '2026-06-20', desc: 'SaaS Software License Subscription', amount: -1200, category: 'Software' },
          { date: '2026-06-18', desc: 'Enterprise Client Invoice Recv', amount: 15400, category: 'Revenue' },
          { date: '2026-06-15', desc: 'Office Rent & Facilities Support', amount: -4500, category: 'Utilities' },
        ],
      };
    } else if (deptName.includes('hr') || deptName.includes('payroll')) {
      return {
        employeesCount: 45,
        leavesPending: 6,
        avgAttendanceRate: 96.4,
        payrollTotal: 185000,
        recentLeaves: [
          { applicant: 'Sarah Connor', type: 'Sick Leave', duration: '2 days', status: 'Pending' },
          { applicant: 'John Doe', type: 'Annual Leave', duration: '5 days', status: 'Approved' },
        ],
      };
    } else if (deptName.includes('supply') || deptName.includes('chain')) {
      return {
        stockLevelPercent: 78,
        activeVendors: 14,
        pendingPurchaseOrders: 8,
        logisticsScore: 92.5,
        inventoryAlerts: [
          { item: 'Server Rack Rails', stock: 4, status: 'Reorder Level' },
          { item: 'Cat6 Ethernet Spools', stock: 2, status: 'Critical Low' },
        ],
      };
    } else if (deptName.includes('project')) {
      return {
        activeProjectsCount: 5,
        sprintsCompleted: 24,
        averageBurnRate: 85,
        milestonesAchieved: 18,
        tasksOverview: { todo: 12, inProgress: 8, review: 4, done: 45 },
      };
    } else if (deptName.includes('it') || deptName.includes('admin')) {
      return {
        activeSessions: 142,
        unresolvedTickets: 4,
        systemUptime: 99.98,
        securityThreatsBlocked: 254,
        auditRecentActions: [
          { time: '10 mins ago', user: 'basavaraj@amdox.com', action: 'Modified system permissions mapping' },
          { time: '1 hour ago', user: 'system_cron', action: 'Purged temporary login attempts keys' },
        ],
      };
    } else if (deptName.includes('executive')) {
      return {
        overallNetMargin: 24.5,
        marketGrowth: 15.2,
        globalComplianceRate: 100,
        recentKpis: [
          { label: 'EBITDA', target: '2.5M', current: '2.38M', status: 'On Target' },
          { label: 'Customer Retention', target: '95%', current: '96.2%', status: 'Exceeded' },
        ],
      };
    }

    return {
      activitiesCount: 23,
      productivityIndex: 90,
      goalsMetPercent: 88,
    };
  }

  async assignHead(id: bigint, targetUserId: bigint, currentUser: any) {
    // 1. Fetch department and verify CEO authority
    const dept = await this.prisma.department.findUnique({
      where: { department_id: id },
    });
    if (!dept) {
      throw new NotFoundException('Department not found');
    }
    await this.verifyCompanyAdmin(dept.company_id, currentUser);

    // 2. Fetch target user and verify they belong to same company
    const targetUser = await this.prisma.user.findUnique({
      where: { user_id: targetUserId },
    });
    if (!targetUser) {
      throw new NotFoundException('Target employee not found');
    }
    if (targetUser.company_id !== dept.company_id) {
      throw new ForbiddenException('Target employee belongs to another company.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 3. Demote any existing head of this department to standard Employee
      const employeeRole = await tx.role.findFirst({
        where: { role_name: 'Employee' },
      });
      const deptHeadRole = await tx.role.findFirst({
        where: { role_name: 'Department Head' },
      });

      if (!employeeRole || !deptHeadRole) {
        throw new BadRequestException('Required roles do not exist in database.');
      }

      await tx.user.updateMany({
        where: {
          department_id: id,
          role_id: deptHeadRole.role_id,
        },
        data: {
          role_id: employeeRole.role_id,
        },
      });

      // 4. Promote target user to Department Head and set their department
      await tx.user.update({
        where: { user_id: targetUserId },
        data: {
          role_id: deptHeadRole.role_id,
          department_id: id,
        },
      });

      return { message: 'Department head assigned successfully' };
    });
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

  private async verifyCompanyAdmin(companyId: bigint, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);
    if (currentUser.roleName !== 'Company Head / CEO' && currentUser.roleName !== 'Company Admin' && currentUser.roleName !== 'Super Admin') {
      throw new ForbiddenException('Only Company Administrators can perform this action.');
    }
  }

  private verifyDepartmentIsolation(departmentId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin' || currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin') return;
    if (currentUser.departmentId && BigInt(currentUser.departmentId) !== departmentId) {
      throw new ForbiddenException('Department isolation check failed: You are restricted to your assigned department.');
    }
  }
}
