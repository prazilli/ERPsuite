import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { IsEmail, IsNotEmpty } from 'class-validator';

class TestEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

@Controller('api/debug')
export class DebugController {
  private readonly logger = new Logger(DebugController.name);

  constructor(private readonly mailService: MailService) {}

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  async testEmail(@Body() dto: TestEmailDto) {
    this.logger.log(`POST /api/debug/test-email invoked for recipient: ${dto.email}`);
    try {
      const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send the test OTP email
      await this.mailService.sendOtpEmail(dto.email, testOtp, 'Debug Tester');

      return {
        success: true,
        message: 'SMTP Verification and email dispatch succeeded.',
        details: {
          recipient: dto.email,
          otp: testOtp,
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          user: process.env.SMTP_USER,
        },
      };
    } catch (err: any) {
      this.logger.error(`POST /api/debug/test-email failed: ${err.message}`, err.stack);
      return {
        success: false,
        message: 'SMTP verification or email dispatch failed.',
        error: err.message,
        stack: err.stack,
        details: {
          recipient: dto.email,
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT),
          user: process.env.SMTP_USER,
        },
      };
    }
  }
}
