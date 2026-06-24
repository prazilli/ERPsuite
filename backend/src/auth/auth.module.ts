import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { AuditModule } from '../audit/audit.module';
import { RolesRepository } from './repositories/roles.repository';
import { UsersRepository } from './repositories/users.repository';
import { EmailVerificationsRepository } from './repositories/email-verifications.repository';

@Module({
  imports: [
    PrismaModule,
    CacheModule,
    AuditModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RolesRepository,
    UsersRepository,
    EmailVerificationsRepository,
  ],
  exports: [
    AuthService,
    PassportModule,
    RolesRepository,
    UsersRepository,
    EmailVerificationsRepository,
  ],
})
export class AuthModule {}
