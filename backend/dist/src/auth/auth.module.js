"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const prisma_module_1 = require("../prisma/prisma.module");
const cache_module_1 = require("../cache/cache.module");
const audit_module_1 = require("../audit/audit.module");
const roles_repository_1 = require("./repositories/roles.repository");
const users_repository_1 = require("./repositories/users.repository");
const email_verifications_repository_1 = require("./repositories/email-verifications.repository");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            cache_module_1.CacheModule,
            audit_module_1.AuditModule,
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.register({}),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            jwt_strategy_1.JwtStrategy,
            roles_repository_1.RolesRepository,
            users_repository_1.UsersRepository,
            email_verifications_repository_1.EmailVerificationsRepository,
        ],
        exports: [
            auth_service_1.AuthService,
            passport_1.PassportModule,
            roles_repository_1.RolesRepository,
            users_repository_1.UsersRepository,
            email_verifications_repository_1.EmailVerificationsRepository,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map