"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let DashboardController = class DashboardController {
    dashboardService;
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getEmployeeDashboard(user) {
        return this.dashboardService.getEmployeeDashboard(BigInt(user.id), BigInt(user.companyId));
    }
    async getDepartmentHeadDashboard(user) {
        if (user.roleName !== 'Department Head' && user.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Only Department Heads or CEO can access team dashboard');
        }
        if (!user.departmentId) {
            throw new common_1.ForbiddenException('User is not assigned to any department');
        }
        return this.dashboardService.getDepartmentHeadDashboard(BigInt(user.departmentId), BigInt(user.companyId));
    }
    async getCeoDashboard(user) {
        if (user.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Only CEO can access executive analytics dashboard');
        }
        return this.dashboardService.getCeoDashboard(BigInt(user.companyId));
    }
    async getDepartmentRequests(user) {
        if (user.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Only CEO can access department requests');
        }
        return this.dashboardService.getPendingDepartmentRequests(BigInt(user.companyId));
    }
    async approveDepartmentRequest(requestId, user) {
        if (user.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Only CEO can approve department requests');
        }
        return this.dashboardService.approveDepartmentRequest(BigInt(requestId), BigInt(user.id));
    }
    async rejectDepartmentRequest(requestId, user) {
        if (user.roleName !== 'Company Head / CEO') {
            throw new common_1.ForbiddenException('Only CEO can reject department requests');
        }
        return this.dashboardService.rejectDepartmentRequest(BigInt(requestId), BigInt(user.id));
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('employee'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getEmployeeDashboard", null);
__decorate([
    (0, common_1.Get)('department-head'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDepartmentHeadDashboard", null);
__decorate([
    (0, common_1.Get)('ceo'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCeoDashboard", null);
__decorate([
    (0, common_1.Get)('department-requests'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDepartmentRequests", null);
__decorate([
    (0, common_1.Post)('department-requests/:requestId/approve'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "approveDepartmentRequest", null);
__decorate([
    (0, common_1.Post)('department-requests/:requestId/reject'),
    __param(0, (0, common_1.Param)('requestId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "rejectDepartmentRequest", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map