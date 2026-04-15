import { Module, Global } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma.service.js';

@Global()
@Module({
  providers: [UsersService, PrismaService],
  exports: [UsersService],
})
export class UsersModule { }
