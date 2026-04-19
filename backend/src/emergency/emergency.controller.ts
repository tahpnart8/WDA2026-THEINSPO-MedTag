import { Controller, Get, Post, Body, Param, Req, HttpCode } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { TriggerSosDto } from './dto/trigger-sos.dto';
import { CancelSosDto } from './dto/cancel-sos.dto';
import type { Request } from 'express';

@Controller('emergency')
export class EmergencyController {
    constructor(private readonly emergencyService: EmergencyService) { }

    @Get(':shortId')
    async getProfile(@Param('shortId') shortId: string) {
        return this.emergencyService.getPublicProfile(shortId);
    }

    @Post(':shortId/sos')
    @HttpCode(200)
    async triggerSos(
        @Param('shortId') shortId: string,
        @Body() dto: TriggerSosDto,
        @Req() req: Request,
    ) {
        const ip = req.ip || '';
        const ua = req.headers['user-agent'] || '';
        return this.emergencyService.triggerSOS(shortId, dto, ip, ua);
    }

    @Post(':shortId/cancel')
    @HttpCode(200)
    async cancelSos(
        @Param('shortId') shortId: string,
        @Body() dto: CancelSosDto,
    ) {
        await this.emergencyService.cancelSOS(shortId, dto.logId);
        return { success: true, message: 'Đã hủy tín hiệu cấp cứu.' };
    }
}
