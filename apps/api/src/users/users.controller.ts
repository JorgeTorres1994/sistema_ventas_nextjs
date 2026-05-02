import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Patch, 
    Delete, 
    Body, 
    Param, 
    Query, 
    UseGuards,
    ConflictException,
    NotFoundException,
    Request,
    UseInterceptors,
    UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UsersService } from './users.service.js';
import { AuditService } from '../audit/audit.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermissions } from '../auth/permissions.decorator.js';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly auditService: AuditService,
    ) { }

    @Get()
    @RequirePermissions('users:read')
    async findAll(
        @Query('search') search?: string,
        @Query('roleId') roleId?: string,
        @Query('isActive') isActive?: string,
    ) {
        return this.usersService.findAll({
            search,
            roleId,
            isActive: isActive !== undefined ? isActive === 'true' : undefined,
        });
    }

    @Get('me')
    async getMe(@Request() req) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        const { password, ...result } = user;
        return result;
    }

    @Put('me')
    async updateMe(@Request() req, @Body() data: any) {
        const { password, email, roleId, ...updateData } = data;
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await this.usersService.update(req.user.userId, updateData);
        const { password: _, ...result } = user;
        return result;
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: join(process.cwd(), 'uploads'),
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `avatar-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    uploadAvatar(@UploadedFile() file: Express.Multer.File) {
        return {
            url: `/uploads/${file.filename}`,
        };
    }

    @Get(':id')
    @RequirePermissions('users:read')
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        const { password, ...result } = user;
        return result;
    }

    @Post()
    @RequirePermissions('users:create')
    async create(@Body() data: any, @Request() req: any) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) throw new ConflictException('El correo ya está registrado');

        const { password, ...userData } = data;
        let hashedPassword = '';
        
        if (data.authProvider === 'GOOGLE') {
            hashedPassword = ''; // No requiere password
        } else {
            hashedPassword = await bcrypt.hash(password || '', 10);
        }

        const user = await this.usersService.create({
            ...userData,
            password: hashedPassword,
        } as any);

        await this.auditService.logAction(
            (req as any).user.userId,
            'USERS',
            'CREATE',
            `Usuario creado manualmente: ${user.email} (${user.name})`,
            { userId: user.id, email: user.email },
            req as any
        );
        
        const { password: _, ...result } = user;
        return result;
    }

    @Put(':id')
    @RequirePermissions('users:update')
    async update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
        console.log(`[UPDATE USER] ID: ${id}, Payload:`, data);
        const { password, email, ...updateData } = data;
        
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
            console.log(`[UPDATE USER] Contraseña hasheada lista para guardar.`);
        }

        const user = await this.usersService.update(id, updateData);

        await this.auditService.logAction(
            (req as any).user.userId,
            'USERS',
            'UPDATE',
            `Usuario actualizado: ${user.email}`,
            { userId: user.id, updates: updateData },
            req as any
        );

        const { password: _, ...result } = user;
        return result;
    }

    @Patch(':id/status')
    @RequirePermissions('users:update')
    async toggleStatus(@Param('id') id: string, @Request() req: any) {
        const user = await this.usersService.toggleStatus(id);

        await this.auditService.logAction(
            (req as any).user.userId,
            'USERS',
            'STATUS_TOGGLE',
            `Estado del usuario ${user.email} cambiado a ${user.isActive ? 'ACTIVO' : 'INACTIVO'}`,
            { userId: user.id, isActive: user.isActive },
            req as any
        );

        return user;
    }

    @Delete(':id')
    @RequirePermissions('users:delete')
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
