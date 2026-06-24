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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true, company: true },
        });
    }
    async findById(userId) {
        return this.prisma.user.findUnique({
            where: { user_id: BigInt(userId) },
            include: { role: true, company: true },
        });
    }
    async createUser(data) {
        return this.prisma.$transaction(async (tx) => {
            const role = await tx.role.findUnique({
                where: { role_id: BigInt(data.roleId) },
            });
            if (!role) {
                throw new Error('Selected role does not exist');
            }
            let company = await tx.company.findFirst({
                where: { company_name: data.companyName },
            });
            if (!company) {
                const tenant = await tx.tenant.create({
                    data: {
                        tenant_name: `${data.companyName} Tenant`,
                    },
                });
                company = await tx.company.create({
                    data: {
                        company_name: data.companyName,
                        company_type: 'SINGLE',
                        tenant_id: tenant.tenant_id,
                    },
                });
            }
            let department = null;
            if (data.departmentName && !data.isNewDepartmentRequest) {
                department = await tx.department.findFirst({
                    where: {
                        company_id: company.company_id,
                        department_name: data.departmentName,
                    },
                });
                if (!department) {
                    department = await tx.department.create({
                        data: {
                            company_id: company.company_id,
                            department_name: data.departmentName,
                            is_custom: true,
                        },
                    });
                    await tx.departmentFeature.create({
                        data: {
                            department_id: department.department_id,
                            feature_name: 'analytics',
                            enabled: true,
                        },
                    });
                }
            }
            const user = await tx.user.create({
                data: {
                    company_id: company.company_id,
                    department_id: department ? department.department_id : null,
                    role_id: BigInt(data.roleId),
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    password_hash: data.passwordHash,
                    phone: data.phone || null,
                    is_active: true,
                    email_verified: false,
                },
            });
            if (data.isNewDepartmentRequest && data.departmentName) {
                await tx.departmentCreationRequest.create({
                    data: {
                        company_id: company.company_id,
                        requested_by_id: user.user_id,
                        department_name: data.departmentName,
                        status: 'pending',
                    },
                });
            }
            return user;
        });
    }
    async updateUserEmailVerified(userId, verified) {
        return this.prisma.user.update({
            where: { user_id: BigInt(userId) },
            data: { email_verified: verified },
        });
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map