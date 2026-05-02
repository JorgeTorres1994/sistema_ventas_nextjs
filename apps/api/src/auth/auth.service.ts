import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(data: any) {
        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictException('El correo ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            ...data,
            password: hashedPassword,
        });

        const { password, ...result } = user;
        return result;
    }

    async login(email: string, pass: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const roleName = (user as any).role?.name || 'Usuario';
        const permissions = (user as any).role?.permissions?.map((rp: any) => rp.permission.name) || [];

        const payload = { sub: user.id, email: user.email, role: roleName, permissions };
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: roleName,
                permissions,
            },
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async googleLogin(req: any) {
        if (!req.user) {
            throw new UnauthorizedException('No se recibió información de Google');
        }

        const { email, firstName, lastName, picture } = req.user;
        let user = await this.usersService.findByEmail(email);

        if (!user) {
            // Asignar rol de Vendedor por defecto
            const role = await (this.usersService as any).prisma.role.findUnique({ where: { name: 'Vendedor' } });
            
            user = await this.usersService.create({
                email,
                name: `${firstName} ${lastName}`,
                password: '', // Sin contraseña para OAuth
                avatarUrl: picture,
                roleId: role?.id,
            });
        }

        const roleName = (user as any).role?.name || 'Vendedor';
        const permissions = (user as any).role?.permissions?.map((rp: any) => rp.permission.name) || [];

        const payload = { sub: user.id, email: user.email, role: roleName, permissions };
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: roleName,
                permissions,
            },
            access_token: await this.jwtService.signAsync(payload),
        };
    }
}
