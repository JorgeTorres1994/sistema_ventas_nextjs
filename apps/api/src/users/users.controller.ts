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
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.ADMIN)
    async findAll(
        @Query('search') search?: string,
        @Query('role') role?: Role,
        @Query('isActive') isActive?: string,
    ) {
        return this.usersService.findAll({
            search,
            role,
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
        const { password, email, ...updateData } = data;
        
        // If password is provided, hash it
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
    @Roles(Role.ADMIN)
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        if (!user) throw new NotFoundException('Usuario no encontrado');
        const { password, ...result } = user;
        return result;
    }

    @Post()
    @Roles(Role.ADMIN)
    async create(@Body() data: any) {
        const existing = await this.usersService.findByEmail(data.email);
        if (existing) throw new ConflictException('Email already registered');

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            ...data,
            password: hashedPassword,
        });
        const { password, ...result } = user;
        return result;
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    async update(@Param('id') id: string, @Body() data: any) {
        const { password, email, ...updateData } = data;
        
        // If password is provided, hash it
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await this.usersService.update(id, updateData);
        const { password: _, ...result } = user;
        return result;
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    async toggleStatus(@Param('id') id: string) {
        return this.usersService.toggleStatus(id);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    async remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
