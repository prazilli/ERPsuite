import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/departments')
export class PublicDepartmentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getDepartments(@Query('companyId') companyId?: string) {
    if (!companyId) {
      const depts = await this.prisma.department.findMany({
        select: {
          department_id: true,
          company_id: true,
          department_name: true,
        },
      });

      return depts.map((d) => ({
        department_id: Number(d.department_id),
        company_id: Number(d.company_id),
        department_name: d.department_name,
      }));
    }

    const depts = await this.prisma.department.findMany({
      where: {
        company_id: BigInt(companyId),
      },
      select: {
        department_id: true,
        company_id: true,
        department_name: true,
      },
    });

    return depts.map((d) => ({
      department_id: Number(d.department_id),
      company_id: Number(d.company_id),
      department_name: d.department_name,
    }));
  }
}
