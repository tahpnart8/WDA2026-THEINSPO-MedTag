import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { QueryParamsDto } from './dto/query-params.dto';

interface RequestUser {
    id: string;
    email: string;
    role: string;
}

@Controller('portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GUARDIAN)
export class PortalController {
    constructor(private readonly portalService: PortalService) { }

    @Get('medical-records')
    async getMyRecords(@CurrentUser() user: RequestUser) {
        return this.portalService.getMyRecords(user.id);
    }

    @Get('medical-records/:id')
    async getRecord(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.portalService.getRecordById(user.id, id);
    }

    @Post('medical-records')
    async createRecord(@CurrentUser() user: RequestUser, @Body() dto: CreateMedicalRecordDto) {
        return this.portalService.createRecord(user.id, dto);
    }

    @Put('medical-records/:id')
    async updateRecord(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
        return this.portalService.updateRecord(user.id, id, dto);
    }

    @Delete('medical-records/:id')
    async deleteRecord(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        await this.portalService.deleteRecord(user.id, id);
        return { success: true };
    }

    @Post('medical-records/:id/confirm-freshness')
    async confirmFreshness(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        return this.portalService.confirmDataFreshness(user.id, id);
    }

    @Get('devices')
    async getDevices(@CurrentUser() user: RequestUser, @Query('medicalRecordId') recordId?: string) {
        return this.portalService.getMyDevices(user.id, recordId);
    }

    @Post('devices')
    async linkDevice(@CurrentUser() user: RequestUser, @Body() dto: CreateDeviceDto) {
        return this.portalService.linkDevice(user.id, dto);
    }

    @Delete('devices/:id')
    async unlinkDevice(@CurrentUser() user: RequestUser, @Param('id') id: string) {
        await this.portalService.unlinkDevice(user.id, id);
        return { success: true };
    }

    @Get('emergency-logs')
    async getLogs(@CurrentUser() user: RequestUser, @Query() query: QueryParamsDto) {
        return this.portalService.getEmergencyLogs(user.id, query);
    }
}
