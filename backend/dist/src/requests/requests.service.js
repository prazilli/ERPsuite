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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RequestsService = class RequestsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitRequest(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.departmentCreationRequest.create({
            data: {
                company_id: BigInt(companyId),
                requested_by_id: BigInt(currentUser.id),
                department_name: data.departmentName,
                description: data.description || null,
                status: 'pending',
            },
        });
    }
    async findAll(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        if (currentUser.roleName === 'Company Head / CEO' || currentUser.roleName === 'Company Admin' || currentUser.roleName === 'Super Admin' || currentUser.roleName === 'Auditor') {
            return this.prisma.departmentCreationRequest.findMany({
                where: { company_id: BigInt(companyId) },
                include: {
                    requested_by: {
                        select: {
                            user_id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    approved_by: {
                        select: {
                            user_id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            });
        }
        return this.prisma.departmentCreationRequest.findMany({
            where: {
                company_id: BigInt(companyId),
                requested_by_id: BigInt(currentUser.id),
            },
            include: {
                requested_by: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                approved_by: {
                    select: {
                        user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async approveRequest(requestId, currentUser) {
        const request = await this.prisma.departmentCreationRequest.findUnique({
            where: { request_id: BigInt(requestId) },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        this.verifyCompanyAdmin(Number(request.company_id), currentUser);
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Request is already processed');
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedRequest = await tx.departmentCreationRequest.update({
                where: { request_id: BigInt(requestId) },
                data: {
                    status: 'approved',
                    approved_by_id: BigInt(currentUser.id),
                },
            });
            const newDepartment = await tx.department.create({
                data: {
                    company_id: request.company_id,
                    department_name: request.department_name,
                    description: request.description || `Custom department created via request #${requestId}`,
                    is_custom: true,
                },
            });
            const defaultFeatures = ['analytics', 'tasks'];
            for (const feature of defaultFeatures) {
                await tx.departmentFeature.create({
                    data: {
                        department_id: newDepartment.department_id,
                        feature_name: feature,
                        enabled: true,
                    },
                });
            }
            const requester = await tx.user.findUnique({
                where: { user_id: request.requested_by_id },
            });
            const employeeRole = await tx.role.findUnique({ where: { role_name: 'Employee' } });
            const deptHeadRole = await tx.role.findUnique({ where: { role_name: 'Department Head' } });
            if (requester && employeeRole && deptHeadRole && requester.role_id === employeeRole.role_id) {
                await tx.user.update({
                    where: { user_id: request.requested_by_id },
                    data: {
                        role_id: deptHeadRole.role_id,
                        department_id: newDepartment.department_id,
                    },
                });
            }
            return { request: updatedRequest, department: newDepartment };
        });
    }
    async rejectRequest(requestId, currentUser) {
        const request = await this.prisma.departmentCreationRequest.findUnique({
            where: { request_id: BigInt(requestId) },
        });
        if (!request) {
            throw new common_1.NotFoundException('Request not found');
        }
        this.verifyCompanyAdmin(Number(request.company_id), currentUser);
        if (request.status !== 'pending') {
            throw new common_1.BadRequestException('Request is already processed');
        }
        return this.prisma.departmentCreationRequest.update({
            where: { request_id: BigInt(requestId) },
            data: {
                status: 'rejected',
                approved_by_id: BigInt(currentUser.id),
            },
        });
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (String(currentUser.companyId) !== String(companyId)) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
    verifyCompanyAdmin(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        if (currentUser.roleName !== 'Company Head / CEO' && currentUser.roleName !== 'Company Admin' && currentUser.roleName !== 'Super Admin') {
            throw new common_1.ForbiddenException('Only Company Administrators can approve/reject department creation requests.');
        }
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map