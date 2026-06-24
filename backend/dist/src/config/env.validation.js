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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var RedisEnabled;
(function (RedisEnabled) {
    RedisEnabled["TRUE"] = "true";
    RedisEnabled["FALSE"] = "false";
})(RedisEnabled || (RedisEnabled = {}));
class EnvironmentVariables {
    DATABASE_URL;
    JWT_SECRET;
    JWT_REFRESH_SECRET;
    REDIS_ENABLED;
    REDIS_HOST;
    REDIS_PORT;
    SMTP_HOST;
    SMTP_PORT;
    SMTP_USER;
    SMTP_PASS;
    SMTP_FROM_EMAIL;
    SMTP_FROM_NAME;
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "DATABASE_URL", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "JWT_REFRESH_SECRET", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(RedisEnabled),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_ENABLED", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "REDIS_HOST", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "REDIS_PORT", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_HOST", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EnvironmentVariables.prototype, "SMTP_PORT", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_USER", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_PASS", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_FROM_EMAIL", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EnvironmentVariables.prototype, "SMTP_FROM_NAME", void 0);
function validate(config) {
    const validatedConfig = (0, class_transformer_1.plainToInstance)(EnvironmentVariables, config, { enableImplicitConversion: true });
    const errors = (0, class_validator_1.validateSync)(validatedConfig, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(`Environment validation failed: ${errors.toString()}`);
    }
    const checkForbiddenPatterns = (key, value) => {
        if (value === undefined || value === null)
            return;
        const str = String(value);
        if (str.includes('[') || str.includes(']') || str.includes('(') || str.includes(')')) {
            throw new Error(`Environment validation failed: ${key} cannot contain markdown links/brackets. Value received: "${str}"`);
        }
        if (str.toLowerCase().includes('mailto:')) {
            throw new Error(`Environment validation failed: ${key} cannot contain mailto values. Value received: "${str}"`);
        }
        if (str.includes('<') || str.includes('>')) {
            throw new Error(`Environment validation failed: ${key} cannot contain wrapped email/bracket symbols. Value received: "${str}"`);
        }
    };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validateEmailFormat = (key, value) => {
        checkForbiddenPatterns(key, value);
        if (value === undefined || value === null)
            return;
        const str = String(value);
        if (!emailRegex.test(str)) {
            throw new Error(`Environment validation failed: ${key} has a malformed email format. Value received: "${str}"`);
        }
    };
    validateEmailFormat('SMTP_USER', validatedConfig.SMTP_USER);
    validateEmailFormat('SMTP_FROM_EMAIL', validatedConfig.SMTP_FROM_EMAIL);
    checkForbiddenPatterns('SMTP_HOST', validatedConfig.SMTP_HOST);
    checkForbiddenPatterns('SMTP_FROM_NAME', validatedConfig.SMTP_FROM_NAME);
    if (validatedConfig.SMTP_PASS) {
        checkForbiddenPatterns('SMTP_PASS', validatedConfig.SMTP_PASS);
    }
    if (validatedConfig.REDIS_ENABLED === RedisEnabled.TRUE) {
        if (!validatedConfig.REDIS_HOST || validatedConfig.REDIS_HOST.trim() === '') {
            throw new Error('Environment validation failed: REDIS_HOST must be provided when REDIS_ENABLED=true');
        }
        if (!validatedConfig.REDIS_PORT) {
            throw new Error('Environment validation failed: REDIS_PORT must be provided when REDIS_ENABLED=true');
        }
    }
    return validatedConfig;
}
//# sourceMappingURL=env.validation.js.map