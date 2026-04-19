import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EmergencyService } from './emergency.service';

@Controller('api/emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get(':qrCode')
  async getEmergencyProfile(@Param('qrCode') qrCode: string) {
    return this.emergencyService.getPublicEmergencyData(qrCode);
  }

  @Post(':qrCode/sos')
  @HttpCode(HttpStatus.OK)
  async triggerEmergencySOS(
    @Param('qrCode') qrCode: string,
    @Body() dto: { latitude?: number; longitude?: number },
  ) {
    return this.emergencyService.triggerSOS(qrCode, dto.latitude, dto.longitude);
  }
}
