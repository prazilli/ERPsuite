import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(companyId: bigint, data: any, currentUser: any): Promise<{
        user_id: string;
        first_name: string | null;
        last_name: string | null;
        email: string;
        role_id: string;
        company_id: string;
        department_id: string | null;
    }>;
    findAll(companyId: bigint, currentUser: any, search?: string, page?: number, limit?: number): Promise<{
        id: string;
        name: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
        status: string;
        isActive: boolean;
        role: {
            id: string;
            name: string;
        };
        department: {
            id: string;
            name: string;
        } | null;
        createdAt: Date;
        jobTitle: string;
        manager: {
            id: string;
            name: string;
        } | null;
    }[] | {
        data: {
            id: string;
            name: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
            phone: string | null;
            status: string;
            isActive: boolean;
            role: {
                id: string;
                name: string;
            };
            department: {
                id: string;
                name: string;
            } | null;
            createdAt: Date;
            jobTitle: string;
            manager: {
                id: string;
                name: string;
            } | null;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: bigint, currentUser: any): Promise<{
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
    getRoles(): Promise<{
        id: string;
        name: string;
        description: string | null;
        permissions: string[];
    }[]>;
    getPermissions(): Promise<{
        id: string;
        name: string;
    }[]>;
    createCustomRole(data: any, currentUser: any): Promise<({
        permissions: ({
            permission: {
                permission_id: bigint;
                permission_name: string;
            };
        } & {
            role_id: bigint;
            permission_id: bigint;
        })[];
    } & {
        role_id: bigint;
        role_name: string;
        description: string | null;
    }) | null>;
    updateUser(userId: bigint, data: any, currentUser: any): Promise<{
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
    private verifyTenant;
}
