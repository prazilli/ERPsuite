import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('login-logs')
  async getLoginLogs(
    @Query('companyId', ParseIntPipe) companyId: number,
    @CurrentUser() user: any
  ) {
    return this.auditService.getLoginLogs(BigInt(companyId), user);
  }
}
