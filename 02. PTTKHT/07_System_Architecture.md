# 07. Kiến Trúc Hệ Thống & Cấu Trúc Module (System Architecture)

## 1. Kiến Trúc Tổng Thể (High-Level Architecture)

```
                        ┌─────────────────────────────────────────┐
                        │              INTERNET                    │
                        └──────────────────┬──────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
              📱 Bystander           👨‍⚕️ Doctor              👪 Guardian
              (Quét QR)           (SSO VNeID)          (Email/Pass)
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                                    ┌──────▼──────┐
                                    │    CDN      │
                                    │  (Vercel)   │
                                    └──────┬──────┘
                                           │
                              ┌────────────▼────────────┐
                              │     FRONTEND (Next.js)   │
                              │     Vercel Hosting        │
                              │                          │
                              │  ┌────────────────────┐  │
                              │  │ Public Gateway     │  │
                              │  │ /e/[shortId]       │  │
                              │  ├────────────────────┤  │
                              │  │ Medical Portal     │  │
                              │  │ /medical/*         │  │
                              │  ├────────────────────┤  │
                              │  │ Management Portal  │  │
                              │  │ /portal/*          │  │
                              │  └────────────────────┘  │
                              └────────────┬─────────────┘
                                           │ HTTPS (REST API)
                              ┌────────────▼─────────────┐
                              │     BACKEND (NestJS)      │
                              │     Render Hosting        │
                              │                          │
                              │  ┌──────┐ ┌──────────┐  │
                              │  │ Auth │ │ Emergency │  │
                              │  │Module│ │  Module   │  │
                              │  └──────┘ └──────────┘  │
                              │  ┌──────┐ ┌──────────┐  │
                              │  │Portal│ │ Medical  │  │
                              │  │Module│ │  Module   │  │
                              │  └──────┘ └──────────┘  │
                              │  ┌──────┐ ┌──────────┐  │
                              │  │Crypto│ │  Prisma  │  │
                              │  │Module│ │  ORM     │  │
                              │  └──────┘ └──────────┘  │
                              └──┬──────────┬───────────┘
                                 │          │
                    ┌────────────▼─┐  ┌─────▼─────────┐
                    │    Redis     │  │  PostgreSQL    │
                    │   (Upstash)  │  │  (Supabase)    │
                    │              │  │                │
                    │ Cache layer  │  │ Primary store  │
                    │ emergency    │  │ All tables     │
                    │ data         │  │ + encryption   │
                    └──────────────┘  └───────────────┘
                                             │
                              ┌──────────────▼──────────┐
                              │   External Services      │
                              │  ┌──────────────────┐   │
                              │  │ Twilio (SMS/Push) │   │
                              │  ├──────────────────┤   │
                              │  │ Supabase Storage  │   │
                              │  │ (Avatar images)   │   │
                              │  └──────────────────┘   │
                              └─────────────────────────┘
```

---

## 2. Kiến Trúc 3 Lớp (Three-Tier Architecture)

```
┌────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│                    (Next.js Frontend)                          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │   Hooks      │         │
│  │  (App Router)│  │  (UI + Biz)  │  │  (API calls) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├────────────────────────────────────────────────────────────────┤
│                    BUSINESS LOGIC LAYER                        │
│                    (NestJS Backend)                            │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Controllers │  │  Services    │  │   Guards     │         │
│  │  (Routes)    │  │  (Logic)     │  │  (Auth/RBAC) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
├────────────────────────────────────────────────────────────────┤
│                    DATA ACCESS LAYER                           │
│                    (Prisma + Redis)                            │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Prisma ORM  │  │  Redis Cache │  │  File Store  │         │
│  │  (PostgreSQL)│  │  (Upstash)   │  │  (Supabase)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Cấu Trúc Thư Mục Chi Tiết (Project Structure)

### 3.1. Frontend (Next.js)

```
frontend/
├── public/
│   ├── icons/                    # PWA icons
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service Worker (next-pwa)
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── page.tsx              # Landing page (ShortID input)
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── e/                    # === PUBLIC GATEWAY ===
│   │   │   └── [shortId]/
│   │   │       ├── page.tsx      # Emergency portal (Luồng 1)
│   │   │       └── loading.tsx   # Skeleton loading UI
│   │   │
│   │   ├── medical/              # === SECURE MEDICAL VAULT ===
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # Doctor login (SSO Mock)
│   │   │   └── [shortId]/
│   │   │       └── page.tsx      # Decrypted medical dashboard
│   │   │
│   │   └── portal/               # === MANAGEMENT PORTAL ===
│   │       ├── layout.tsx        # Portal layout (sidebar, nav)
│   │       ├── login/
│   │       │   └── page.tsx      # Guardian login
│   │       ├── register/
│   │       │   └── page.tsx      # Guardian register
│   │       ├── dashboard/
│   │       │   └── page.tsx      # Main dashboard
│   │       ├── patients/
│   │       │   ├── page.tsx      # Patient list
│   │       │   ├── new/
│   │       │   │   └── page.tsx  # Create patient form
│   │       │   └── [id]/
│   │       │       ├── page.tsx  # Patient detail
│   │       │       └── edit/
│   │       │           └── page.tsx  # Edit patient
│   │       ├── devices/
│   │       │   └── page.tsx      # Device management
│   │       ├── emergency-logs/
│   │       │   └── page.tsx      # SOS history
│   │       └── settings/
│   │           └── page.tsx      # Account settings
│   │
│   ├── components/
│   │   ├── ui/                   # === Shared UI Components ===
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   │
│   │   ├── emergency/            # === Emergency-specific ===
│   │   │   ├── AntiSpamGate.tsx  # Hold-to-unlock gate
│   │   │   ├── SOSButton.tsx     # 15s countdown SOS
│   │   │   ├── BloodTypeBox.tsx  # Black box (Nhóm máu)
│   │   │   ├── AllergyBox.tsx    # Red box (Dị ứng)
│   │   │   ├── ConditionBox.tsx  # Yellow box (Bệnh nền)
│   │   │   ├── ContactBox.tsx    # Green box (Liên hệ)
│   │   │   └── VisualCheck.tsx   # Avatar double check
│   │   │
│   │   ├── medical/              # === Medical dashboard ===
│   │   │   ├── MedicalHistory.tsx
│   │   │   ├── MedicationList.tsx
│   │   │   ├── LabResults.tsx
│   │   │   ├── Contraindications.tsx
│   │   │   └── FreshnessFlag.tsx
│   │   │
│   │   ├── portal/               # === Portal dashboard ===
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PatientCard.tsx
│   │   │   ├── DeviceLinkForm.tsx
│   │   │   ├── MedicalRecordForm.tsx
│   │   │   ├── EmergencyLogTable.tsx
│   │   │   └── FreshnessReminder.tsx
│   │   │
│   │   └── layout/               # === Layout components ===
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── AuthGuard.tsx     # Protected route wrapper
│   │
│   ├── hooks/                    # === Custom Hooks ===
│   │   ├── useAuth.ts            # Auth state management
│   │   ├── useEmergency.ts       # Emergency API calls
│   │   ├── useMedicalRecords.ts  # CRUD operations
│   │   ├── useDevices.ts         # Device management
│   │   └── useGeolocation.ts     # GPS wrapper
│   │
│   ├── lib/                      # === Utilities ===
│   │   ├── api.ts                # Axios/fetch wrapper
│   │   ├── auth.ts               # Token management
│   │   ├── constants.ts          # App constants
│   │   └── utils.ts              # Helper functions
│   │
│   └── types/                    # === TypeScript Types ===
│       ├── user.ts
│       ├── medical-record.ts
│       ├── device.ts
│       ├── emergency-log.ts
│       └── api-response.ts
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 3.2. Backend (NestJS)

```
backend/
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration files
│   └── seed.ts                   # Seed data
│
├── src/
│   ├── main.ts                   # App bootstrap (CORS, Validation)
│   ├── app.module.ts             # Root module
│   ├── app.controller.ts         # Health check
│   │
│   ├── common/                   # === Shared Utilities ===
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser()
│   │   │   └── roles.decorator.ts          # @Roles(Role.DOCTOR)
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts           # JWT verification
│   │   │   └── roles.guard.ts              # Role-based access
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts    # Global error handler
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts          # DTO validation
│   │   ├── interceptors/
│   │   │   └── audit-log.interceptor.ts    # Auto audit logging
│   │   └── dto/
│   │       └── pagination.dto.ts           # Shared pagination
│   │
│   ├── prisma/                   # === Prisma Service ===
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts     # Singleton PrismaClient
│   │
│   ├── auth/                     # === Auth Module ===
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts    # /api/auth/*
│   │   ├── auth.service.ts       # Login, Register, JWT
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts   # Passport JWT Strategy
│   │
│   ├── crypto/                   # === Crypto Module ===
│   │   ├── crypto.module.ts
│   │   └── crypto.service.ts     # AES-256 encrypt/decrypt
│   │
│   ├── emergency/                # === Emergency Module ===
│   │   ├── emergency.module.ts
│   │   ├── emergency.controller.ts  # /api/emergency/*
│   │   ├── emergency.service.ts     # Public data + SOS logic
│   │   └── dto/
│   │       └── trigger-sos.dto.ts
│   │
│   ├── portal/                   # === Portal Module ===
│   │   ├── portal.module.ts
│   │   ├── portal.controller.ts  # /api/portal/*
│   │   ├── portal.service.ts     # CRUD MedicalRecord, Device
│   │   └── dto/
│   │       ├── create-medical-record.dto.ts
│   │       ├── update-medical-record.dto.ts
│   │       ├── create-device.dto.ts
│   │       └── upload-avatar.dto.ts
│   │
│   ├── medical/                  # === Medical Module ===
│   │   ├── medical.module.ts
│   │   ├── medical.controller.ts # /api/medical/*
│   │   ├── medical.service.ts    # Decrypt + return full record
│   │   └── dto/
│   │       └── medical-query.dto.ts
│   │
│   ├── notification/             # === Notification Module ===
│   │   ├── notification.module.ts
│   │   └── notification.service.ts  # Twilio SMS / Push
│   │
│   ├── cache/                    # === Redis Cache Module ===
│   │   ├── cache.module.ts
│   │   └── cache.service.ts      # Redis get/set/invalidate
│   │
│   └── scheduler/                # === Scheduler Module ===
│       ├── scheduler.module.ts
│       └── freshness-check.service.ts  # Cron-Job 6-month check
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env                          # Environment variables
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 4. Luồng Dữ Liệu Phân Quyền (Data Access Control)

```
┌──────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                       │
│                                                              │
│  Request ──▶ [Middleware] ──▶ [Guard] ──▶ [Controller]       │
│                                  │                           │
│                          ┌───────┴────────┐                  │
│                          │                │                  │
│                   No Auth Required    JWT Required            │
│                          │                │                  │
│               ┌──────────┘        ┌───────┴────────┐         │
│               │                   │                │         │
│          Emergency         Role: GUARDIAN     Role: DOCTOR   │
│          Module            │                │                │
│          (Public)          │                │                │
│               │            Portal          Medical           │
│               │            Module          Module            │
│               │            │                │                │
│               ▼            ▼                ▼                │
│         ┌─────────┐  ┌─────────┐   ┌──────────────┐         │
│         │Plaintext│  │Plaintext│   │Plaintext +   │         │
│         │ Data    │  │ + CRUD  │   │Decrypt AES   │         │
│         │  ONLY   │  │  All    │   │  All Data    │         │
│         └─────────┘  └─────────┘   └──────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Chiến Lược Bảo Mật (Security Architecture)

### 5.1. Phân Lớp Bảo Vệ

| Lớp | Cơ chế | Mô tả |
|---|---|---|
| **Transport** | HTTPS/TLS 1.3 | Mã hóa toàn bộ traffic |
| **Authentication** | JWT + bcrypt | Xác thực danh tính |
| **Authorization** | RBAC (Role-Based) | Phân quyền theo vai trò |
| **Data at Rest** | AES-256-CBC | Mã hóa dữ liệu nhạy cảm trong DB |
| **Anti-Abuse** | Anti-Spam Gate + Rate Limit | Chống bot, DDoS |
| **Audit** | AuditLog table | Ghi nhận mọi truy cập nhạy cảm |

### 5.2. Quản Lý Secret Keys

```
Biến Môi Trường (.env) – KHÔNG COMMIT LÊN GIT:

DATABASE_URL=postgresql://user:pass@host:5432/medtag
DIRECT_URL=postgresql://user:pass@host:5432/medtag
JWT_SECRET=<random-64-char-hex>
AES_SECRET_KEY=<random-64-char-hex>  (32 bytes = 256 bits)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 5.3. CORS Policy

```typescript
// main.ts
app.enableCors({
  origin: [
    'https://medtag.vn',
    'https://www.medtag.vn',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

---

## 6. Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│ PRODUCTION ENVIRONMENT                                    │
│                                                          │
│  ┌─────────────┐     ┌─────────────┐    ┌────────────┐  │
│  │   Vercel     │     │   Render    │    │  Supabase  │  │
│  │ ┌─────────┐ │     │ ┌─────────┐ │    │ ┌────────┐ │  │
│  │ │ Next.js │ │────▶│ │ NestJS  │ │───▶│ │Postgres│ │  │
│  │ │Frontend │ │     │ │ Backend │ │    │ │  DB    │ │  │
│  │ └─────────┘ │     │ └─────────┘ │    │ └────────┘ │  │
│  │  CDN Edge   │     │  Docker     │    │ ┌────────┐ │  │
│  │  Auto SSL   │     │  Auto Scale │    │ │Storage │ │  │
│  │  Preview    │     │  Health     │    │ │(Avatar)│ │  │
│  │  Deploys    │     │  Checks     │    │ └────────┘ │  │
│  └─────────────┘     └─────────────┘    └────────────┘  │
│                             │                            │
│                      ┌──────▼──────┐                     │
│                      │   Upstash   │                     │
│                      │   Redis     │                     │
│                      │ (Serverless)│                     │
│                      └─────────────┘                     │
│                             │                            │
│                      ┌──────▼──────┐                     │
│                      │   Twilio    │                     │
│                      │ SMS Gateway │                     │
│                      └─────────────┘                     │
└──────────────────────────────────────────────────────────┘

CI/CD Pipeline:
  GitHub Push → Vercel Auto Deploy (FE)
  GitHub Push → Render Auto Deploy (BE)
  prisma migrate deploy → Supabase (DB)
```
