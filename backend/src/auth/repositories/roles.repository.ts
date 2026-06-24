import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany();
  }

  async findById(roleId: bigint | number) {
    return this.prisma.role.findUnique({
      where: { role_id: BigInt(roleId) },
    });
  }

  async findByName(roleName: string) {
    return this.prisma.role.findUnique({
      where: { role_name: roleName },
    });
  }
}
