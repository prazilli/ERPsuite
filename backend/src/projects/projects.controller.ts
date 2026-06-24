import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async getProjects(@CurrentUser() user: any) {
    return this.projectsService.getProjects(BigInt(user.companyId), user);
  }

  @Post()
  async createProject(@Body() body: any, @CurrentUser() user: any) {
    return this.projectsService.createProject(BigInt(user.companyId), body, user);
  }

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.projectsService.getProject(BigInt(projectId), user);
  }

  @Patch(':projectId')
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.updateProject(BigInt(projectId), body, user);
  }

  @Post(':projectId/assign')
  async assignMember(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.assignMember(BigInt(projectId), body, user);
  }

  @Post(':projectId/milestones')
  async createMilestone(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.createMilestone(BigInt(projectId), body, user);
  }

  @Patch('milestones/:milestoneId')
  async updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body('status') status: string,
    @CurrentUser() user: any
  ) {
    return this.projectsService.updateMilestone(BigInt(milestoneId), status, user);
  }

  @Post(':projectId/tasks')
  async createTask(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.createTask(BigInt(projectId), body, user);
  }

  @Post('tasks/:taskId/timesheets')
  async logTimesheet(
    @Param('taskId') taskId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.logTimesheet(BigInt(taskId), body, user);
  }

  @Get(':projectId/analytics')
  async getProjectAnalytics(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any
  ) {
    return this.projectsService.getProjectAnalytics(BigInt(projectId), user);
  }

  @Post(':projectId/documents')
  async addDocument(
    @Param('projectId') projectId: string,
    @Body() body: any,
    @CurrentUser() user: any
  ) {
    return this.projectsService.addDocument(BigInt(projectId), body, user);
  }
}
