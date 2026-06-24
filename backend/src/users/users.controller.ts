import { Controller, Get, Post, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(
    @Query('companyId') companyId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.usersService.createUser(BigInt(companyId), body, user);
  }

  @Get()
  async findAll(
    @Query('companyId') companyId: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: any
  ) {
    return this.usersService.findAll(
      BigInt(companyId),
      user,
      search,
      page ? parseInt(page, 10) : undefined,
      limit ? parseInt(limit, 10) : undefined
    );
  }

  @Get('roles')
  async getRoles() {
    return this.usersService.getRoles();
  }

  @Post('roles/custom')
  async createCustomRole(@Body() body: any, @CurrentUser() user: any) {
    return this.usersService.createCustomRole(body, user);
  }

  @Get('permissions')
  async getPermissions() {
    return this.usersService.getPermissions();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(BigInt(id), user);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.usersService.updateUser(BigInt(id), body, user);
  }
}
