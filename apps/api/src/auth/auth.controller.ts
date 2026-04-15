import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() data: any) {
        return this.authService.register(data);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() credentials: any) {
        return this.authService.login(credentials.email, credentials.password);
    }
}
