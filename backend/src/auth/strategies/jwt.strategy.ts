import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
  sub: string; // BigInt serialized as string in JWT
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: BigInt(payload.sub), is_active: true },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        company: true,
        department: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or deleted');
    }

    // Extract dynamic permission names
    const permissions = user.role.permissions.map((rp) => rp.permission.permission_name);

    return {
      id: user.user_id, // keeps BigInt type (serialized by JSON patch globally)
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      roleId: user.role_id,
      roleName: user.role.role_name,
      companyId: user.company_id,
      companyType: user.company?.company_type || null,
      tenantId: user.company?.tenant_id || null,
      departmentId: user.department_id,
      permissions,
    };
  }
}
