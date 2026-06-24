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
exports.HrmsController = void 0;
const common_1 = require("@nestjs/common");
const hrms_service_1 = require("./hrms.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let HrmsController = class HrmsController {
    hrmsService;
    constructor(hrmsService) {
        this.hrmsService = hrmsService;
    }
    async getEmployees(user) {
        return this.hrmsService.getEmployees(BigInt(user.companyId), user);
    }
    async getProfile(userId, user) {
        return this.hrmsService.getProfile(BigInt(userId), user);
    }
    async updateProfile(userId, body, user) {
        return this.hrmsService.updateProfile(BigInt(userId), body, user);
    }
    async getAttendance(userId, user) {
        return this.hrmsService.getAttendance(BigInt(userId), user);
    }
    async checkIn(userId, user) {
        return this.hrmsService.checkIn(BigInt(userId), user);
    }
    async checkOut(userId, user) {
        return this.hrmsService.checkOut(BigInt(userId), user);
    }
    async applyLeave(userId, body, user) {
        return this.hrmsService.applyLeave(BigInt(userId), body, user);
    }
    async getLeaveRequests(userId, user) {
        return this.hrmsService.getLeaveRequests(BigInt(userId), user);
    }
    async getTeamLeaveRequests(user) {
        return this.hrmsService.getTeamLeaveRequests(user);
    }
    async getPayrollHistory(userId, user) {
        return this.hrmsService.getPayrollHistory(BigInt(userId), user);
    }
    async getHolidays(user) {
        return this.hrmsService.getHolidays(BigInt(user.companyId), user);
    }
};
exports.HrmsController = HrmsController;
__decorate([
    (0, common_1.Get)('employees'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getEmployees", null);
__decorate([
    (0, common_1.Get)('employees/:userId/profile'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('employees/:userId/profile'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('employees/:userId/attendance'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Post)('employees/:userId/check-in'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('employees/:userId/check-out'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Post)('employees/:userId/leaves'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "applyLeave", null);
__decorate([
    (0, common_1.Get)('employees/:userId/leaves'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getLeaveRequests", null);
__decorate([
    (0, common_1.Get)('leaves/team'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getTeamLeaveRequests", null);
__decorate([
    (0, common_1.Get)('employees/:userId/payroll'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getPayrollHistory", null);
__decorate([
    (0, common_1.Get)('holidays'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HrmsController.prototype, "getHolidays", null);
exports.HrmsController = HrmsController = __decorate([
    (0, common_1.Controller)('hrms'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [hrms_service_1.HrmsService])
], HrmsController);
//# sourceMappingURL=hrms.controller.js.map