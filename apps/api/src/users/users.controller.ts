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
    NotFoundException
} from '@nestjs/common';
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

    @Get(':id')
    @Roles(Role.ADMIN)
    async findOne(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        if (!user) throw new NotFoundException('User not found');
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
