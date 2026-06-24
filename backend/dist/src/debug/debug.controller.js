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
var DebugController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugController = void 0;
const common_1 = require("@nestjs/common");
const mail_service_1 = require("../mail/mail.service");
const class_validator_1 = require("class-validator");
class TestEmailDto {
    email;
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], TestEmailDto.prototype, "email", void 0);
let DebugController = DebugController_1 = class DebugController {
    mailService;
    logger = new common_1.Logger(DebugController_1.name);
    constructor(mailService) {
        this.mailService = mailService;
    }
    async testEmail(dto) {
        this.logger.log(`POST /api/debug/test-email invoked for recipient: ${dto.email}`);
        try {
            const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
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
        }
        catch (err) {
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
};
exports.DebugController = DebugController;
__decorate([
    (0, common_1.Post)('test-email'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TestEmailDto]),
    __metadata("design:returntype", Promise)
], DebugController.prototype, "testEmail", null);
exports.DebugController = DebugController = DebugController_1 = __decorate([
    (0, common_1.Controller)('api/debug'),
    __metadata("design:paramtypes", [mail_service_1.MailService])
], DebugController);
//# sourceMappingURL=debug.controller.js.map