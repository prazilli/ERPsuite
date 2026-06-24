"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/env.validation");
const prisma_module_1 = require("./prisma/prisma.module");
const cache_module_1 = require("./cache/cache.module");
const auth_module_1 = require("./auth/auth.module");
const companies_module_1 = require("./companies/companies.module");
const departments_module_1 = require("./departments/departments.module");
const requests_module_1 = require("./requests/requests.module");
const users_module_1 = require("./users/users.module");
const audit_module_1 = require("./audit/audit.module");
const redis_module_1 = require("./redis/redis.module");
const health_module_1 = require("./health/health.module");
const mail_module_1 = require("./mail/mail.module");
const roles_module_1 = require("./roles/roles.module");
const debug_controller_1 = require("./debug/debug.controller");
const hrms_module_1 = require("./hrms/hrms.module");
const crm_module_1 = require("./crm/crm.module");
const projects_module_1 = require("./projects/projects.module");
const finance_module_1 = require("./finance/finance.module");
const assets_module_1 = require("./assets/assets.module");
const approvals_module_1 = require("./approvals/approvals.module");
const notifications_module_1 = require("./notifications/notifications.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const tenants_module_1 = require("./tenants/tenants.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true, validate: env_validation_1.validate }),
            redis_module_1.RedisModule,
            prisma_module_1.PrismaModule,
            cache_module_1.CacheModule,
            auth_module_1.AuthModule,
            companies_module_1.CompaniesModule,
            departments_module_1.DepartmentsModule,
            requests_module_1.RequestsModule,
            users_module_1.UsersModule,
            audit_module_1.AuditModule,
            health_module_1.HealthModule,
            mail_module_1.MailModule,
            roles_module_1.RolesModule,
            hrms_module_1.HrmsModule,
            crm_module_1.CrmModule,
            projects_module_1.ProjectsModule,
            finance_module_1.FinanceModule,
            assets_module_1.AssetsModule,
            approvals_module_1.ApprovalsModule,
            notifications_module_1.NotificationsModule,
            dashboard_module_1.DashboardModule,
            tenants_module_1.TenantsModule,
        ],
        controllers: [app_controller_1.AppController, debug_controller_1.DebugController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map