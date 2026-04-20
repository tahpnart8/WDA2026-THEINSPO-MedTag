import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { EmergencyStatus, Prisma } from '@prisma/client';

@Injectable()
export class PortalService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly crypto: CryptoService,
    ) { }

    private generateShortId(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }


    async getMyRecords(userId: string) {
        return this.prisma.medicalRecord.findMany({
            where: { guardianId: userId },
            include: {
                _count: {
                    select: { devices: true, emergencyLogs: true },
                },
            },
        });
    }

    async getRecordById(userId: string, recordId: string) {
        const record = await this.prisma.medicalRecord.findUnique({
            where: { id: recordId },
            include: {
                devices: true,
            },
        });

        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền truy cập hồ sơ này.');

        let decryptedData = null;
        if (record.encryptedMedicalData) {
            try {
                const decryptedStr = this.crypto.decrypt(record.encryptedMedicalData);
                decryptedData = JSON.parse(decryptedStr);
            } catch (e) {
                decryptedData = { error: 'Không thể giải mã dữ liệu' };
            }
        }

        return { ...record, detailedMedicalData: decryptedData };
    }

    async createRecord(userId: string, dto: CreateMedicalRecordDto) {
        let encryptedData = null;
        if (typeof dto.detailedMedicalData === 'object' && dto.detailedMedicalData !== null && Object.keys(dto.detailedMedicalData).length > 0) {
            encryptedData = this.crypto.encrypt(JSON.stringify(dto.detailedMedicalData));
        }

        return this.prisma.medicalRecord.create({
            data: {
                guardianId: userId,
                patientName: dto.patientName,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                gender: dto.gender || null,
                bloodType: dto.bloodType || 'UNKNOWN',
                allergies: (dto.allergies || []) as any,
                dangerousConditions: (dto.dangerousConditions || []) as any,
                emergencyPhone: dto.emergencyPhone || null,
                emergencyContactName: dto.emergencyContactName || null,
                notes: dto.notes || null,
                avatarUrl: dto.avatarUrl || null,
                encryptedMedicalData: encryptedData,
            },
        });
    }

    async updateRecord(userId: string, recordId: string, dto: UpdateMedicalRecordDto) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền sửa hồ sơ này.');

        let encryptedData = record.encryptedMedicalData;
        if (dto.detailedMedicalData) {
            encryptedData = this.crypto.encrypt(JSON.stringify(dto.detailedMedicalData));
        }

        return this.prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                patientName: dto.patientName !== undefined ? dto.patientName : record.patientName,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : record.dateOfBirth,
                gender: dto.gender !== undefined ? dto.gender : record.gender,
                bloodType: dto.bloodType !== undefined ? dto.bloodType : record.bloodType,
                allergies: dto.allergies !== undefined ? (dto.allergies as any) : record.allergies,
                dangerousConditions: dto.dangerousConditions !== undefined ? (dto.dangerousConditions as any) : record.dangerousConditions,
                emergencyPhone: dto.emergencyPhone !== undefined ? dto.emergencyPhone : record.emergencyPhone,
                emergencyContactName: dto.emergencyContactName !== undefined ? dto.emergencyContactName : record.emergencyContactName,
                notes: dto.notes !== undefined ? dto.notes : record.notes,
                avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : record.avatarUrl,
                encryptedMedicalData: encryptedData,
            },
        });
    }

    async deleteRecord(userId: string, recordId: string) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền xóa hồ sơ này.');

        await this.prisma.medicalRecord.delete({ where: { id: recordId } });
    }

    async confirmDataFreshness(userId: string, recordId: string) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền thao tác hồ sơ này.');

        return this.prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                dataFreshnessStatus: 'FRESH',
                dataConfirmedAt: new Date(),
            },
        });
    }

    async getMyDevices(userId: string, medicalRecordId?: string) {
        const whereClause: any = {
            medicalRecord: { guardianId: userId },
        };
        if (medicalRecordId) {
            whereClause.medicalRecordId = medicalRecordId;
        }

        return this.prisma.device.findMany({
            where: whereClause,
            include: {
                medicalRecord: { select: { patientName: true } }
            }
        });
    }

    async linkDevice(userId: string, dto: CreateDeviceDto) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: dto.medicalRecordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền liên kết tới hồ sơ này.');

        let shortId = dto.shortId?.toUpperCase();
        if (!shortId) {
            let isUnique = false;
            while (!isUnique) {
                shortId = this.generateShortId();
                const existing = await this.prisma.device.findUnique({ where: { shortId } });
                if (!existing) isUnique = true;
            }
        } else {
            const existing = await this.prisma.device.findUnique({ where: { shortId } });
            if (existing) throw new BadRequestException('Mã thiết bị này đã được đăng ký.');
        }

        const baseUrl = process.env.FRONTEND_URL || 'https://medtag-by-theinspo.vercel.app';

        return this.prisma.device.create({
            data: {
                shortId,
                qrCode: dto.qrCode || `${baseUrl}/e/${shortId}`,
                label: dto.label || null,
                medicalRecordId: dto.medicalRecordId,
                isActive: true
            }
        });
    }

    async unlinkDevice(userId: string, deviceId: string) {
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
            include: { medicalRecord: true }
        });

        if (!device) throw new NotFoundException('Thiết bị không tồn tại.');
        if (device.medicalRecord.guardianId !== userId) throw new ForbiddenException('Không có quyền xóa thiết bị này.');

        return this.prisma.device.delete({ where: { id: deviceId } });
    }

    async getEmergencyLogs(userId: string, query: QueryParamsDto) {
        const whereClause: any = {
            medicalRecord: { guardianId: userId },
        };
        if (query.status) {
            whereClause.status = query.status as EmergencyStatus;
        }
        if (query.medicalRecordId) {
            whereClause.medicalRecordId = query.medicalRecordId;
        }

        return this.prisma.emergencyLog.findMany({
            where: whereClause,
            include: {
                medicalRecord: { select: { patientName: true } },
                device: { select: { shortId: true, label: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
