import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(companyId: bigint, data: any, currentUser: any) {
    await this.verifyTenant(companyId, currentUser);

    const isCompanyAdmin = currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin';
    const isDeptHead = currentUser.roleName === 'Department Head';
    const isSuperAdmin = currentUser.roleName === 'Super Admin';

    if (!isCompanyAdmin && !isDeptHead && !isSuperAdmin) {
      throw new ForbiddenException('Only administrators or Department Heads can register new employees.');
    }

    let departmentId = data.departmentId ? BigInt(data.departmentId) : null;
    if (isDeptHead) {
      departmentId = currentUser.departmentId ? BigInt(currentUser.departmentId) : null;
      if (!departmentId) {
        throw new BadRequestException('Department Head is not assigned to any department.');
      }
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('Email address is already in use.');
    }

    const passwordHash = await bcrypt.hash(data.password || 'Amdox123!', 10);

    const roleId = data.roleId ? BigInt(data.roleId) : 4n; // Default to Employee (role_id=4n)
    if (roleId === 1n && !isSuperAdmin) {
      throw new ForbiddenException('Cannot assign Super Admin role.');
    }

    const newUser = await this.prisma.user.create({
      data: {
        company_id: companyId,
        department_id: departmentId,
        first_name: data.firstName || (data.name ? data.name.split(' ')[0] : ''),
        last_name: data.lastName || (data.name ? data.name.split(' ').slice(1).join(' ') : ''),
        email: data.email,
        password_hash: passwordHash,
        phone: data.phone || null,
        role_id: roleId,
        is_active: true,
        email_verified: true, // Created directly by Admin
      },
    });

    return {
      user_id: newUser.user_id.toString(),
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      role_id: newUser.role_id.toString(),
      company_id: newUser.company_id.toString(),
      department_id: newUser.department_id ? newUser.department_id.toString() : null,
    };
  }

  async findAll(
    companyId: bigint,
    currentUser: any,
    search?: string,
    page?: number,
    limit?: number
  ) {
    await this.verifyTenant(companyId, currentUser);

    const isEmployeeOrSupervisor = (currentUser.roleName === 'Employee' || currentUser.roleName === 'Supervisor') && currentUser.departmentId;

    const where: any = {
      company_id: companyId,
      ...(isEmployeeOrSupervisor ? { department_id: BigInt(currentUser.departmentId) } : {}),
    };

    if (search) {
      where.OR = [
        { first_name: { contains: search } },
        { last_name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (page || limit) {
      const p = page || 1;
      const l = limit || 10;
      const skip = (p - 1) * l;

      const [users, totalCount] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: l,
          include: {
            role: true,
            department: true,
            employee_profile: {
              include: {
                manager: true,
              },
            },
          },
          orderBy: {
            first_name: 'asc',
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data: users.map((u) => ({
          id: u.user_id.toString(),
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          phone: u.phone,
          status: u.is_active ? 'active' : 'inactive',
          isActive: u.is_active,
          role: { id: u.role.role_id.toString(), name: u.role.role_name },
          department: u.department ? { id: u.department.department_id.toString(), name: u.department.department_name } : null,
          createdAt: u.created_at,
          jobTitle: u.employee_profile?.job_title || 'Associate',
          manager: u.employee_profile?.manager
            ? {
                id: u.employee_profile.manager.user_id.toString(),
                name: `${u.employee_profile.manager.first_name || ''} ${u.employee_profile.manager.last_name || ''}`.trim(),
              }
            : null,
        })),
        pagination: {
          total: totalCount,
          page: p,
          limit: l,
          totalPages: Math.ceil(totalCount / l),
        },
      };
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        department: true,
        employee_profile: {
          include: {
            manager: true,
          },
        },
      },
      orderBy: {
        first_name: 'asc',
      },
    });

    return users.map((u) => ({
      id: u.user_id.toString(),
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      firstName: u.first_name,
      lastName: u.last_name,
      email: u.email,
      phone: u.phone,
      status: u.is_active ? 'active' : 'inactive',
      isActive: u.is_active,
      role: { id: u.role.role_id.toString(), name: u.role.role_name },
      department: u.department ? { id: u.department.department_id.toString(), name: u.department.department_name } : null,
      createdAt: u.created_at,
      jobTitle: u.employee_profile?.job_title || 'Associate',
      manager: u.employee_profile?.manager
        ? {
            id: u.employee_profile.manager.user_id.toString(),
            name: `${u.employee_profile.manager.first_name || ''} ${u.employee_profile.manager.last_name || ''}`.trim(),
          }
        : null,
    }));
  }

  async findOne(id: bigint, currentUser: any) {
    const user = await this.prisma.user.findFirst({
      where: { user_id: id, is_active: true },
      include: {
        role: true,
        department: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.verifyTenant(user.company_id, currentUser);

    if (
      (currentUser.roleName === 'Employee' || currentUser.roleName === 'Supervisor') &&
      currentUser.departmentId &&
      user.department_id !== BigInt(currentUser.departmentId)
    ) {
      throw new ForbiddenException('Department isolation: You are restricted to your department users.');
    }

    return user;
  }

  async getRoles() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return roles.map((r) => ({
      id: r.role_id.toString(),
      name: r.role_name,
      description: r.description,
      permissions: r.permissions.map((p) => p.permission.permission_name),
    }));
  }

  async getPermissions() {
    const perms = await this.prisma.permission.findMany();
    return perms.map((p) => ({
      id: p.permission_id.toString(),
      name: p.permission_name,
    }));
  }

  async createCustomRole(data: any, currentUser: any) {
    if (currentUser.roleName !== 'Company Head / CEO' && currentUser.roleName !== 'Company Admin' && currentUser.roleName !== 'Super Admin') {
      throw new ForbiddenException('Only Administrators can define custom roles.');
    }

    const existing = await this.prisma.role.findUnique({
      where: { role_name: data.name },
    });

    if (existing) {
      throw new BadRequestException('Role name already exists.');
    }

    return this.prisma.$transaction(async (tx) => {
      const newRole = await tx.role.create({
        data: {
          role_name: data.name,
          description: data.description,
        },
      });

      if (data.permissionIds && data.permissionIds.length > 0) {
        for (const permId of data.permissionIds) {
          await tx.rolePermission.create({
            data: {
              role_id: newRole.role_id,
              permission_id: BigInt(permId),
            },
          });
        }
      }

      return tx.role.findUnique({
        where: { role_id: newRole.role_id },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
    });
  }

  async updateUser(userId: bigint, data: any, currentUser: any) {
    const targetUser = await this.prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    await this.verifyTenant(targetUser.company_id, currentUser);

    const isCompanyAdmin = currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin';
    const isSuperAdmin = currentUser.roleName === 'Super Admin';

    if (!isCompanyAdmin && !isSuperAdmin) {
      throw new ForbiddenException('Only administrators can update employee details.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update User Core
      const updatedUser = await tx.user.update({
        where: { user_id: userId },
        data: {
          first_name: data.firstName !== undefined ? data.firstName : undefined,
          last_name: data.lastName !== undefined ? data.lastName : undefined,
          phone: data.phone !== undefined ? data.phone : undefined,
          role_id: data.roleId ? BigInt(data.roleId) : undefined,
          department_id: data.departmentId !== undefined ? (data.departmentId ? BigInt(data.departmentId) : null) : undefined,
          is_active: data.isActive !== undefined ? data.isActive : undefined,
        },
      });

      // Update EmployeeProfile relation
      if (data.managerId !== undefined || data.jobTitle !== undefined) {
        await tx.employeeProfile.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            job_title: data.jobTitle || 'Associate',
            hire_date: new Date(),
            manager_id: data.managerId ? BigInt(data.managerId) : null,
            status: data.isActive === false ? 'INACTIVE' : 'ACTIVE',
          },
          update: {
            job_title: data.jobTitle !== undefined ? data.jobTitle : undefined,
            manager_id: data.managerId !== undefined ? (data.managerId ? BigInt(data.managerId) : null) : undefined,
            status: data.isActive === false ? 'INACTIVE' : 'ACTIVE',
          },
        });
      }

      return updatedUser;
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
}
