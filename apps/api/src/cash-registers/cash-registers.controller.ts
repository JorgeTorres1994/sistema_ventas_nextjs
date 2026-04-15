import { Controller, Get, Post, Body, Req, UseGuards, Param } from '@nestjs/common';
import { CashRegistersService } from './cash-registers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cash-registers')
@UseGuards(JwtAuthGuard)
export class CashRegistersController {
    constructor(private readonly cashRegService: CashRegistersService) {}

    @Post('open')
    openRegister(@Req() req, @Body() body: { openingBalance: number; notes?: string }) {
        return this.cashRegService.openRegister(req.user.userId, body.openingBalance, body.notes);
    }

    @Get('current')
    getCurrentRegister(@Req() req) {
        return this.cashRegService.getCurrentRegister(req.user.userId);
    }

    @Get('summary/:id')
    getRegisterSummary(@Param('id') id: string) {
        return this.cashRegService.getRegisterSummary(id);
    }

    @Post('close/:id')
    closeRegister(@Param('id') id: string, @Body() body: { closingBalance: number; notes?: string }) {
        return this.cashRegService.closeRegister(id, body.closingBalance, body.notes);
    }
}
