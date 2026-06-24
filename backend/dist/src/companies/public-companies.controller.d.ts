import { PrismaService } from '../prisma/prisma.service';
export declare class PublicCompaniesController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCompanies(): Promise<{
        company_id: number;
        company_name: string;
    }[]>;
}
