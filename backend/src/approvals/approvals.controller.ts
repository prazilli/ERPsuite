import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('pending')
  async getPendingApprovals(@CurrentUser() user: any) {
    return this.approvalsService.getPendingApprovals(BigInt(user.companyId), user);
  }

  @Post(':approvalId/action')
  async actionApproval(
    @Param('approvalId') approvalId: string,
    @Body('action') action: 'APPROVED' | 'REJECTED',
    @Body('comments') comments: string,
    @CurrentUser() user: any
  ) {
    return this.approvalsService.actionApproval(BigInt(approvalId), action, comments, user);
  }
}
