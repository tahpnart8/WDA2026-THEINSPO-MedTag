# MedTag Backend – NestJS + Prisma + PostgreSQL

## Kiến Trúc Backend
```
src/
├── common/          Guards, Decorators, Filters, Pipes (shared)
├── prisma/          PrismaService (Global singleton – LUÔN inject, KHÔNG new PrismaClient)
├── auth/            JWT authentication (register, login, guards)
├── crypto/          AES-256-CBC encrypt/decrypt (cho encryptedMedicalData)
├── emergency/       API công khai /api/emergency/* (KHÔNG cần auth, có Redis cache)
├── portal/          API quản trị /api/portal/* (JwtAuthGuard + Role GUARDIAN)
├── medical/         API y tế /api/medical/* (JwtAuthGuard + Role DOCTOR)
├── cache/           Redis cache service
├── notification/    Twilio SMS/Push
└── scheduler/       Cron-job kiểm tra Data Freshness mỗi 6 tháng
```

## Quy Tắc Code
- TypeScript strict – KHÔNG dùng `any`
- Inject PrismaService – KHÔNG `new PrismaClient()`
- Validate input bằng class-validator DTOs
- Exception trả JSON chuẩn: `{ statusCode, message, error }`
- API prefix: `/api` (đã set global trong main.ts)

## Database Schema
Xem `prisma/schema.prisma` hoặc `02. PTTKHT/04_Database_Schema_Design.md`
- 5 models: User, MedicalRecord, Device, EmergencyLog, AuditLog
- Dữ liệu y tế nhạy cảm lưu mã hóa trong `encryptedMedicalData`

## Test API
```bash
npm run start:dev                    # Start trên port 3001
curl http://localhost:3001/api       # Health check
curl http://localhost:3001/api/emergency/X7K9A2  # Test emergency
```

## Environment
Cần file `.env` với: DATABASE_URL, JWT_SECRET, AES_SECRET_KEY, REDIS_URL
