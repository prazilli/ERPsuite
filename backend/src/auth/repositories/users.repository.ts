import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { role: true, company: true },
    });
  }

  async findById(userId: bigint | number) {
    return this.prisma.user.findUnique({
      where: { user_id: BigInt(userId) },
      include: { role: true, company: true },
    });
  }

  async createUser(data: {
    companyName: string;
    departmentName?: string;
    isNewDepartmentRequest?: boolean;
    roleId: bigint | number;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify Role exists
      const role = await tx.role.findUnique({
        where: { role_id: BigInt(data.roleId) },
      });
      if (!role) {
        throw new Error('Selected role does not exist');
      }

      // 2. Find or Create Company
      let company = await tx.company.findFirst({
        where: { company_name: data.companyName },
      });
      if (!company) {
        const tenant = await tx.tenant.create({
          data: {
            tenant_name: `${data.companyName} Tenant`,
          },
        });
        company = await tx.company.create({
          data: {
            company_name: data.companyName,
            company_type: 'SINGLE',
            tenant_id: tenant.tenant_id,
          },
        });
      }

      // 3. Find or Create Department (if provided)
      let department: any = null;
      if (data.departmentName && !data.isNewDepartmentRequest) {
        department = await tx.department.findFirst({
          where: {
            company_id: company.company_id,
            department_name: data.departmentName,
          },
        });
        if (!department) {
          department = await tx.department.create({
            data: {
              company_id: company.company_id,
              department_name: data.departmentName,
              is_custom: true,
            },
          });

          // Scaffold department feature
          await tx.departmentFeature.create({
            data: {
              department_id: department.department_id,
              feature_name: 'analytics',
              enabled: true,
            },
          });
        }
      }

      // 4. Create User
      const user = await tx.user.create({
        data: {
          company_id: company.company_id,
          department_id: department ? department.department_id : null,
          role_id: BigInt(data.roleId),
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password_hash: data.passwordHash,
          phone: data.phone || null,
          is_active: true,
          email_verified: false,
        },
      });

      // 5. Create DepartmentCreationRequest if needed
      if (data.isNewDepartmentRequest && data.departmentName) {
        await tx.departmentCreationRequest.create({
          data: {
            company_id: company.company_id,
            requested_by_id: user.user_id,
            department_name: data.departmentName,
            status: 'pending',
          },
        });
      }

      return user;
    });
  }

  async updateUserEmailVerified(userId: bigint | number, verified: boolean) {
    return this.prisma.user.update({
      where: { user_id: BigInt(userId) },
      data: { email_verified: verified },
    });
  }
}
