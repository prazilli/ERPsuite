import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tenants')
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id')
  async getTenant(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tenantsService.getTenant(BigInt(id), user);
  }

  @Patch(':id')
  async updateTenant(
    @Param('id') id: string,
    @Body('tenant_name') tenantName: string,
    @CurrentUser() user: any,
  ) {
    return this.tenantsService.updateTenant(BigInt(id), tenantName, user);
  }
}
