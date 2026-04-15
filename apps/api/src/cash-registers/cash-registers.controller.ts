import { Controller, Get, Post, Body, Req, UseGuards, Request } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('cash')
@UseGuards(JwtAuthGuard)
export class CashRegistersController {
    constructor(private readonly cashRegService: CashRegistersService) {}

    @Get()
    getStatus(@Request() req: any) {
        return this.cashRegService.getCurrentRegister(req.user.userId);
    }

    @Post('open')
    open(@Request() req: any, @Body() body: { openingBalance: number; notes?: string }) {
        return this.cashRegService.openRegister(req.user.userId, body.openingBalance, body.notes);
    }

    @Post('close')
    close(@Request() req: any, @Body() body: { closingBalance: number; notes?: string }) {
        return this.cashRegService.closeRegister(req.user.userId, body.closingBalance, body.notes);
    }

    @Get('movements')
    getMovements(@Request() req: any) {
        return this.cashRegService.getMovements(req.user.userId);
    }

    @Post('movements')
    addMovement(
        @Request() req: any,
        @Body() body: { type: 'IN' | 'OUT'; amount: number; description: string },
    ) {
        return this.cashRegService.addMovement(req.user.userId, body);
    }
}
