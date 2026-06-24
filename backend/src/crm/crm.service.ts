import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // List all leads in the company
  async getLeads(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.lead.findMany({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });
  }

  // Create a new lead
  async createLead(companyId: bigint, data: any, currentUser: any) {
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

  // Update a lead (with automated lead-to-client WON trigger)
  async updateLead(leadId: bigint, data: any, currentUser: any) {
    const lead = await this.prisma.lead.findUnique({ where: { lead_id: leadId } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
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

      // Auto conversion to Client if status updated to WON
      if (data.status === 'WON' && lead.status !== 'WON') {
        // Check if client already exists with same email/name
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

  // Delete lead
  async deleteLead(leadId: bigint, currentUser: any) {
    const lead = await this.prisma.lead.findUnique({ where: { lead_id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');
    this.verifyTenant(lead.company_id, currentUser);

    await this.prisma.lead.delete({
      where: { lead_id: leadId },
    });
    return { success: true };
  }

  // List all clients
  async getClients(companyId: bigint, currentUser: any) {
    this.verifyTenant(companyId, currentUser);
    return this.prisma.client.findMany({
      where: { company_id: companyId },
      orderBy: { name: 'asc' },
    });
  }

  // Create client manually
  async createClient(companyId: bigint, data: any, currentUser: any) {
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

  // Tenant helper
  private verifyTenant(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }
}
