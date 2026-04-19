import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu tạo dữ liệu mẫu...');

  // Dọn dẹp dữ liệu cũ (nếu có)
  await prisma.emergencyLog.deleteMany();
  await prisma.device.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.user.deleteMany();

  // Tạo User (Người giám hộ)
  const password = await bcrypt.hash('123456', 10);
  const guardian = await prisma.user.create({
    data: {
      email: 'nguoithan@medtag.vn',
      password,
      fullName: 'Trần Văn Vợ',
      phoneNumber: '0901 234 567',
      role: 'GUARDIAN',
    },
  });

  // Tạo Hồ sơ y tế
  const medicalRecord = await prisma.medicalRecord.create({
    data: {
      patientName: 'Nguyễn Văn A',
      bloodType: 'O+',
      allergies: 'Penicillin, Đậu phộng',
      dangerousConditions: 'Tiền sử nhồi máu cơ tim, Huyết áp cao',
      avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e2e8f0',
      guardianId: guardian.id,
    },
  });

  // Tạo Thiết bị chứa mã QR cấp cứu
  await prisma.device.create({
    data: {
      qrCode: 'X7K9A2',
      medicalRecordId: medicalRecord.id,
    },
  });

  console.log('Đã tạo thành công dữ liệu khẩn cấp. Bạn có thể tra cứu mã: X7K9A2');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
