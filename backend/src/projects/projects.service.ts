import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all projects in the company
  async getProjects(companyId: bigint, currentUser: any) {
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

  // Get project by ID
  async getProject(projectId: bigint, currentUser: any) {
    const project = await this.prisma.project.findUnique({
      where: { project_id: projectId },
      include: {
        assignments: { include: { user: true } },
        milestones: true,
        tasks: { include: { assignee: true } },
        documents: true,
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    this.verifyTenant(project.company_id, currentUser);
    return project;
  }

  // Create new project
  async createProject(companyId: bigint, data: any, currentUser: any) {
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

  // Update project details
  async updateProject(projectId: bigint, data: any, currentUser: any) {
    const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
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

  // Assign team member to project
  async assignMember(projectId: bigint, data: any, currentUser: any) {
    const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
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

  // Create Project Milestone
  async createMilestone(projectId: bigint, data: any, currentUser: any) {
    const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
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

  // Update Milestone status
  async updateMilestone(milestoneId: bigint, status: string, currentUser: any) {
    const milestone = await this.prisma.projectMilestone.findUnique({
      where: { milestone_id: milestoneId },
      include: { project: true },
    });
    if (!milestone) throw new NotFoundException('Milestone not found');
    this.verifyTenant(milestone.project.company_id, currentUser);

    return this.prisma.projectMilestone.update({
      where: { milestone_id: milestoneId },
      data: { status },
    });
  }

  // Create task under project
  async createTask(projectId: bigint, data: any, currentUser: any) {
    const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
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

  // Log timesheet for a task
  async logTimesheet(taskId: bigint, data: any, currentUser: any) {
    const task = await this.prisma.task.findUnique({
      where: { task_id: taskId },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    this.verifyTenant(task.project.company_id, currentUser);

    return this.prisma.$transaction(async (tx) => {
      // Create timesheet record
      const timesheet = await tx.timesheet.create({
        data: {
          task_id: taskId,
          user_id: BigInt(currentUser.id),
          date: new Date(data.date),
          hours_logged: Number(data.hoursLogged),
          description: data.description,
        },
      });

      // Update project actual cost based on employee hourly cost (simulated here)
      // E.g. add $50 per hour logged to the project's actual cost
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

  // Get project analytics
  async getProjectAnalytics(projectId: bigint, currentUser: any) {
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
    if (!project) throw new NotFoundException('Project not found');
    this.verifyTenant(project.company_id, currentUser);

    // Calculate analytics parameters
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

  // Add project document
  async addDocument(projectId: bigint, data: any, currentUser: any) {
    const project = await this.prisma.project.findUnique({ where: { project_id: projectId } });
    if (!project) throw new NotFoundException('Project not found');
    this.verifyTenant(project.company_id, currentUser);

    return this.prisma.projectDocument.create({
      data: {
        project_id: projectId,
        name: data.name,
        file_path: data.filePath,
      },
    });
  }

  // Tenant helper
  private verifyTenant(companyId: bigint, currentUser: any) {
    if (currentUser.roleName === 'Super Admin') return;
    if (BigInt(currentUser.companyId) !== companyId) {
      throw new ForbiddenException('Tenant access isolation violation: Cannot access another company data.');
    }
  }
}
