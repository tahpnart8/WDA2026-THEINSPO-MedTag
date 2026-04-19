# Phase 1: Database & Core Backend Modules

> **Mục tiêu:** Hoàn thiện Prisma Schema, chạy migration, tạo các module nền tảng (Prisma, Auth, Crypto) để các Phase sau xây dựng lên trên.

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/04_Database_Schema_Design.md` → Schema chi tiết
- `02. PTTKHT/07_System_Architecture.md` → Cấu trúc module NestJS

---

## Task 1.1: Tạo PrismaModule (Singleton)

**Vấn đề hiện tại:** Code đang dùng `new PrismaClient()` trực tiếp trong Service → tạo nhiều connection pool → memory leak.

**File cần tạo:**

### `backend/src/prisma/prisma.module.ts`
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### `backend/src/prisma/prisma.service.ts`
```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Cập nhật:** `backend/src/app.module.ts` → Import `PrismaModule`.

**Commit:** `feat: add PrismaModule singleton service`

---

## Task 1.2: Cập nhật Prisma Schema (Full Version)

**File:** `backend/prisma/schema.prisma`

Thay thế schema hiện tại bằng schema hoàn chỉnh từ `02. PTTKHT/04_Database_Schema_Design.md`:

**Thay đổi quan trọng so với schema cũ:**
| Thay đổi | Cũ | Mới |
|---|---|---|
| `bloodType` | `String?` | `BloodType` Enum |
| `allergies` | `String?` | `Json?` (mảng) |
| `dangerousConditions` | `String?` | `Json?` (mảng) |
| Thêm `dateOfBirth` | ❌ | `DateTime?` |
| Thêm `gender` | ❌ | `Gender` Enum |
| Thêm `dataFreshnessStatus` | ❌ | `DataFreshnessStatus` Enum |
| Thêm `dataConfirmedAt` | ❌ | `DateTime` |
| `Device.shortId` | Dùng qrCode | Tách riêng `shortId` + `qrCode` |
| `Device.label` | ❌ | `String?` |
| `EmergencyLog` mở rộng | Cơ bản | Thêm `bystanderIp`, `smsStatus`, `resolvedBy` |
| `AuditLog` | ❌ | Bảng mới hoàn toàn |

**Hành động:**
```bash
cd backend

# Copy schema từ tài liệu 04_Database_Schema_Design.md phần 3

# Tạo migration
npx prisma migrate dev --name "full_schema_v2"

# Generate client
npx prisma generate

# Verify
npx prisma studio  # Mở browser xem bảng
```

**Commit:** `feat: update Prisma schema v2 (full ERD with AuditLog)`

---

## Task 1.3: Cập nhật Seed Data

**File:** `backend/prisma/seed.ts`

Mở rộng seed data để cover tất cả use case testing:

```typescript
// Seed cần tạo:
// 1. Guardian user (email: nguoithan@medtag.vn, pass: 123456)
// 2. Doctor user (email: bacsi@medtag.vn, pass: 123456, role: DOCTOR)
// 3. Admin user (email: admin@medtag.vn, pass: 123456, role: ADMIN)
// 4. MedicalRecord #1 (Ông - O+, allergies: [Penicillin, Đậu phộng])
//    - encryptedMedicalData: encrypt(JSON chi tiết bệnh án)
// 5. MedicalRecord #2 (Bà - AB-, allergies: [Sulfonamide])
// 6. Device #1 (shortId: X7K9A2, linkedTo: Record #1)
// 7. Device #2 (shortId: B3M5T8, linkedTo: Record #1)
// 8. Device #3 (shortId: K2P7L4, linkedTo: Record #2)
// 9. EmergencyLog sample (TRIGGERED + RESOLVED)
```

**Lưu ý:** Seed phải GỌI `CryptoService.encrypt()` để mã hóa `encryptedMedicalData` → test giải mã sau này.

```bash
npx prisma db seed
```

**Commit:** `feat: expand seed data with Doctor, múltiple records and devices`

---

## Task 1.4: Refactor AuthModule (JWT + Passport Strategy)

**File hiện tại:** `backend/src/auth/auth.service.ts` → chỉ có hash/compare/sign.

**Cần bổ sung:**

### `backend/src/auth/auth.controller.ts` (MỚI)
```typescript
// POST /api/auth/register
// POST /api/auth/login
// GET  /api/auth/me (Protected)
```

### `backend/src/auth/strategies/jwt.strategy.ts` (MỚI)
```typescript
// Passport JWT strategy: extract token từ Authorization header
// Validate payload → inject vào request.user
```

### `backend/src/auth/dto/register.dto.ts` (MỚI)
```typescript
// class RegisterDto {
//   @IsEmail() email: string;
//   @MinLength(8) password: string;
//   @IsString() fullName: string;
//   @IsOptional() @IsString() phoneNumber?: string;
// }
```

### `backend/src/auth/dto/login.dto.ts` (MỚI)
```typescript
// class LoginDto {
//   @IsEmail() email: string;
//   @IsString() password: string;
// }
```

**Logic chính:**
1. `register()`: Check email unique → hash password → create User → generate JWT → return token
2. `login()`: Find user by email → compare bcrypt → generate JWT → return { user, token }
3. `me()`: Dùng JwtAuthGuard → return request.user

**Kiểm tra:**
```bash
# Test register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","fullName":"Test User"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguoithan@medtag.vn","password":"123456"}'
```

**Commit:** `feat: complete AuthModule with register, login, JWT strategy`

---

## Task 1.5: Tạo Common Guards & Decorators

### `backend/src/common/guards/jwt-auth.guard.ts`
```typescript
// Extends AuthGuard('jwt') from @nestjs/passport
// Sử dụng: @UseGuards(JwtAuthGuard)
```

### `backend/src/common/guards/roles.guard.ts`
```typescript
// Role-based guard: kiểm tra user.role có nằm trong @Roles() không
// Sử dụng: @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.DOCTOR)
```

### `backend/src/common/decorators/current-user.decorator.ts`
```typescript
// @CurrentUser() → lấy user từ request
// Sử dụng: getProfile(@CurrentUser() user: User)
```

### `backend/src/common/decorators/roles.decorator.ts`
```typescript
// @Roles(Role.GUARDIAN, Role.DOCTOR) → set metadata
```

### `backend/src/common/filters/http-exception.filter.ts`
```typescript
// Global exception filter: format error response chuẩn JSON
// { statusCode, message, error, timestamp }
```

**Commit:** `feat: add JwtAuthGuard, RolesGuard, CurrentUser decorator, ExceptionFilter`

---

## Task 1.6: Verify CryptoModule (AES-256)

**Trạng thái hiện tại:** `CryptoService` đã có encrypt/decrypt hoạt động.

**Cần kiểm tra:**
1. Encrypt một JSON bệnh án mẫu → verify format output `iv:ciphertext`
2. Decrypt kết quả → so sánh plaintext = input gốc
3. Xử lý edge case: empty string, unicode tiếng Việt

**Viết test:**
```bash
cd backend
npx jest --testPathPattern crypto
```

**Commit:** `test: verify CryptoService AES-256 encrypt/decrypt`

---

## Task 1.7: Tạo CacheModule (Redis)

### `backend/src/cache/cache.module.ts`
```typescript
// Import @nestjs/cache-manager
// Register với Redis store (Upstash URL từ env)
```

### `backend/src/cache/cache.service.ts`
```typescript
// Wrapper service:
// get<T>(key: string): Promise<T | null>
// set(key: string, value: any, ttl: number): Promise<void>
// del(key: string): Promise<void>
// invalidatePattern(pattern: string): Promise<void>
```

**Fallback:** Nếu Redis URL không có (dev mode), dùng in-memory cache.

**Commit:** `feat: add CacheModule with Redis support`

---

## Task 1.8: Cập nhật AppModule imports

**File:** `backend/src/app.module.ts`

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,        // ← Global singleton
    AuthModule,
    CryptoModule,
    CacheModule,         // ← Redis
    EmergencyModule,     // ← Sẽ Refactor ở Phase 2
    // PortalModule,     // ← Phase 3
    // MedicalModule,    // ← Phase 4
    // NotificationModule, // ← Phase 5
    // SchedulerModule,  // ← Phase 5
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Commit:** `feat: update AppModule with all core module imports`

---

## ✅ Checklist Phase 1

- [ ] Task 1.1: PrismaModule singleton
- [ ] Task 1.2: Full Prisma schema v2 + migration
- [ ] Task 1.3: Expanded seed data
- [ ] Task 1.4: AuthModule (register, login, JWT strategy)
- [ ] Task 1.5: Common guards & decorators
- [ ] Task 1.6: Verify CryptoModule
- [ ] Task 1.7: CacheModule (Redis)
- [ ] Task 1.8: AppModule imports

**Khi tất cả ✅ → Chuyển sang Phase 2 và/hoặc Phase 3 (có thể song song)**

---

## 🤖 Prompt Template Cho AI Agent (Phase 1)

```
Ngữ cảnh: Dự án MedTag – NestJS backend monorepo.
Tôi đang ở Phase 1: Database & Core Backend.

Hãy đọc các file sau:
- 02. PTTKHT/04_Database_Schema_Design.md (Prisma Schema đề xuất)
- 02. PTTKHT/05_API_Specification.md (API /api/auth/*)
- backend/prisma/schema.prisma (schema hiện tại)
- backend/src/auth/auth.service.ts (auth hiện tại)

Task: [MÔ TẢ CỤ THỂ, ví dụ:
  "Tạo file backend/src/common/guards/jwt-auth.guard.ts sử dụng
   Passport JWT strategy. Guard phải verify JWT token từ
   Authorization: Bearer header và inject user vào request."]

Ràng buộc:
- TypeScript strict, không dùng `any`
- Tuân thủ NestJS Module/Controller/Service
- Phải compile thành công: npm run build
```
