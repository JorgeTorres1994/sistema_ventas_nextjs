import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { AuditService } from '../audit/audit.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private auditService: AuditService,
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
            authProvider: 'EMAIL'
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

        const { firstName, lastName, picture } = req.user;
        const email = req.user.email.toLowerCase().trim(); // Normalizar email
        
        // 1. LISTA CENTRALIZADA DE ADMINISTRADORES
        const adminEmails = [
            'admin@admin.com',
            'jorge.torres.anthony@gmail.com',
            'tonyblakes1000@gmail.com'
        ];

        const isAdminEmail = adminEmails.map(e => e.toLowerCase()).includes(email.toLowerCase());
        
        console.log(`[Google Login] Email recibido: "${email}" | ¿Es Admin?: ${isAdminEmail}`);

        let user = await this.usersService.findByEmail(email);

        // --- NUEVA LÓGICA DE RESTRICCIÓN ---
        if (!user && !isAdminEmail) {
            console.log(`[Google Login] BLOQUEADO: ${email} intentó entrar pero no está registrado.`);
            await this.auditService.logAction(
                null,
                'AUTH',
                'SECURITY_ALERT',
                `Intento de acceso denegado (Google): ${email}`,
                { email, provider: 'GOOGLE' },
                req
            );
            throw new UnauthorizedException('Acceso denegado. Tu cuenta de Google no ha sido autorizada por un administrador.');
        }

        if (!user) {
            // Solo llegamos aquí si es un Admin Maestro nuevo
            console.log(`[Google Login] Creando nuevo Administrador maestro: ${email}`);
            
            let targetRole = await (this.usersService as any).prisma.role.findFirst({
                where: { name: { contains: 'Administrador', mode: 'insensitive' } }
            });

            if (!targetRole) {
                targetRole = await (this.usersService as any).prisma.role.create({
                    data: {
                        name: 'Administrador',
                        description: 'Acceso total al sistema (Maestro)'
                    }
                });
            }

            user = await this.usersService.create({
                email,
                name: `${firstName} ${lastName}`,
                password: '', 
                avatarUrl: picture,
                authProvider: 'GOOGLE',
                authProviderId: req.user.googleId,
                role: { connect: { id: targetRole.id } },
            } as any);

            await this.auditService.logAction(
                user.id,
                'AUTH',
                'REGISTER',
                `Nuevo administrador maestro creado vía Google: ${email}`,
                { userId: user.id, email },
                req
            );
        } else {
            // El usuario ya existe (fue creado manualmente por el admin o es un re-ingreso)
            const updates: any = { avatarUrl: picture };
            if ((user as any).authProvider !== 'GOOGLE') {
                updates.authProvider = 'GOOGLE';
                updates.authProviderId = req.user.googleId;
            }
            
            user = await this.usersService.update(user.id, updates);

            await this.auditService.logAction(
                user.id,
                'AUTH',
                'LOGIN',
                `Inicio de sesión exitoso vía Google: ${email}`,
                { userId: user.id, email },
                req
            );
        }

            // --- LÓGICA DE ASCENSO/VERIFICACIÓN ---
            const currentRoleName = (user as any).role?.name;
            if (isAdminEmail && currentRoleName !== 'Administrador') {
                console.log(`[Google Login] ASCENDIENDO a ${email} a Administrador...`);
                let adminRole = await (this.usersService as any).prisma.role.findFirst({
                    where: { name: { contains: 'Administrador', mode: 'insensitive' } }
                });

                if (adminRole) {
                    user = await this.usersService.update(user.id, {
                        role: { connect: { id: adminRole.id } }
                    });
                }
            }

        // --- SINCRONIZACIÓN DE PERMISOS (GOD MODE PARA ADMINS) ---
        const finalUser: any = await this.usersService.findByEmail(email);
        if (finalUser && finalUser.role) {
            const isFinalAdmin = finalUser.role.name === 'Administrador';
            const allPermissions: any[] = await (this.usersService as any).prisma.permission.findMany();
            
            let permsToSync: any[] = [];
            if (isFinalAdmin) {
                permsToSync = allPermissions;
            } else {
                const basic = ['dashboard:read', 'pos:read', 'cash:read', 'sales:read', 'products:read', 'inventory:read', 'customers:read', 'expenses:read', 'credits:read'];
                permsToSync = allPermissions.filter(p => basic.includes(p.name));
            }

            for (const p of permsToSync) {
                const link = await (this.usersService as any).prisma.rolePermission.findFirst({
                    where: { 
                        roleId: finalUser.role.id, 
                        permissionId: p.id 
                    }
                });
                
                if (!link) {
                    await (this.usersService as any).prisma.rolePermission.create({
                        data: { 
                            roleId: finalUser.role.id, 
                            permissionId: p.id 
                        }
                    });
                }
            }
        }

        // Re-obtener el usuario para tener la relación de roles y permisos actualizada
        user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Error al recuperar el usuario tras el inicio de sesión');
        }

        const roleName = (user as any).role?.name || 'Vendedor';
        let permissions: string[] = [];
        
        // Extraer permisos de la relación
        if ((user as any).role?.permissions) {
            permissions = (user as any).role?.permissions.map((rp: any) => rp.permission?.name || rp.permissionId);
        }

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
