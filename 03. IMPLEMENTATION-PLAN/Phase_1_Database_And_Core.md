# Phase 1: Database & Core Backend Modules

> **Mục tiêu:** Tạo các module nền tảng mà tất cả Phase sau phụ thuộc:
> PrismaModule (singleton), AuthModule (JWT), CryptoModule (AES-256), Common Guards.
> Kết thúc Phase 1 khi có thể Register/Login user và encrypt/decrypt dữ liệu.

---

## Tham Chiếu
- `02. PTTKHT/04_Database_Schema_Design.md` → Schema + Encrypted JSON
- `02. PTTKHT/05_API_Specification.md` → API Auth
- `02. PTTKHT/09_Module_Dependency_Map.md` → Module imports

---

## Task 1.1: Tạo PrismaModule (Global Singleton)

### Tạo files:
```
backend/src/prisma/
├── prisma.module.ts
└── prisma.service.ts
```

### `prisma.module.ts`
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

### `prisma.service.ts`
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

**Import vào `app.module.ts`.**

**Commit:** `feat: PrismaModule global singleton`

---

## Task 1.2: Tạo CryptoModule (AES-256-CBC)

### Tạo files:
```
backend/src/crypto/
├── crypto.module.ts
└── crypto.service.ts
```

### `crypto.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor(private config: ConfigService) {
    const hexKey = this.config.get<string>('AES_SECRET_KEY');
    this.key = Buffer.from(hexKey, 'hex');
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(ciphertext: string): string {
    const [ivHex, encHex] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}
```

### `crypto.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
```

**Commit:** `feat: CryptoModule AES-256-CBC encrypt/decrypt`

---

## Task 1.3: Tạo AuthModule (Register + Login + JWT)

### Tạo files:
```
backend/src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts
```

### Endpoints:
- `POST /api/auth/register` → Tạo user mới, hash password, trả JWT
- `POST /api/auth/login` → Verify credentials, trả JWT
- `GET /api/auth/me` → Protected, trả thông tin user hiện tại

### DTOs:
```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @MinLength(2) fullName: string;
  @IsOptional() @IsString() phoneNumber?: string;
}

// login.dto.ts
export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
```

### Logic:
1. `register()`: Check email unique → bcrypt hash → Prisma create User → sign JWT
2. `login()`: Find by email → bcrypt compare → sign JWT → return { user, token }
3. `me()`: JwtAuthGuard → return request.user (trừ password)

### JWT Strategy:
- Extract token từ `Authorization: Bearer <token>`
- Payload: `{ sub: userId, email, role }`
- Validate: Find user by id, return user object

**Commit:** `feat: AuthModule with register, login, JWT strategy`

---

## Task 1.4: Common Guards & Decorators

### Tạo files:
```
backend/src/common/
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── decorators/
│   ├── current-user.decorator.ts
│   └── roles.decorator.ts
└── filters/
    └── http-exception.filter.ts
```

### Guards:
- `JwtAuthGuard`: extends `AuthGuard('jwt')` → verify JWT
- `RolesGuard`: kiểm tra `user.role` có nằm trong `@Roles()` metadata không

### Decorators:
- `@CurrentUser()`: lấy user từ `request.user`
- `@Roles(Role.GUARDIAN, Role.DOCTOR)`: set metadata

### Filter:
- Global exception filter: format error chuẩn `{ statusCode, message, error, timestamp }`

**Commit:** `feat: guards, decorators, exception filter`

---

## Task 1.5: Wire Up AppModule

```typescript
// backend/src/app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CryptoModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**Commit:** `feat: wire up AppModule with core modules`

---

## Task 1.6: Seed Data

### `backend/prisma/seed.ts`

Tạo dữ liệu test:
1. **Guardian** user: `nguoithan@medtag.vn` / `123456` (Role: GUARDIAN)
2. **Doctor** user: `bacsi@medtag.vn` / `123456` (Role: DOCTOR)
3. **MedicalRecord #1**: Ông Nguyễn Văn A (O+, allergies, conditions)
   - encryptedMedicalData = CryptoService.encrypt(JSON bệnh án chi tiết)
4. **MedicalRecord #2**: Bà Nguyễn Thị B (AB-)
5. **Device #1**: shortId `X7K9A2` → linked to Record #1
6. **Device #2**: shortId `B3M5T8` → linked to Record #1
7. **Device #3**: shortId `K2P7L4` → linked to Record #2
8. **EmergencyLog** sample

```bash
npx prisma db seed
```

**Commit:** `feat: comprehensive seed data with encrypted records`

---

## Task 1.7: Verification – Test Core APIs

```bash
# 1. Check compile
cd backend && npm run build

# 2. Start server
npm run start:dev

# 3. Test register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","fullName":"Test User"}'

# 4. Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nguoithan@medtag.vn","password":"123456"}'

# 5. Test me (with token from step 4)
curl http://localhost:3001/api/auth/me -H "Authorization: Bearer TOKEN_HERE"
```

**Commit:** `test: verify auth flow works end-to-end`

---

## ✅ Checklist Phase 1

- [ ] Task 1.1: PrismaModule singleton
- [ ] Task 1.2: CryptoModule (AES-256)
- [ ] Task 1.3: AuthModule (register, login, JWT)
- [ ] Task 1.4: Common guards & decorators
- [ ] Task 1.5: Wire up AppModule
- [ ] Task 1.6: Seed data
- [ ] Task 1.7: Verification

**Khi tất cả ✅ → Phase 2 + Phase 3 có thể song song**
