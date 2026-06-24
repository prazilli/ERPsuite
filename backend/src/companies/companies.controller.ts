import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.getProfile(BigInt(id), user);
  }

  @Patch(':id/profile')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.companiesService.updateProfile(BigInt(id), body, user);
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.companiesService.getAnalytics(BigInt(id), user);
  }
}
