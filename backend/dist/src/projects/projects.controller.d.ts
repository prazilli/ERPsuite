import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    getProjects(user: any): Promise<({
        assignments: ({
            user: {
                role_id: bigint;
                user_id: bigint;
                email: string;
                company_id: bigint;
                department_id: bigint | null;
                first_name: string | null;
                last_name: string | null;
                password_hash: string;
                phone: string | null;
                is_active: boolean;
                email_verified: boolean;
                created_at: Date;
            };
        } & {
            role: string;
            user_id: bigint;
            project_id: bigint;
            assignment_id: bigint;
            allocated_hours: number;
        })[];
        milestones: {
            name: string;
            status: string;
            project_id: bigint;
            due_date: Date;
            milestone_id: bigint;
            target_cost: import("@prisma/client/runtime/library").Decimal;
            target_revenue: import("@prisma/client/runtime/library").Decimal;
        }[];
        tasks: {
            description: string | null;
            name: string;
            priority: string;
            status: string;
            project_id: bigint;
            due_date: Date | null;
            task_id: bigint;
            estimated_hours: number;
            assigned_to_id: bigint | null;
        }[];
    } & {
        description: string | null;
        company_id: bigint;
        created_at: Date;
        status: string;
        project_id: bigint;
        project_name: string;
        start_date: Date | null;
        end_date: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        cost: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        completion_percent: number;
    })[]>;
    createProject(body: any, user: any): Promise<{
        description: string | null;
        company_id: bigint;
        created_at: Date;
        status: string;
        project_id: bigint;
        project_name: string;
        start_date: Date | null;
        end_date: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        cost: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        completion_percent: number;
    }>;
    getProject(projectId: string, user: any): Promise<{
        assignments: ({
            user: {
                role_id: bigint;
                user_id: bigint;
                email: string;
                company_id: bigint;
                department_id: bigint | null;
                first_name: string | null;
                last_name: string | null;
                password_hash: string;
                phone: string | null;
                is_active: boolean;
                email_verified: boolean;
                created_at: Date;
            };
        } & {
            role: string;
            user_id: bigint;
            project_id: bigint;
            assignment_id: bigint;
            allocated_hours: number;
        })[];
        milestones: {
            name: string;
            status: string;
            project_id: bigint;
            due_date: Date;
            milestone_id: bigint;
            target_cost: import("@prisma/client/runtime/library").Decimal;
            target_revenue: import("@prisma/client/runtime/library").Decimal;
        }[];
        tasks: ({
            assignee: {
                role_id: bigint;
                user_id: bigint;
                email: string;
                company_id: bigint;
                department_id: bigint | null;
                first_name: string | null;
                last_name: string | null;
                password_hash: string;
                phone: string | null;
                is_active: boolean;
                email_verified: boolean;
                created_at: Date;
            } | null;
        } & {
            description: string | null;
            name: string;
            priority: string;
            status: string;
            project_id: bigint;
            due_date: Date | null;
            task_id: bigint;
            estimated_hours: number;
            assigned_to_id: bigint | null;
        })[];
        documents: {
            name: string;
            created_at: Date;
            project_id: bigint;
            document_id: bigint;
            file_path: string;
        }[];
    } & {
        description: string | null;
        company_id: bigint;
        created_at: Date;
        status: string;
        project_id: bigint;
        project_name: string;
        start_date: Date | null;
        end_date: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        cost: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        completion_percent: number;
    }>;
    updateProject(projectId: string, body: any, user: any): Promise<{
        description: string | null;
        company_id: bigint;
        created_at: Date;
        status: string;
        project_id: bigint;
        project_name: string;
        start_date: Date | null;
        end_date: Date | null;
        budget: import("@prisma/client/runtime/library").Decimal;
        cost: import("@prisma/client/runtime/library").Decimal;
        revenue: import("@prisma/client/runtime/library").Decimal;
        completion_percent: number;
    }>;
    assignMember(projectId: string, body: any, user: any): Promise<{
        role: string;
        user_id: bigint;
        project_id: bigint;
        assignment_id: bigint;
        allocated_hours: number;
    }>;
    createMilestone(projectId: string, body: any, user: any): Promise<{
        name: string;
        status: string;
        project_id: bigint;
        due_date: Date;
        milestone_id: bigint;
        target_cost: import("@prisma/client/runtime/library").Decimal;
        target_revenue: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateMilestone(milestoneId: string, status: string, user: any): Promise<{
        name: string;
        status: string;
        project_id: bigint;
        due_date: Date;
        milestone_id: bigint;
        target_cost: import("@prisma/client/runtime/library").Decimal;
        target_revenue: import("@prisma/client/runtime/library").Decimal;
    }>;
    createTask(projectId: string, body: any, user: any): Promise<{
        description: string | null;
        name: string;
        priority: string;
        status: string;
        project_id: bigint;
        due_date: Date | null;
        task_id: bigint;
        estimated_hours: number;
        assigned_to_id: bigint | null;
    }>;
    logTimesheet(taskId: string, body: any, user: any): Promise<{
        description: string | null;
        user_id: bigint;
        created_at: Date;
        date: Date;
        task_id: bigint;
        timesheet_id: bigint;
        hours_logged: import("@prisma/client/runtime/library").Decimal;
    }>;
    getProjectAnalytics(projectId: string, user: any): Promise<{
        projectName: string;
        completionRate: number;
        taskCompletionRate: number;
        totalHoursLogged: number;
        plannedCost: number;
        actualCost: number;
        costVariance: number;
        budgetHealth: string;
    }>;
    addDocument(projectId: string, body: any, user: any): Promise<{
        name: string;
        created_at: Date;
        project_id: bigint;
        document_id: bigint;
        file_path: string;
    }>;
}
