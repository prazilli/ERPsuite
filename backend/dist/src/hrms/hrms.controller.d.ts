import { HrmsService } from './hrms.service';
export declare class HrmsController {
    private readonly hrmsService;
    constructor(hrmsService: HrmsService);
    getEmployees(user: any): Promise<({
        role: {
            role_id: bigint;
            role_name: string;
            description: string | null;
        };
        department: {
            description: string | null;
            company_id: bigint;
            department_id: bigint;
            created_at: Date;
            department_name: string;
            is_custom: boolean;
            created_by: bigint | null;
        } | null;
        employee_profile: {
            user_id: bigint;
            created_at: Date;
            status: string;
            updated_at: Date;
            profile_id: bigint;
            job_title: string;
            hire_date: Date;
            manager_id: bigint | null;
        } | null;
        salary_structure: {
            user_id: bigint;
            structure_id: bigint;
            base_salary: import("@prisma/client/runtime/library").Decimal;
            allowances: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
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
    })[]>;
    getProfile(userId: string, user: any): Promise<{
        role: {
            role_id: bigint;
            role_name: string;
            description: string | null;
        };
        department: {
            description: string | null;
            company_id: bigint;
            department_id: bigint;
            created_at: Date;
            department_name: string;
            is_custom: boolean;
            created_by: bigint | null;
        } | null;
        employee_profile: ({
            manager: {
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
            user_id: bigint;
            created_at: Date;
            status: string;
            updated_at: Date;
            profile_id: bigint;
            job_title: string;
            hire_date: Date;
            manager_id: bigint | null;
        }) | null;
        leave_balances: {
            user_id: bigint;
            leave_type: string;
            balance_id: bigint;
            allocated: number;
            used: number;
        }[];
        salary_structure: {
            user_id: bigint;
            structure_id: bigint;
            base_salary: import("@prisma/client/runtime/library").Decimal;
            allowances: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
        } | null;
    } & {
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
    }>;
    updateProfile(userId: string, body: any, user: any): Promise<{
        success: boolean;
    }>;
    getAttendance(userId: string, user: any): Promise<{
        user_id: bigint;
        created_at: Date;
        date: Date;
        status: string;
        attendance_id: bigint;
        check_in: Date | null;
        check_out: Date | null;
    }[]>;
    checkIn(userId: string, user: any): Promise<{
        user_id: bigint;
        created_at: Date;
        date: Date;
        status: string;
        attendance_id: bigint;
        check_in: Date | null;
        check_out: Date | null;
    }>;
    checkOut(userId: string, user: any): Promise<{
        user_id: bigint;
        created_at: Date;
        date: Date;
        status: string;
        attendance_id: bigint;
        check_in: Date | null;
        check_out: Date | null;
    }>;
    applyLeave(userId: string, body: any, user: any): Promise<{
        user_id: bigint;
        created_at: Date;
        status: string;
        start_date: Date;
        end_date: Date;
        leave_id: bigint;
        leave_type: string;
        reason: string | null;
    }>;
    getLeaveRequests(userId: string, user: any): Promise<{
        manager_comments: string | null;
        user_id: bigint;
        created_at: Date;
        status: string;
        start_date: Date;
        end_date: Date;
        leave_id: bigint;
        leave_type: string;
        reason: string | null;
    }[]>;
    getTeamLeaveRequests(user: any): Promise<({
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
        user_id: bigint;
        created_at: Date;
        status: string;
        start_date: Date;
        end_date: Date;
        leave_id: bigint;
        leave_type: string;
        reason: string | null;
    })[]>;
    getPayrollHistory(userId: string, user: any): Promise<{
        user_id: bigint;
        status: string;
        net_paid: import("@prisma/client/runtime/library").Decimal;
        payroll_id: bigint;
        base_paid: import("@prisma/client/runtime/library").Decimal;
        allowances_paid: import("@prisma/client/runtime/library").Decimal;
        deductions_paid: import("@prisma/client/runtime/library").Decimal;
        month: string;
        processed_at: Date;
    }[]>;
    getHolidays(user: any): Promise<{
        name: string;
        company_id: bigint;
        date: Date;
        holiday_id: bigint;
    }[]>;
}
