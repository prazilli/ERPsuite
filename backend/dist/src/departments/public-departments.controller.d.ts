import { PrismaService } from '../prisma/prisma.service';
export declare class PublicDepartmentsController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDepartments(companyId?: string): Promise<{
        department_id: number;
        company_id: number;
        department_name: string;
    }[]>;
}
