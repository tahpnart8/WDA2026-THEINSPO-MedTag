import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class EmergencyService {
  // Lấy dữ liệu công khai (Nhóm máu, Dị ứng) khi người đi đường quét mã
  async getPublicEmergencyData(qrCode: string) {
    const device = await prisma.device.findUnique({
      where: { qrCode },
      include: {
        medicalRecord: {
          include: {
            guardian: true, // Lấy thông tin người thân liên hệ
          },
        },
      },
    });

    if (!device || !device.isActive || !device.medicalRecord) {
      throw new NotFoundException('Không tìm thấy thông tin y tế cho mã thiết bị này.');
    }

    const mr = device.medicalRecord;
    
    return {
      deviceId: device.id,
      patientName: mr.patientName,
      avatarUrl: mr.avatarUrl || 'https://api.dicebear.com/7.x/notionists/svg?seed=fallback',
      bloodType: mr.bloodType,
      allergies: mr.allergies,
      dangerousConditions: mr.dangerousConditions,
      // Thông tin liên hệ trả về để hiển thị
      emergencyContact: `${mr.guardian.phoneNumber || 'Đang cập nhật'} (${mr.guardian.fullName})`,
    };
  }

  // Kích hoạt SOS và lưu tọa độ GPS
  async triggerSOS(qrCode: string, latitude?: number, longitude?: number) {
    const device = await prisma.device.findUnique({
      where: { qrCode },
    });

    if (!device) {
      throw new NotFoundException('Không tìm thấy thiết bị');
    }

    // Lưu Log vào DB
    const log = await prisma.emergencyLog.create({
      data: {
        latitude,
        longitude,
        status: 'TRIGGERED',
        deviceId: device.id,
        medicalRecordId: device.medicalRecordId,
      },
    });

    // TODO: Tích hợp API Twilio/SMS Gateway tại đây để nhắn tin về mr.guardian.phoneNumber

    return {
      success: true,
      message: 'Đã phát tín hiệu cấp cứu và lưu tọa độ',
      logId: log.id,
    };
  }
}
