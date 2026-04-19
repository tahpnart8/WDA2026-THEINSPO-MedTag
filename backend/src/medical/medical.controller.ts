import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Request } from 'express';

@Controller('medical')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
export class MedicalController {
    constructor(private medicalService: MedicalService) { }

    @Get(':shortId')
    async getFullRecord(
        @Param('shortId') shortId: string,
        @CurrentUser() doctor: { id: string },
        @Req() req: Request,
    ) {
        const record = await this.medicalService.getFullMedicalRecord(shortId);

        // Xóa header connection để TypeScript/Express không lỗi type
        let ip = req.ip;
        if (!ip && req.socket) ip = req.socket.remoteAddress;

        await this.medicalService.logAccess({
            action: 'VIEW_MEDICAL_RECORD',
            userId: doctor.id,
            targetId: shortId,
            ipAddress: ip,
            userAgent: req.headers['user-agent'],
        });

        return record;
    }
}
