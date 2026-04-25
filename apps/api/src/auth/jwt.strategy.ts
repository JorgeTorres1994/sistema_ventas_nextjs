import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true
                            }
                        }
                    }
                }
            }
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Usuario inactivo o no encontrado');
        }

        // Flatten permissions for easy checking: ['products:read', 'sales:create', ...]
        const permissions = user.role?.permissions.map(rp => rp.permission.name) || [];

        return { 
            userId: user.id, 
            email: user.email, 
            role: user.role?.name,
            roleId: user.roleId,
            permissions 
        };
    }
}
