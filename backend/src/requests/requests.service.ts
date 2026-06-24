import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitRequest(companyId: number, data: any, currentUser: any) {
    this.verifyTenant(companyId, currentUser);

    return this.prisma.departmentCreationRequest.create({
      data: {
        company_id: BigInt(companyId),
        requested_by_id: BigInt(currentUser.id),
        department_name: data.departmentName,
        description: data.description || null,
        status: 'pending',
      },
    });
  }

  async findAll(companyId: number, currentUser: any) {
    this.verifyTenant(companyId, currentUser);

    // Company Head / CEO or Admin sees all requests in their company
    if (currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin' || currentUser.roleName === 'Super Admin' || currentUser.roleName === 'Auditor') {
      return this.prisma.departmentCreationRequest.findMany({
        where: { company_id: BigInt(companyId) },
        include: {
          requested_by: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          approved_by: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    // Standard users see only their own requests
    return this.prisma.departmentCreationRequest.findMany({
      where: {
        company_id: BigInt(companyId),
        requested_by_id: BigInt(currentUser.id),
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
        approved_by: {
          select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async approveRequest(requestId: number, currentUser: any) {
    const request = await this.prisma.departmentCreationRequest.findUnique({
      where: { request_id: BigInt(requestId) },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    this.verifyCompanyAdmin(Number(request.company_id), currentUser);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is already processed');
    }

    // Run transaction: update request status, and dynamically create new department
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Request
      const updatedRequest = await tx.departmentCreationRequest.update({
        where: { request_id: BigInt(requestId) },
        data: {
          status: 'approved',
          approved_by_id: BigInt(currentUser.id),
        },
      });

      // 2. Create Department dynamically
      const newDepartment = await tx.department.create({
        data: {
          company_id: request.company_id,
          department_name: request.department_name,
          description: request.description || `Custom department created via request #${requestId}`,
          is_custom: true,
        },
      });

      // Scaffold department features
      const defaultFeatures = ['analytics', 'tasks'];
      for (const feature of defaultFeatures) {
        await tx.departmentFeature.create({
          data: {
            department_id: newDepartment.department_id,
            feature_name: feature,
            enabled: true,
          },
        });
      }

      // 3. Upgrade requesting user to Department Head if they are currently an Employee
      const requester = await tx.user.findUnique({
        where: { user_id: request.requested_by_id },
      });

      const employeeRole = await tx.role.findUnique({ where: { role_name: 'Employee' } });
      const deptHeadRole = await tx.role.findUnique({ where: { role_name: 'Department Head' } });

      if (requester && employeeRole && deptHeadRole && requester.role_id === employeeRole.role_id) {
        await tx.user.update({
          where: { user_id: request.requested_by_id },
          data: {
            role_id: deptHeadRole.role_id, // Promote to Department Head
            department_id: newDepartment.department_id,
          },
        });
      }

      return { request: updatedRequest, department: newDepartment };
    });
  }

  async rejectRequest(requestId: number, currentUser: any) {
    const request = await this.prisma.departmentCreationRequest.findUnique({
      where: { request_id: BigInt(requestId) },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    this.verifyCompanyAdmin(Number(request.company_id), currentUser);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is already processed');
    }

    return this.prisma.departmentCreationRequest.update({
      where: { request_id: BigInt(requestId) },
      data: {
        status: 'rejected',
        approved_by_id: BigInt(currentUser.id), // Field re-used for processing administrator ID
      },
    });
  }

  // Tenant Verification
  private verifyTenant(companyId: number, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (String(currentUser.companyId) !== String(companyId)) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }

  // Company Admin Verification
  private verifyCompanyAdmin(companyId: number, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    if (currentUser.roleName !== 'Company Head / CEO' && currentUser.roleName !== 'Company Admin' && currentUser.roleName !== 'Super Admin') {
      throw new ForbiddenException('Only Company Administrators can approve/reject department creation requests.');
    }
  }
}
