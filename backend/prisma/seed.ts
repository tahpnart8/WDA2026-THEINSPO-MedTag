import { PrismaClient, Role, BloodType, Gender, DataFreshnessStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Helper to simulate CryptoService
function encryptData(plaintext: string): string {
    const algorithm = 'aes-256-cbc';
    const hexKey = process.env.AES_SECRET_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const key = Buffer.from(hexKey, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

async function main() {
    console.log('Seeding data...');

    // 1. Delete existing data
    await prisma.auditLog.deleteMany({});
    await prisma.emergencyLog.deleteMany({});
    await prisma.device.deleteMany({});
    await prisma.medicalRecord.deleteMany({});
    await prisma.user.deleteMany({});

    // 2. Hash password
    const passwordHash = await bcrypt.hash('123456', 10);

    // 3. Create Users (Guardian & Doctor)
    const guardian = await prisma.user.create({
        data: {
            email: 'nguoithan@medtag.vn',
            password: passwordHash,
            role: Role.GUARDIAN,
            fullName: 'Người Thân Mẫu',
            phoneNumber: '0901234567',
        },
    });

    await prisma.user.create({
        data: {
            email: 'bacsi@medtag.vn',
            password: passwordHash,
            role: Role.DOCTOR,
            fullName: 'Bác Sĩ Mẫu',
            phoneNumber: '0912345678',
        },
    });

    // 4. Create Medical Record 1 (Complex with Encryption)
    const record1Json = {
        medicalHistory: {
            chronicDiseases: [
                { name: 'Nhồi máu cơ tim', diagnosedDate: '2018-05-10', severity: 'severe', status: 'managed' },
                { name: 'Huyết áp cao', diagnosedDate: '2015-11-20', severity: 'moderate', status: 'active' }
            ],
            pastSurgeries: [
                { name: 'Đặt stent mạch vành', date: '2018-06-01', hospital: 'Viện Tim TP.HCM' }
            ],
            familyHistory: 'Cha: Đột quỵ ở tuổi 62'
        },
        currentMedications: [
            { name: 'Aspirin 81mg', dosage: '1 lần/ngày', purpose: 'Chống đông máu', isOngoing: true },
            { name: 'Atorvastatin 20mg', dosage: '1 lần/ngày (tối)', purpose: 'Giảm cholesterol', isOngoing: true },
            { name: 'Losartan 50mg', dosage: '1 lần/ngày (sáng)', purpose: 'Huyết áp', isOngoing: true }
        ],
        clinicalContraindications: [
            { drug: 'Penicillin', reason: 'Dị ứng nặng – Sốc phản vệ', severity: 'critical' },
            { drug: 'NSAID liều cao', reason: 'Tăng nguy cơ xuất huyết do dùng Aspirin', severity: 'high' }
        ],
        recentLabResults: [
            { testName: 'Cholesterol toàn phần', result: '210 mg/dL', date: '2025-11-15', normalRange: '<200 mg/dL' }
        ],
        vaccinationHistory: [],
        insuranceInfo: { provider: 'BHXH', policyNumber: 'HS40201234567', expiryDate: '2026-06-30' }
    };

    const record1 = await prisma.medicalRecord.create({
        data: {
            guardianId: guardian.id,
            patientName: 'Ông Nguyễn Văn A',
            dateOfBirth: new Date('1950-01-01'),
            gender: Gender.MALE,
            bloodType: BloodType.O_POSITIVE,
            allergies: ['Penicillin', 'Phấn hoa'],
            dangerousConditions: ['Nhồi máu cơ tim', 'Huyết áp cao'],
            emergencyPhone: '0901234567',
            emergencyContactName: 'Nguyễn Văn Con',
            encryptedMedicalData: encryptData(JSON.stringify(record1Json)),
            dataFreshnessStatus: DataFreshnessStatus.FRESH,
        },
    });

    // 5. Create Medical Record 2 (Simple)
    const record2 = await prisma.medicalRecord.create({
        data: {
            guardianId: guardian.id,
            patientName: 'Bà Nguyễn Thị B',
            dateOfBirth: new Date('1955-05-05'),
            gender: Gender.FEMALE,
            bloodType: BloodType.AB_NEGATIVE,
            allergies: [],
            dangerousConditions: [],
            emergencyPhone: '0901234567',
            emergencyContactName: 'Nguyễn Văn Con',
            encryptedMedicalData: encryptData(JSON.stringify({})),
            dataFreshnessStatus: DataFreshnessStatus.STALE,
        },
    });

    // 6. Create Devices
    await prisma.device.create({
        data: {
            qrCode: 'https://medtag.vn/e/X7K9A2',
            shortId: 'X7K9A2',
            label: 'Vòng tay Ông A',
            medicalRecordId: record1.id,
        },
    });

    await prisma.device.create({
        data: {
            qrCode: 'https://medtag.vn/e/B3M5T8',
            shortId: 'B3M5T8',
            label: 'Thẻ BHYT Ông A',
            medicalRecordId: record1.id,
        },
    });

    await prisma.device.create({
        data: {
            qrCode: 'https://medtag.vn/e/K2P7L4',
            shortId: 'K2P7L4',
            label: 'Vòng tay Bà B',
            medicalRecordId: record2.id,
        },
    });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
