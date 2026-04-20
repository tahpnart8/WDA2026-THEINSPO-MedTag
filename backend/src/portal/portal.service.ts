import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { EmergencyStatus, Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as QRCode from 'qrcode';

@Injectable()
export class PortalService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly crypto: CryptoService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    private async invalidateRecordCache(recordId: string) {
        const devices = await this.prisma.device.findMany({
            where: { medicalRecordId: recordId }
        });
        for (const device of devices) {
            await this.cacheManager.del(`emergency_profile:${device.shortId}`);
        }
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

        const updated = await this.prisma.medicalRecord.update({
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
                encryptedMedicalData: encryptedData,
            },
        });

        await this.invalidateRecordCache(recordId);
        return updated;
    }

    async deleteRecord(userId: string, recordId: string) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền xóa hồ sơ này.');

        await this.invalidateRecordCache(recordId);
        await this.prisma.medicalRecord.delete({ where: { id: recordId } });
    }

    async confirmDataFreshness(userId: string, recordId: string) {
        const record = await this.prisma.medicalRecord.findUnique({ where: { id: recordId } });
        if (!record) throw new NotFoundException('Hồ sơ không tồn tại.');
        if (record.guardianId !== userId) throw new ForbiddenException('Không có quyền thao tác hồ sơ này.');

        const updated = await this.prisma.medicalRecord.update({
            where: { id: recordId },
            data: {
                dataFreshnessStatus: 'FRESH',
                dataConfirmedAt: new Date(),
            },
        });

        await this.invalidateRecordCache(recordId);
        return updated;
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

        const existing = await this.prisma.device.findUnique({ where: { shortId: dto.shortId.toUpperCase() } });
        if (existing) throw new BadRequestException('Mã thiết bị này đã được đăng ký.');

        const device = await this.prisma.device.create({
            data: {
                shortId: dto.shortId.toUpperCase(),
                qrCode: dto.qrCode || `https://medtag.vercel.app/e/${dto.shortId.toUpperCase()}`,
                label: dto.label || null,
                medicalRecordId: dto.medicalRecordId,
                isActive: true
            }
        });

        await this.cacheManager.del(`emergency_profile:${device.shortId}`);
        return device;
    }

    async unlinkDevice(userId: string, deviceId: string) {
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
            include: { medicalRecord: true }
        });

        if (!device) throw new NotFoundException('Thiết bị không tồn tại.');
        if (device.medicalRecord.guardianId !== userId) throw new ForbiddenException('Không có quyền xóa thiết bị này.');

        await this.cacheManager.del(`emergency_profile:${device.shortId}`);
        return this.prisma.device.delete({ where: { id: deviceId } });
    }

    async getDeviceQR(userId: string, deviceId: string) {
        const device = await this.prisma.device.findUnique({
            where: { id: deviceId },
            include: { medicalRecord: true }
        });

        if (!device) throw new NotFoundException('Thiết bị không tồn tại.');
        if (device.medicalRecord.guardianId !== userId) throw new ForbiddenException('Không có quyền truy cập thiết bị này.');

        const qrDataUrl = await QRCode.toDataURL(device.qrCode, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 512,
        });

        return {
            qrDataUrl,
            shortId: device.shortId,
            patientName: device.medicalRecord.patientName
        };
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
