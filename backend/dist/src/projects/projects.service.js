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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProjects(companyId, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.project.findMany({
            where: { company_id: companyId },
            include: {
                assignments: {
                    include: {
                        user: true,
                    },
                },
                milestones: true,
                tasks: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async getProject(projectId, currentUser) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: projectId },
            include: {
                assignments: { include: { user: true } },
                milestones: true,
                tasks: { include: { assignee: true } },
                documents: true,
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return project;
    }
    async createProject(companyId, data, currentUser) {
        this.verifyTenant(companyId, currentUser);
        return this.prisma.project.create({
            data: {
                company_id: companyId,
                project_name: data.projectName,
                description: data.description,
                start_date: data.startDate ? new Date(data.startDate) : null,
                end_date: data.endDate ? new Date(data.endDate) : null,
                budget: Number(data.budget || 0),
                cost: Number(data.cost || 0),
                revenue: Number(data.revenue || 0),
                completion_percent: Number(data.completionPercent || 0),
                status: data.status || 'ACTIVE',
            },
        });
    }
    async updateProject(projectId, data, currentUser) {
        const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return this.prisma.project.update({
            where: { project_id: projectId },
            data: {
                project_name: data.projectName,
                description: data.description,
                start_date: data.startDate ? new Date(data.startDate) : undefined,
                end_date: data.endDate ? new Date(data.endDate) : undefined,
                budget: data.budget !== undefined ? Number(data.budget) : undefined,
                cost: data.cost !== undefined ? Number(data.cost) : undefined,
                revenue: data.revenue !== undefined ? Number(data.revenue) : undefined,
                completion_percent: data.completionPercent !== undefined ? Number(data.completionPercent) : undefined,
                status: data.status,
            },
        });
    }
    async assignMember(projectId, data, currentUser) {
        const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return this.prisma.projectAssignment.create({
            data: {
                project_id: projectId,
                user_id: BigInt(data.userId),
                role: data.role,
                allocated_hours: Number(data.allocatedHours || 0),
            },
        });
    }
    async createMilestone(projectId, data, currentUser) {
        const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return this.prisma.projectMilestone.create({
            data: {
                project_id: projectId,
                name: data.name,
                due_date: new Date(data.dueDate),
                target_cost: Number(data.targetCost || 0),
                target_revenue: Number(data.targetRevenue || 0),
                status: 'PENDING',
            },
        });
    }
    async updateMilestone(milestoneId, status, currentUser) {
        const milestone = await this.prisma.projectMilestone.findUnique({
            where: { milestone_id: milestoneId },
            include: { project: true },
        });
        if (!milestone)
            throw new common_1.NotFoundException('Milestone not found');
        this.verifyTenant(milestone.project.company_id, currentUser);
        return this.prisma.projectMilestone.update({
            where: { milestone_id: milestoneId },
            data: { status },
        });
    }
    async createTask(projectId, data, currentUser) {
        const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return this.prisma.task.create({
            data: {
                project_id: projectId,
                assigned_to_id: data.assignedToId ? BigInt(data.assignedToId) : null,
                name: data.name,
                description: data.description,
                status: data.status || 'TODO',
                priority: data.priority || 'MEDIUM',
                estimated_hours: Number(data.estimatedHours || 0),
                due_date: data.dueDate ? new Date(data.dueDate) : null,
            },
        });
    }
    async logTimesheet(taskId, data, currentUser) {
        const task = await this.prisma.task.findUnique({
            where: { task_id: taskId },
            include: { project: true },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        this.verifyTenant(task.project.company_id, currentUser);
        return this.prisma.$transaction(async (tx) => {
            const timesheet = await tx.timesheet.create({
                data: {
                    task_id: taskId,
                    user_id: BigInt(currentUser.id),
                    date: new Date(data.date),
                    hours_logged: Number(data.hoursLogged),
                    description: data.description,
                },
            });
            await tx.project.update({
                where: { project_id: task.project_id },
                data: {
                    cost: {
                        increment: Number(data.hoursLogged) * 50,
                    },
                },
            });
            return timesheet;
        });
    }
    async getProjectAnalytics(projectId, currentUser) {
        const project = await this.prisma.project.findUnique({
            where: { project_id: projectId },
            include: {
                milestones: true,
                tasks: {
                    include: {
                        timesheets: true,
                    },
                },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        const totalTasks = project.tasks.length;
        const completedTasks = project.tasks.filter((t) => t.status === 'DONE').length;
        const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        let totalHoursLogged = 0;
        project.tasks.forEach((task) => {
            task.timesheets.forEach((sheet) => {
                totalHoursLogged += Number(sheet.hours_logged);
            });
        });
        const plannedCost = Number(project.budget);
        const actualCost = Number(project.cost);
        const costVariance = plannedCost - actualCost;
        return {
            projectName: project.project_name,
            completionRate: project.completion_percent,
            taskCompletionRate,
            totalHoursLogged,
            plannedCost,
            actualCost,
            costVariance,
            budgetHealth: costVariance >= 0 ? 'UNDER_BUDGET' : 'OVER_BUDGET',
        };
    }
    async addDocument(projectId, data, currentUser) {
        const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        this.verifyTenant(project.company_id, currentUser);
        return this.prisma.projectDocument.create({
            data: {
                project_id: projectId,
                name: data.name,
                file_path: data.filePath,
            },
        });
    }
    verifyTenant(companyId, currentUser) {
        if (currentUser.roleName === 'Super Admin')
            return;
        if (BigInt(currentUser.companyId) !== companyId) {
            throw new common_1.ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
        }
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map