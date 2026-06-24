import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { DepartmentsModule } from './departments/departments.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { DebugController } from './debug/debug.controller';

// New ERP Modules
import { HrmsModule } from './hrms/hrms.module';
import { CrmModule } from './crm/crm.module';
import { ProjectsModule } from './projects/projects.module';
import { FinanceModule } from './finance/finance.module';
import { AssetsModule } from './assets/assets.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    RedisModule,
    PrismaModule,
    CacheModule,
    AuthModule,
    CompaniesModule,
    DepartmentsModule,
    RequestsModule,
    UsersModule,
    AuditModule,
    HealthModule,
    MailModule,
    RolesModule,
    
    // Registered modules
    HrmsModule,
    CrmModule,
    ProjectsModule,
    FinanceModule,
    AssetsModule,
    ApprovalsModule,
    NotificationsModule,
    DashboardModule,
    TenantsModule,
  ],
  controllers: [AppController, DebugController],
  providers: [AppService],
})
export class AppModule {}
