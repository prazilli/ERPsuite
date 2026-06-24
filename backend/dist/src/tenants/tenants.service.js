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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TenantsService = class TenantsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTenant(name) {
        return this.prisma.tenant.create({
            data: {
                tenant_name: name,
            },
        });
    }
    async getTenant(tenantId, currentUser) {
        this.verifyTenantAccess(tenantId, currentUser);
        const tenant = await this.prisma.tenant.findUnique({
            where: { tenant_id: tenantId },
            include: {
                companies: true,
            },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
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
    async updateTenant(tenantId, name, currentUser) {
        this.verifyTenantAccess(tenantId, currentUser);
        const tenant = await this.prisma.tenant.findUnique({
            where: { tenant_id: tenantId },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
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
    verifyTenantAccess(tenantId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.tenantId) !== tenantId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access other tenant data.');
        }
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map