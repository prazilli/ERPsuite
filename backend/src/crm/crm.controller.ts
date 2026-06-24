import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Get('leads')
  async getLeads(@CurrentUser() user: any) {
    return this.crmService.getLeads(BigInt(user.companyId), user);
  }

  @Post('leads')
  async createLead(@Body() body: any, @CurrentUser() user: any) {
    return this.crmService.createLead(BigInt(user.companyId), body, user);
  }

  @Patch('leads/:leadId')
  async updateLead(
    @Param('leadId') leadId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.crmService.updateLead(BigInt(leadId), body, user);
  }

  @Delete('leads/:leadId')
  async deleteLead(@Param('leadId') leadId: string, @CurrentUser() user: any) {
    return this.crmService.deleteLead(BigInt(leadId), user);
  }

  @Get('clients')
  async getClients(@CurrentUser() user: any) {
    return this.crmService.getClients(BigInt(user.companyId), user);
  }

  @Post('clients')
  async createClient(@Body() body: any, @CurrentUser() user: any) {
    return this.crmService.createClient(BigInt(user.companyId), body, user);
  }
}
