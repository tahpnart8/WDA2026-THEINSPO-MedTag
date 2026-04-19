import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BloodType } from '@prisma/client';
import { TriggerSosDto } from './dto/trigger-sos.dto';

@Injectable()
export class EmergencyService {
    constructor(private readonly prisma: PrismaService) { }

    private bloodTypeDisplay(bt: BloodType): string {
        const map: Record<BloodType, string> = {
            A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
            B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
            O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
            AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
            UNKNOWN: '?'
        };
        return map[bt] || '?';
    }

    async getPublicProfile(shortId: string) {
        const device = await this.prisma.device.findUnique({
            where: { shortId },
            include: {
                medicalRecord: {
                    include: { guardian: true }
                }
            }
        });

        if (!device || !device.isActive) {
            throw new NotFoundException('Mã thiết bị không hợp lệ hoặc đã bị vô hiệu hóa.');
        }

        const mr = device.medicalRecord;

        return {
            deviceId: device.id,
            patientName: mr.patientName,
            dateOfBirth: mr.dateOfBirth?.toISOString().split('T')[0] || null,
            gender: mr.gender,
            avatarUrl: mr.avatarUrl,
            bloodType: mr.bloodType,
            bloodTypeDisplay: this.bloodTypeDisplay(mr.bloodType),
            allergies: (mr.allergies as readonly string[]) || [],
            dangerousConditions: (mr.dangerousConditions as readonly string[]) || [],
            emergencyContact: {
                name: mr.emergencyContactName || mr.guardian.fullName,
                phone: mr.emergencyPhone || mr.guardian.phoneNumber,
            },
            dataFreshness: mr.dataFreshnessStatus,
            lastConfirmed: mr.dataConfirmedAt,
        };
    }

    async triggerSOS(shortId: string, dto: TriggerSosDto, ip: string, ua: string) {
        const device = await this.prisma.device.findUnique({
            where: { shortId },
            include: { medicalRecord: true }
        });

        if (!device || !device.isActive) throw new NotFoundException('Mã thiết bị không hợp lệ.');

        const log = await this.prisma.emergencyLog.create({
            data: {
                medicalRecordId: device.medicalRecord.id,
                deviceId: device.id,
                latitude: dto.latitude,
                longitude: dto.longitude,
                bystanderIp: ip,
                bystanderUA: ua,
                status: 'TRIGGERED',
            }
        });

        return {
            success: true,
            message: 'Đã phát tín hiệu cấp cứu thành công.',
            logId: log.id,
            mapsUrl: dto.latitude && dto.longitude ? `https://maps.google.com/?q=${dto.latitude},${dto.longitude}` : undefined
        };
    }

    async cancelSOS(shortId: string, logId: string) {
        await this.prisma.emergencyLog.update({
            where: { id: logId },
            data: { status: 'CANCELLED' }
        });
    }
}
