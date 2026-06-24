import { PrismaService } from '../prisma/prisma.service';
export declare class RolesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getRoles(): Promise<{
        role_id: number;
        role_name: string;
    }[]>;
}
