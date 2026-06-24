import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailVerificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: bigint | number;
    email: string;
    otpCode: string;
    expiresAt: Date;
  }) {
    return this.prisma.emailVerification.create({
      data: {
        user_id: BigInt(data.userId),
        email: data.email,
        otp_code: data.otpCode,
        expires_at: data.expiresAt,
        attempts: 0,
        verified: false,
      },
    });
  }

  async findLatestPending(email: string) {
    return this.prisma.emailVerification.findFirst({
      where: { email, verified: false },
      orderBy: { created_at: 'desc' },
    });
  }

  async incrementAttempts(verificationId: bigint | number, currentAttempts: number) {
    return this.prisma.emailVerification.update({
      where: { verification_id: BigInt(verificationId) },
      data: { attempts: currentAttempts + 1 },
    });
  }

  async markAsVerified(verificationId: bigint | number) {
    return this.prisma.emailVerification.update({
      where: { verification_id: BigInt(verificationId) },
      data: { verified: true },
    });
  }
}
