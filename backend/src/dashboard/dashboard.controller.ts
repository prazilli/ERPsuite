import { Controller, Get, UseGuards, ForbiddenException, Post, Param } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('employee')
  async getEmployeeDashboard(@CurrentUser() user: any) {
    // Standard employees check their own dashboard details
    return this.dashboardService.getEmployeeDashboard(BigInt(user.id), BigInt(user.companyId));
  }

  @Get('department-head')
  async getDepartmentHeadDashboard(@CurrentUser() user: any) {
    if (user.roleName !== 'Department Head' && user.roleName !== 'Company Head / CEO') {
      throw new ForbiddenException('Only Department Heads or CEO can access team dashboard');
    }
    if (!user.departmentId) {
      throw new ForbiddenException('User is not assigned to any department');
    }
    return this.dashboardService.getDepartmentHeadDashboard(BigInt(user.departmentId), BigInt(user.companyId));
  }

  @Get('ceo')
  async getCeoDashboard(@CurrentUser() user: any) {
    if (user.roleName !== 'Company Head / CEO') {
      throw new ForbiddenException('Only CEO can access executive analytics dashboard');
    }
    return this.dashboardService.getCeoDashboard(BigInt(user.companyId));
  }

  @Get('department-requests')
  async getDepartmentRequests(@CurrentUser() user: any) {
    if (user.roleName !== 'Company Head / CEO') {
      throw new ForbiddenException('Only CEO can access department requests');
    }
    return this.dashboardService.getPendingDepartmentRequests(BigInt(user.companyId));
  }

  @Post('department-requests/:requestId/approve')
  async approveDepartmentRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: any
  ) {
    if (user.roleName !== 'Company Head / CEO') {
      throw new ForbiddenException('Only CEO can approve department requests');
    }
    return this.dashboardService.approveDepartmentRequest(BigInt(requestId), BigInt(user.id));
  }

  @Post('department-requests/:requestId/reject')
  async rejectDepartmentRequest(
    @Param('requestId') requestId: string,
    @CurrentUser() user: any
  ) {
    if (user.roleName !== 'Company Head / CEO') {
      throw new ForbiddenException('Only CEO can reject department requests');
    }
    return this.dashboardService.rejectDepartmentRequest(BigInt(requestId), BigInt(user.id));
  }
}
