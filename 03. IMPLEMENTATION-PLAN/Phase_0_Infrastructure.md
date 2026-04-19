# Phase 0: Infrastructure & Project Bootstrap

> **Mục tiêu:** Dựng xong bộ khung dự án, cài đặt toàn bộ dependencies, cấu hình biến môi trường, đảm bảo cả FE+BE chạy được trên local.

---

## Pre-conditions
- Node.js >= 18 đã cài đặt
- Git đã cài đặt + repo đã clone
- Tài khoản Supabase (PostgreSQL), Upstash (Redis) đã tạo
- Tài khoản Vercel + Render.com (hoặc tương đương)

---

## Task 0.1: Kiểm tra & cập nhật cấu trúc Monorepo

**Trạng thái hiện tại:** Repo đã có `/frontend` (Next.js) và `/backend` (NestJS) ở root.

**Hành động:**
```bash
# Kiểm tra cấu trúc hiện tại
ls -la
ls frontend/package.json
ls backend/package.json
```

**Kết quả mong đợi:** Cả hai thư mục có `package.json` hợp lệ.

**Commit:** `chore: verify monorepo structure`

---

## Task 0.2: Cài đặt / Cập nhật Dependencies cho Backend

**File cần sửa:** `backend/package.json`

**Dependencies cần có:**
```bash
cd backend

# Core NestJS
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/config @nestjs/jwt @nestjs/passport
npm install @nestjs/schedule  # CronJob cho Data Freshness

# Database
npm install @prisma/client
npm install -D prisma

# Security
npm install bcrypt passport passport-jwt
npm install -D @types/bcrypt @types/passport-jwt

# Validation
npm install class-validator class-transformer

# Cache (Redis)
npm install @nestjs/cache-manager cache-manager
npm install cache-manager-redis-yet redis

# File Upload
npm install @nestjs/platform-express multer
npm install -D @types/multer

# SMS (Twilio) - có thể cài sau ở Phase 5
# npm install twilio
```

**Kiểm tra:**
```bash
cd backend && npm run build
```

**Commit:** `chore: update backend dependencies`

---

## Task 0.3: Cài đặt / Cập nhật Dependencies cho Frontend

**File cần sửa:** `frontend/package.json`

**Dependencies cần có:**
```bash
cd frontend

# Core (đã có)
# next react react-dom tailwindcss

# PWA Support
npm install next-pwa

# Icons
npm install lucide-react

# Form Management
npm install react-hook-form @hookform/resolvers zod

# HTTP Client
npm install axios

# Toast Notifications  
npm install react-hot-toast

# Date utilities
npm install date-fns
```

**Kiểm tra:**
```bash
cd frontend && npm run build
```

**Commit:** `chore: update frontend dependencies`

---

## Task 0.4: Cấu hình biến môi trường

### Backend: `backend/.env`
```env
# === Database (Supabase PostgreSQL) ===
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# === Security ===
JWT_SECRET="[RANDOM_64_CHAR_HEX_STRING]"
AES_SECRET_KEY="[RANDOM_64_CHAR_HEX_STRING]"

# Tạo random hex:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# === Redis (Upstash) ===
REDIS_URL="redis://default:[PASSWORD]@[HOST].upstash.io:6379"

# === Twilio (Phase 5 – Mock for now) ===
TWILIO_ACCOUNT_SID="AC_MOCK"
TWILIO_AUTH_TOKEN="MOCK_TOKEN"
TWILIO_PHONE_NUMBER="+10000000000"

# === Server ===
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

### Frontend: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### `.gitignore` phải chứa:
```
.env
.env.local
.env.production
```

**Commit:** `chore: configure environment variables (template)`

---

## Task 0.5: Cấu hình CORS + Global Pipes cho Backend

**File:** `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://medtag.vercel.app',  // Production frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true,        // Auto-transform DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 MedTag Backend running on http://localhost:${port}/api`);
}
bootstrap();
```

**Kiểm tra:**
```bash
cd backend && npm run start:dev
# Truy cập http://localhost:3001/api → Should return "Hello World!"
```

**Commit:** `feat: configure CORS, ValidationPipe, global prefix /api`

---

## ✅ Checklist Phase 0

- [ ] Task 0.1: Kiểm tra cấu trúc monorepo
- [ ] Task 0.2: Backend dependencies
- [ ] Task 0.3: Frontend dependencies
- [ ] Task 0.4: Environment variables
- [ ] Task 0.5: CORS + Global Pipes

**Khi tất cả ✅ → Chuyển sang Phase 1**

---

## 🤖 Prompt Template Cho AI Agent

```
Ngữ cảnh: Tôi đang phát triển dự án MedTag – Hệ thống thông tin y tế khẩn cấp.
Tech stack: Next.js (Frontend) + NestJS (Backend) + PostgreSQL (Supabase) + Prisma ORM.

Hãy đọc file sau để hiểu kiến trúc:
- 02. PTTKHT/07_System_Architecture.md

Task hiện tại: [MÔ TẢ TASK CỤ THỂ]

Yêu cầu:
- TypeScript strict mode
- Tuân thủ NestJS Module/Controller/Service pattern
- Code phải compile thành công (npm run build)
```
