import { PrismaService } from '../../prisma/prisma.service';
export declare class RolesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        role_id: bigint;
        role_name: string;
        description: string | null;
    }[]>;
    findById(roleId: bigint | number): Promise<{
        role_id: bigint;
        role_name: string;
        description: string | null;
    } | null>;
    findByName(roleName: string): Promise<{
        role_id: bigint;
        role_name: string;
        description: string | null;
    } | null>;
}
