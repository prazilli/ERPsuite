import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTenant(name: string) {
    return this.prisma.tenant.create({
      data: {
        tenant_name: name,
      },
    });
  }

  async getTenant(tenantId: bigint, currentUser: any) {
    this.verifyTenantAccess(tenantId, currentUser);

    const tenant = await this.prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
      include: {
        companies: true,
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      tenant_id: tenant.tenant_id.toString(),
      tenant_name: tenant.tenant_name,
      created_at: tenant.created_at,
      companies: tenant.companies.map((company) => ({
        company_id: company.company_id.toString(),
        company_name: company.company_name,
        company_type: company.company_type,
        created_at: company.created_at,
      })),
    };
  }

  async updateTenant(tenantId: bigint, name: string, currentUser: any) {
    this.verifyTenantAccess(tenantId, currentUser);

    const tenant = await this.prisma.tenant.findUnique({
      where: { tenant_id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const updated = await this.prisma.tenant.update({
      where: { tenant_id: tenantId },
      data: {
        tenant_name: name,
      },
    });

    return {
      tenant_id: updated.tenant_id.toString(),
      tenant_name: updated.tenant_name,
      created_at: updated.created_at,
    };
  }

  private verifyTenantAccess(tenantId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.tenantId) !== tenantId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access other tenant data.');
    }
  }
}
