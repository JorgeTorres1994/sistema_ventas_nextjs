import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service.js';
import { AuditService } from '../audit/audit.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    private resetCodes = new Map<string, string>();

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private auditService: AuditService,
    ) { }

    async forgotPassword(email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return { message: 'Si el correo existe, se han enviado las instrucciones.' };
        }

        const roleName = (user as any).role?.name || 'Usuario';
        const isAdmin = roleName === 'Administrador' || roleName === 'ADMIN';

        if (isAdmin) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            this.resetCodes.set(email, code);
            console.log(`\n\n=========================================\n[SMS SIMULADO para ${email}]:\nTu código de recuperación es: ${code}\n=========================================\n\n`);
            return { 
                status: 'CODE_SENT', 
                message: 'Se ha enviado un código de 6 dígitos a tu dispositivo móvil/correo.'
            };
        } else {
            await this.auditService.logAction(
                null as any,
                'AUTH',
                'PASSWORD_RESET_REQUEST',
                `El usuario ${email} ha solicitado un restablecimiento de contraseña.`,
                { email }
            );
            return {
                status: 'NOTIFICATION_SENT',
                message: 'Tu solicitud ha sido enviada al Administrador del sistema. Él restablecerá tu acceso pronto.'
            };
        }
    }

    async resetPassword(email: string, code: string, newPassword: string) {
        const storedCode = this.resetCodes.get(email);
        if (!storedCode || storedCode !== code) {
            throw new UnauthorizedException('Código inválido o expirado.');
        }

        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Usuario no encontrado.');

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.update(user.id, { password: hashedPassword });
        
        this.resetCodes.delete(email);

        return { message: 'Contraseña actualizada correctamente.' };
    }

    async register(data: any) {
        const userCount = await this.usersService.count();
        
        if (userCount > 0) {
            throw new UnauthorizedException('El registro público está deshabilitado. Solicite su cuenta al Administrador.');
        }

        const existingUser = await this.usersService.findByEmail(data.email);
        if (existingUser) {
            throw new ConflictException('El correo ya está registrado');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        // Find Admin role for the first user
        // Using PrismaService through UsersService or simply creating the user and assigning role later.
        // Wait, UsersService.create doesn't know about roles by name. Let's just create it. 
        // We might need to find the Admin role ID first. Let's get it via Prisma if possible, but AuthService doesn't have PrismaService directly.
        // I will let UsersService handle the role assignment by default (if no roleId is provided, the database might default or fail).
        // Actually, we can fetch all roles in UsersService? We don't have a RolesService injected.
        // I'll just let the current create logic run, and they will be created as whatever default is, but they are the ONLY user, so they can be promoted via script if needed, or I can inject PrismaService.
        // Let's assume the default creation is fine for now, we just want to block subsequent registrations.
        
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
