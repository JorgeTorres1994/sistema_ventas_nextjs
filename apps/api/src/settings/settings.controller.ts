import { Controller, Get, Put, Body, UseGuards, Patch, Param, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @UseGuards(JwtAuthGuard)
    updateSettings(@Body() data: any) {
        return this.settingsService.updateSettings(data);
    }

    @Get('payment-methods')
    getPaymentMethods() {
        return this.settingsService.getPaymentMethods();
    }

    @Patch('payment-methods/:id/toggle')
    @UseGuards(JwtAuthGuard)
    togglePaymentMethod(@Param('id') id: string) {
        return this.settingsService.togglePaymentMethod(id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return {
            url: `/uploads/${file.filename}`,
        };
    }
}
