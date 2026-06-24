import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        role: {
            role_id: bigint;
            role_name: string;
            description: string | null;
        };
        company: {
            company_id: bigint;
            created_at: Date;
            tenant_id: bigint;
            company_name: string;
            company_type: import("@prisma/client").$Enums.CompanyType;
        };
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
    }) | null>;
    findById(userId: bigint | number): Promise<({
        role: {
            role_id: bigint;
            role_name: string;
            description: string | null;
        };
        company: {
            company_id: bigint;
            created_at: Date;
            tenant_id: bigint;
            company_name: string;
            company_type: import("@prisma/client").$Enums.CompanyType;
        };
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
    }) | null>;
    createUser(data: {
        companyName: string;
        departmentName?: string;
        isNewDepartmentRequest?: boolean;
        roleId: bigint | number;
        firstName: string;
        lastName: string;
        email: string;
        passwordHash: string;
        phone?: string;
    }): Promise<{
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
    updateUserEmailVerified(userId: bigint | number, verified: boolean): Promise<{
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
}
