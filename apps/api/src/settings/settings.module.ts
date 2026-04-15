import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
    providers: [SettingsService, PrismaService],
    controllers: [SettingsController],
    exports: [SettingsService]
})
export class SettingsModule { }
