import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // List all assets in the company
  async getAssets(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.asset.findMany({
      where: { company_id: companyId },
      include: {
        assignments: {
          include: {
            user: true,
          },
          orderBy: { assigned_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Register new asset
  async createAsset(companyId: bigint, data: any, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.asset.create({
      data: {
        company_id: companyId,
        name: data.name,
        serial_number: data.serialNumber,
        condition: 'AVAILABLE',
      },
    });
  }

  // Assign asset to employee
  async assignAsset(assetId: bigint, data: any, currentUser: any) {
    const asset = await this.prisma.asset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');
    this.verifyTenant(asset.company_id, currentUser);

    if (asset.condition !== 'AVAILABLE') {
      throw new BadRequestException('Asset is not available for assignment. Current status: ' + asset.condition);
    }

    return this.prisma.$transaction(async (tx) => {
      // Create assignment log
      const assignment = await tx.assetAssignment.create({
        data: {
          asset_id: assetId,
          user_id: BigInt(data.userId),
        },
      });

      // Update asset condition to ASSIGNED
      await tx.asset.update({
        where: { asset_id: assetId },
        data: { condition: 'ASSIGNED' },
      });

      // Log Workflow approval trace
      await tx.approval.create({
        data: {
          company_id: asset.company_id,
          module: 'ASSET_ASSIGNMENT',
          record_id: assignment.assignment_id,
          requested_by_id: BigInt(currentUser.id),
          status: 'APPROVED', // Auto-approved on assignment by admin
          comments: `Assigned asset "${asset.name}" to employee.`,
        },
      });

      return assignment;
    });
  }

  // Return asset
  async returnAsset(assetId: bigint, currentUser: any) {
    const asset = await this.prisma.asset.findUnique({
      where: { asset_id: assetId },
      include: { assignments: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    this.verifyTenant(asset.company_id, currentUser);

    const activeAssignment = asset.assignments.find((a) => !a.returned_at);
    if (!activeAssignment) {
      throw new BadRequestException('Asset is not currently assigned to any employee');
    }

    return this.prisma.$transaction(async (tx) => {
      // Mark assignment as returned
      await tx.assetAssignment.update({
        where: { assignment_id: activeAssignment.assignment_id },
        data: { returned_at: new Date() },
      });

      // Update asset status to AVAILABLE
      return tx.asset.update({
        where: { asset_id: assetId },
        data: { condition: 'AVAILABLE' },
      });
    });
  }

  // Update asset condition (repair/retirement lifecycle)
  async updateCondition(assetId: bigint, condition: string, currentUser: any) {
    const asset = await this.prisma.asset.findUnique({ where: { asset_id: assetId } });
    if (!asset) throw new NotFoundException('Asset not found');
    this.verifyTenant(asset.company_id, currentUser);

    // Validate enum condition
    const validConditions = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'RETIRED'];
    if (!validConditions.includes(condition)) {
      throw new BadRequestException('Invalid condition status');
    }

    return this.prisma.asset.update({
      where: { asset_id: assetId },
      data: { condition },
    });
  }

  // Get asset metrics
  async getAssetAnalytics(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);

    const [total, assigned, available, repair, retired] = await Promise.all([
      this.prisma.asset.count({ where: { company_id: companyId } }),
      this.prisma.asset.count({ where: { company_id: companyId, condition: 'ASSIGNED' } }),
      this.prisma.asset.count({ where: { company_id: companyId, condition: 'AVAILABLE' } }),
      this.prisma.asset.count({ where: { company_id: companyId, condition: 'UNDER_REPAIR' } }),
      this.prisma.asset.count({ where: { company_id: companyId, condition: 'RETIRED' } }),
    ]);

    const utilization = total > 0 ? (assigned / total) * 100 : 0;

    return {
      totalAssets: total,
      assignedAssets: assigned,
      availableAssets: available,
      assetsUnderRepair: repair,
      retiredAssets: retired,
      utilizationPercentage: utilization,
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
