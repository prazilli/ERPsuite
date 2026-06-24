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
exports.AssetsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AssetsService = class AssetsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAssets(companyId, currentUser) {
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
    async createAsset(companyId, data, currentUser) {
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
    async assignAsset(assetId, data, currentUser) {
        const asset = await this.prisma.asset.findUnique({ where: { asset_id: assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        this.verifyTenant(asset.company_id, currentUser);
        if (asset.condition !== 'AVAILABLE') {
            throw new common_1.BadRequestException('Asset is not available for assignment. Current status: ' + asset.condition);
        }
        return this.prisma.$transaction(async (tx) => {
            const assignment = await tx.assetAssignment.create({
                data: {
                    asset_id: assetId,
                    user_id: BigInt(data.userId),
                },
            });
            await tx.asset.update({
                where: { asset_id: assetId },
                data: { condition: 'ASSIGNED' },
            });
            await tx.approval.create({
                data: {
                    company_id: asset.company_id,
                    module: 'ASSET_ASSIGNMENT',
                    record_id: assignment.assignment_id,
                    requested_by_id: BigInt(currentUser.id),
                    status: 'APPROVED',
                    comments: `Assigned asset "${asset.name}" to employee.`,
                },
            });
            return assignment;
        });
    }
    async returnAsset(assetId, currentUser) {
        const asset = await this.prisma.asset.findUnique({
            where: { asset_id: assetId },
            include: { assignments: true },
        });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        this.verifyTenant(asset.company_id, currentUser);
        const activeAssignment = asset.assignments.find((a) => !a.returned_at);
        if (!activeAssignment) {
            throw new common_1.BadRequestException('Asset is not currently assigned to any employee');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.assetAssignment.update({
                where: { assignment_id: activeAssignment.assignment_id },
                data: { returned_at: new Date() },
            });
            return tx.asset.update({
                where: { asset_id: assetId },
                data: { condition: 'AVAILABLE' },
            });
        });
    }
    async updateCondition(assetId, condition, currentUser) {
        const asset = await this.prisma.asset.findUnique({ where: { asset_id: assetId } });
        if (!asset)
            throw new common_1.NotFoundException('Asset not found');
        this.verifyTenant(asset.company_id, currentUser);
        const validConditions = ['AVAILABLE', 'ASSIGNED', 'UNDER_REPAIR', 'RETIRED'];
        if (!validConditions.includes(condition)) {
            throw new common_1.BadRequestException('Invalid condition status');
        }
        return this.prisma.asset.update({
            where: { asset_id: assetId },
            data: { condition },
        });
    }
    async getAssetAnalytics(companyId, currentUser) {
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
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AssetsService);
//# sourceMappingURL=assets.service.js.map