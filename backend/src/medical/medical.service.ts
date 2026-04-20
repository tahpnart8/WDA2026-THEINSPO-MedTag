import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from '../crypto/crypto.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class MedicalService {
    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    async getFullMedicalRecord(shortId: string) {
        const device = await this.prisma.device.findUnique({
            where: { shortId },
            include: {
                medicalRecord: {
                    include: { guardian: true },
                },
            },
        });

        if (!device?.medicalRecord) {
            throw new NotFoundException('Không tìm thấy hồ sơ y tế từ thiết bị này.');
        }

        const mr = device.medicalRecord;

        let decryptedMedicalData = null;
        if (mr.encryptedMedicalData) {
            try {
                const plaintext = this.crypto.decrypt(mr.encryptedMedicalData);
                decryptedMedicalData = JSON.parse(plaintext);
            } catch (err) {
                decryptedMedicalData = { error: 'Không thể giải mã dữ liệu y tế.' };
            }
        }

        const daysSinceConfirmed = Math.floor(
            (Date.now() - new Date(mr.dataConfirmedAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
            publicData: {
                patientName: mr.patientName,
                dateOfBirth: mr.dateOfBirth,
                gender: mr.gender,
                bloodType: mr.bloodType,
                allergies: mr.allergies,
                dangerousConditions: mr.dangerousConditions,
                avatarUrl: mr.avatarUrl,
                emergencyContact: {
                    name: mr.emergencyContactName || mr.guardian.fullName,
                    phone: mr.emergencyPhone || mr.guardian.phoneNumber,
                },
                notes: mr.notes,
            },
            decryptedMedicalData,
            dataFreshness: {
                status: mr.dataFreshnessStatus,
                lastConfirmedAt: mr.dataConfirmedAt,
                daysSinceConfirmed,
            },
            accessedAt: new Date().toISOString(),
        };
    }

    async logAccess(params: { action: AuditAction; userId: string; targetId: string; ipAddress?: string; userAgent?: string }) {
        return this.prisma.auditLog.create({
            data: {
                action: params.action,
                targetType: 'MedicalRecord',
                targetId: params.targetId,
                userId: params.userId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
            }
        });
    }
}
