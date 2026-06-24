import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async submitRequest(
    @Query('companyId', ParseIntPipe) companyId: number,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.requestsService.submitRequest(companyId, body, user);
  }

  @Get()
  async findAll(
    @Query('companyId', ParseIntPipe) companyId: number,
    @CurrentUser() user: any
  ) {
    return this.requestsService.findAll(companyId, user);
  }

  @Post(':id/approve')
  async approveRequest(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.requestsService.approveRequest(id, user);
  }

  @Post(':id/reject')
  async rejectRequest(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.requestsService.rejectRequest(id, user);
  }
}
