import { Controller, Post, Body, HttpCode, HttpStatus, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { GoogleAuthGuard } from './google-auth.guard.js';

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

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        return this.authService.forgotPassword(email);
    }

    @Post('reset-password')
    async resetPassword(@Body() data: any) {
        return this.authService.resetPassword(data.email, data.code, data.newPassword);
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth(@Req() req: any) {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: any, @Res() res: any) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        try {
            const result = await this.authService.googleLogin(req);
            const token = result.access_token;
            return res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('[Google Callback Error]:', error.message);
            // Redirigir al login con un mensaje amigable en la URL
            const errorMessage = encodeURIComponent(error.message || 'Error de autenticación');
            return res.redirect(`${frontendUrl}/login?error=${errorMessage}`);
        }
    }
}
