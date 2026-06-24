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
exports.CrmService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CrmService = class CrmService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeads(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.lead.findMany({
            where: { company_id: companyId },
            orderBy: { created_at: 'desc' },
        });
    }
    async createLead(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.lead.create({
            data: {
                company_id: companyId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                status: data.status || 'NEW',
                value: Number(data.value || 0),
                source: data.source,
            },
        });
    }
    async updateLead(leadId, data, currentUser) {
        const lead = await this.prisma.lead.findUnique({ where: { lead_id: leadId } });
        if (!lead) {
            throw new common_1.NotFoundException('Lead not found');
        }
        this.verifyTenant(lead.company_id, currentUser);
        return this.prisma.$transaction(async (tx) => {
            const updatedLead = await tx.lead.update({
                where: { lead_id: leadId },
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    status: data.status,
                    value: data.value !== undefined ? Number(data.value) : undefined,
                    source: data.source,
                },
            });
            if (data.status === 'WON' && lead.status !== 'WON') {
                const existingClient = await tx.client.findFirst({
                    where: {
                        company_id: lead.company_id,
                        OR: [
                            { email: updatedLead.email || undefined },
                            { name: updatedLead.name },
                        ],
                    },
                });
                if (!existingClient) {
                    await tx.client.create({
                        data: {
                            company_id: lead.company_id,
                            name: updatedLead.name,
                            email: updatedLead.email,
                            phone: updatedLead.phone,
                            address: 'Converted from Lead ID ' + leadId,
                        },
                    });
                }
            }
            return updatedLead;
        });
    }
    async deleteLead(leadId, currentUser) {
        const lead = await this.prisma.lead.findUnique({ where: { lead_id: leadId } });
        if (!lead)
            throw new common_1.NotFoundException('Lead not found');
        this.verifyTenant(lead.company_id, currentUser);
        await this.prisma.lead.delete({
            where: { lead_id: leadId },
        });
        return { success: true };
    }
    async getClients(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.client.findMany({
            where: { company_id: companyId },
            orderBy: { name: 'asc' },
        });
    }
    async createClient(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.client.create({
            data: {
                company_id: companyId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
            },
        });
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
};
exports.CrmService = CrmService;
exports.CrmService = CrmService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CrmService);
//# sourceMappingURL=crm.service.js.map