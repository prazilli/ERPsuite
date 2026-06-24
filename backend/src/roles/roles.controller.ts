import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('api/roles')
export class RolesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getRoles() {
    const roles = await this.prisma.role.findMany({
      select: {
        role_id: true,
        role_name: true,
      },
    });

    return roles.map((role) => ({
      role_id: Number(role.role_id),
      role_name: role.role_name,
    }));
  }
}
