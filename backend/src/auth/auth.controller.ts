import { Controller, Post, Body, Req, Headers, Ip, UseGuards, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ResetPasswordRequestDto,
  ResetPasswordConfirmDto,
  TestEmailDto,
  ResendOtpDto
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body() dto: ResendOtpDto) {
    return this.authService.resendOtp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string, @Body('userId') userId: string | number) {
    return this.authService.refreshTokens(BigInt(userId), refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(BigInt(user.id));
  }

  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  async resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password-confirm')
  @HttpCode(HttpStatus.OK)
  async resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    return this.authService.confirmPasswordReset(dto);
  }

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() dto: TestEmailDto) {
    return this.authService.sendTestOtpEmail(dto.email);
  }

  @Get('companies')
  async getCompanies() {
    return this.authService.getCompanies();
  }

  @Get('companies/:companyId/departments')
  async getDepartments(@Param('companyId') companyId: string) {
    return this.authService.getDepartmentsByCompanyId(BigInt(companyId));
  }
}
