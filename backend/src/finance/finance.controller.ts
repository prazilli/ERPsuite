import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  async getInvoices(@CurrentUser() user: any) {
    return this.financeService.getInvoices(BigInt(user.companyId), user);
  }

  @Post('invoices')
  async createInvoice(@Body() body: any, @CurrentUser() user: any) {
    return this.financeService.createInvoice(BigInt(user.companyId), body, user);
  }

  @Post('invoices/:invoiceId/pay')
  async payInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.financeService.payInvoice(BigInt(invoiceId), body, user);
  }

  @Get('expenses')
  async getExpenses(@CurrentUser() user: any) {
    return this.financeService.getExpenses(BigInt(user.companyId), user);
  }

  @Post('expenses')
  async createExpense(@Body() body: any, @CurrentUser() user: any) {
    return this.financeService.createExpense(BigInt(user.companyId), body, user);
  }

  @Get('vendor-bills')
  async getVendorBills(@CurrentUser() user: any) {
    return this.financeService.getVendorBills(BigInt(user.companyId), user);
  }

  @Post('vendor-bills')
  async createVendorBill(@Body() body: any, @CurrentUser() user: any) {
    return this.financeService.createVendorBill(BigInt(user.companyId), body, user);
  }

  @Get('vendors')
  async getVendors(@CurrentUser() user: any) {
    return this.financeService.getVendors(BigInt(user.companyId), user);
  }

  @Post('vendors')
  async createVendor(@Body() body: any, @CurrentUser() user: any) {
    return this.financeService.createVendor(BigInt(user.companyId), body, user);
  }

  @Get('analytics')
  async getFinancialAnalytics(@CurrentUser() user: any) {
    return this.financeService.getFinancialAnalytics(BigInt(user.companyId), user);
  }
}
