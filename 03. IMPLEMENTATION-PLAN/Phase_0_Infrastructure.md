# Phase 0: Infrastructure – Khởi Tạo Dự Án Từ Đầu

> **Mục tiêu:** Tạo mới hoàn toàn backend (NestJS) và frontend (Next.js) từ đầu,
> cài đặt toàn bộ dependencies, cấu hình biến môi trường. Kết thúc Phase 0
> khi cả 2 projects đều chạy được trên local.

---

## Pre-conditions
- Node.js >= 18 đã cài đặt
- Git đã cài đặt + repo đã clone
- Các folder cũ `backend/` và `frontend/` đã xóa
- Tài khoản Supabase đã có sẵn (DB URL đã có)

---

## Task 0.1: Khởi tạo NestJS Backend

```bash
cd WDA2026-THEINSPO-MedTag
npx -y @nestjs/cli new backend --package-manager npm --skip-git --strict
```

**Lưu ý:** Flag `--skip-git` vì monorepo đã có `.git` ở root.

**Kết quả:** Folder `backend/` được tạo mới với NestJS boilerplate.

**Commit:** `chore: initialize fresh NestJS backend`

---

## Task 0.2: Cài đặt Backend Dependencies

```bash
cd backend

# === Production Dependencies ===
npm install @prisma/client
npm install @nestjs/config
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt
npm install class-validator class-transformer
npm install @nestjs/schedule

# === Dev Dependencies ===
npm install -D prisma
npm install -D @types/bcrypt @types/passport-jwt
```

**Giải thích:**
| Package | Mục đích |
|---|---|
| `@prisma/client` | ORM cho PostgreSQL |
| `@nestjs/config` | Đọc biến `.env` |
| `@nestjs/jwt`, `passport`, `passport-jwt` | JWT authentication |
| `bcrypt` | Hash password |
| `class-validator`, `class-transformer` | DTO validation |
| `@nestjs/schedule` | Cron-job Data Freshness |

**Commit:** `chore: install backend dependencies`

---

## Task 0.3: Khởi tạo Next.js Frontend

```bash
cd WDA2026-THEINSPO-MedTag
npx -y create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --skip-git --use-npm
```

**Flags:**
- `--typescript` TypeScript
- `--tailwind` TailwindCSS
- `--app` App Router (không dùng Pages Router)
- `--src-dir` Đặt source trong `src/`
- `--skip-git` Không tạo `.git` riêng
- `--use-npm` Dùng npm (không phải yarn/pnpm)

**Commit:** `chore: initialize fresh Next.js frontend`

---

## Task 0.4: Cài đặt Frontend Dependencies

```bash
cd frontend

npm install lucide-react           # Icons
npm install react-hook-form        # Form management
npm install @hookform/resolvers    # Zod integration
npm install zod                    # Schema validation
npm install react-hot-toast        # Toast notifications
npm install date-fns               # Date utilities
```

**Commit:** `chore: install frontend dependencies`

---

## Task 0.5: Cấu hình Backend .env + main.ts

### `backend/.env`
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.uhonbkmaqjuxvysmegfe:DUCphat%4018306@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.uhonbkmaqjuxvysmegfe:DUCphat%4018306@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# JWT
JWT_SECRET="medtag-super-secret-jwt-key"

# AES-256 (32 bytes hex)
AES_SECRET_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Server
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### `backend/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://medtag.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MedTag Backend running on http://localhost:${port}/api`);
}
bootstrap();
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Commit:** `chore: configure env, CORS, ValidationPipe, global prefix`

---

## Task 0.6: Prisma Init + Schema

```bash
cd backend
npx prisma init
```

Sau đó copy toàn bộ schema từ `02. PTTKHT/04_Database_Schema_Design.md` vào `backend/prisma/schema.prisma`.

```bash
npx prisma generate         # Generate client
npx prisma migrate dev --name "init"   # Tạo migration + sync DB
```

**Commit:** `feat: Prisma schema v2 with full ERD`

---

## Task 0.7: Verify cả 2 projects chạy được

```bash
# Terminal 1
cd backend && npm run start:dev
# Expected: 🚀 MedTag Backend running on http://localhost:3001/api

# Terminal 2
cd frontend && npm run dev
# Expected: ✓ Ready on http://localhost:3000
```

**Commit:** `chore: verify both projects run successfully`

---

## ✅ Checklist Phase 0

- [ ] Task 0.1: Khởi tạo NestJS backend
- [ ] Task 0.2: Cài backend dependencies
- [ ] Task 0.3: Khởi tạo Next.js frontend
- [ ] Task 0.4: Cài frontend dependencies
- [ ] Task 0.5: Cấu hình .env + main.ts
- [ ] Task 0.6: Prisma init + schema + migration
- [ ] Task 0.7: Verify cả 2 chạy được

**Khi tất cả ✅ → Chuyển sang Phase 1**
