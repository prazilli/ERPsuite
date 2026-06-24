import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { HrmsService } from './hrms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('hrms')
@UseGuards(JwtAuthGuard)
export class HrmsController {
  constructor(private readonly hrmsService: HrmsService) {}

  @Get('employees')
  async getEmployees(@CurrentUser() user: any) {
    return this.hrmsService.getEmployees(BigInt(user.companyId), user);
  }

  @Get('employees/:userId/profile')
  async getProfile(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.getProfile(BigInt(userId), user);
  }

  @Patch('employees/:userId/profile')
  async updateProfile(
    @Param('userId') userId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.hrmsService.updateProfile(BigInt(userId), body, user);
  }

  @Get('employees/:userId/attendance')
  async getAttendance(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.getAttendance(BigInt(userId), user);
  }

  @Post('employees/:userId/check-in')
  async checkIn(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.checkIn(BigInt(userId), user);
  }

  @Post('employees/:userId/check-out')
  async checkOut(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.checkOut(BigInt(userId), user);
  }

  @Post('employees/:userId/leaves')
  async applyLeave(
    @Param('userId') userId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.hrmsService.applyLeave(BigInt(userId), body, user);
  }

  @Get('employees/:userId/leaves')
  async getLeaveRequests(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.getLeaveRequests(BigInt(userId), user);
  }

  @Get('leaves/team')
  async getTeamLeaveRequests(@CurrentUser() user: any) {
    return this.hrmsService.getTeamLeaveRequests(user);
  }

  @Get('employees/:userId/payroll')
  async getPayrollHistory(@Param('userId') userId: string, @CurrentUser() user: any) {
    return this.hrmsService.getPayrollHistory(BigInt(userId), user);
  }

  @Get('holidays')
  async getHolidays(@CurrentUser() user: any) {
    return this.hrmsService.getHolidays(BigInt(user.companyId), user);
  }
}
