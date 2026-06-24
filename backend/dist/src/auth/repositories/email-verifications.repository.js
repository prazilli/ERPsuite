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
exports.EmailVerificationsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let EmailVerificationsRepository = class EmailVerificationsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
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
    async findLatestPending(email) {
        return this.prisma.emailVerification.findFirst({
            where: { email, verified: false },
            orderBy: { created_at: 'desc' },
        });
    }
    async incrementAttempts(verificationId, currentAttempts) {
        return this.prisma.emailVerification.update({
            where: { verification_id: BigInt(verificationId) },
            data: { attempts: currentAttempts + 1 },
        });
    }
    async markAsVerified(verificationId) {
        return this.prisma.emailVerification.update({
            where: { verification_id: BigInt(verificationId) },
            data: { verified: true },
        });
    }
};
exports.EmailVerificationsRepository = EmailVerificationsRepository;
exports.EmailVerificationsRepository = EmailVerificationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmailVerificationsRepository);
//# sourceMappingURL=email-verifications.repository.js.map