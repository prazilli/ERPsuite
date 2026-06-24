import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/companies')
export class PublicCompaniesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCompanies() {
    const companies = await this.prisma.company.findMany({
      select: {
        company_id: true,
        company_name: true,
      },
    });

    return companies.map((c) => ({
      company_id: Number(c.company_id),
      company_name: c.company_name,
    }));
  }
}
