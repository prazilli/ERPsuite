import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  async create(
    @Query('companyId') companyId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.departmentsService.create(BigInt(companyId), body, user);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId: string,
    @CurrentUser() user: any
  ) {
    return this.departmentsService.findAll(BigInt(companyId), user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.findOne(BigInt(id), user);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.departmentsService.update(BigInt(id), body, user);
  }

  @Patch(':id/assign-head')
  async assignHead(
    @Param('id') id: string,
    @Body('userId') userId: string | number,
    @CurrentUser() user: any
  ) {
    return this.departmentsService.assignHead(BigInt(id), BigInt(userId), user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.remove(BigInt(id), user);
  }

  @Get(':id/metrics')
  async getMetrics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.getMetrics(BigInt(id), user);
  }
}
