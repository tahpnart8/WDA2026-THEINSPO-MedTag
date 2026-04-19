# 09. Bản Đồ Module & Phụ Thuộc (Module Dependency Map)

## 1. NestJS Backend Module Dependency

```
                        ┌──────────────────┐
                        │    AppModule     │
                        │   (Root Module)   │
                        └───────┬──────────┘
                                │
          ┌─────────────────────┼─────────────────────────────┐
          │           │         │         │          │         │
    ┌─────▼──┐  ┌─────▼──┐ ┌───▼────┐ ┌──▼──────┐ ┌▼──────┐ ┌▼──────────┐
    │  Auth  │  │Emergency│ │ Portal │ │Medical │ │Cache │ │ Scheduler │
    │ Module │  │ Module  │ │ Module │ │Module  │ │Module│ │  Module   │
    └───┬────┘  └───┬─────┘ └───┬────┘ └───┬────┘ └──┬───┘ └─────┬─────┘
        │           │           │          │         │           │
        │  ┌────────┘           │          │         │           │
        │  │    ┌───────────────┘          │         │           │
        │  │    │     ┌────────────────────┘         │           │
        │  │    │     │                              │           │
    ┌───▼──▼────▼─────▼──┐                    ┌──────▼───────────▼──┐
    │     Prisma Module   │                    │   Config Module    │
    │  (Database Access)  │                    │  (Env Variables)    │
    └─────────────────────┘                    └────────────────────┘
              │                                        │
    ┌─────────▼─────────┐                    ┌─────────▼───────────┐
    │    Crypto Module   │                    │ Notification Module │
    │   (AES-256 E/D)    │                    │  (Twilio SMS/Push)  │
    └────────────────────┘                    └─────────────────────┘
```

## 2. Chi Tiết Phụ Thuộc Từng Module

| Module | Imports | Exports | Mô tả |
|---|---|---|---|
| **AppModule** | Auth, Emergency, Portal, Medical, Cache, Scheduler, Config | - | Root module |
| **AuthModule** | Config, JwtModule, PrismaModule | AuthService, JwtModule | JWT sign/verify, bcrypt |
| **EmergencyModule** | PrismaModule, CacheModule, NotificationModule | - | Public API không cần auth |
| **PortalModule** | AuthModule, PrismaModule, CryptoModule, CacheModule | - | CRUD Guardian (JWT required) |
| **MedicalModule** | AuthModule, PrismaModule, CryptoModule | - | Decrypt bệnh án (JWT Doctor) |
| **CryptoModule** | ConfigModule | CryptoService | AES-256 encrypt/decrypt |
| **PrismaModule** | - | PrismaService | Shared DB client |
| **CacheModule** | ConfigModule | CacheService | Redis get/set/del |
| **NotificationModule** | ConfigModule | NotificationService | Twilio SMS/Push |
| **SchedulerModule** | PrismaModule, NotificationModule | - | Cron-Job Data Freshness |

## 3. Frontend Component Dependency Tree

```
App (layout.tsx)
├── / (page.tsx) ─── Landing Page
│   └── Button
│
├── /e/[shortId] (page.tsx) ─── Emergency Portal
│   ├── AntiSpamGate ─── Hold-to-unlock
│   │   └── Button
│   ├── VisualCheck ─── Avatar display
│   ├── ContactBox (Green) ─── Patient info + emergency contact
│   ├── BloodTypeBox (Black) ─── Blood type display
│   ├── AllergyBox (Red) ─── Allergies list
│   ├── ConditionBox (Yellow) ─── Dangerous conditions
│   ├── SOSButton ─── 15s countdown + GPS
│   │   └── Button
│   └── Skeleton (loading.tsx) ─── Offline fallback
│
├── /medical/login (page.tsx) ─── Doctor Login
│   └── Input, Button
│
├── /medical/[shortId] (page.tsx) ─── Medical Dashboard
│   ├── FreshnessFlag ─── Data quality indicator
│   ├── MedicalHistory ─── Chronic diseases, surgeries
│   ├── MedicationList ─── Current medications
│   ├── LabResults ─── Recent lab tests
│   └── Contraindications ─── Drug warnings
│
├── /portal/layout.tsx ─── Portal Layout
│   ├── Sidebar ─── Navigation menu
│   ├── Header ─── User info + logout
│   └── AuthGuard ─── JWT check wrapper
│
├── /portal/login (page.tsx) ─── Guardian Login
│   └── Input, Button
│
├── /portal/register (page.tsx) ─── Guardian Register
│   └── Input, Button, Select
│
├── /portal/dashboard (page.tsx) ─── Dashboard
│   ├── PatientCard ─── Patient summary cards
│   ├── FreshnessReminder ─── Stale data alerts
│   └── Badge ─── Status indicators
│
├── /portal/patients (page.tsx) ─── Patient List
│   ├── PatientCard
│   └── Button (Add new)
│
├── /portal/patients/new (page.tsx) ─── Create Patient
│   └── MedicalRecordForm ─── Full form with all fields
│       ├── Input, Select, Button
│       └── Modal (confirm)
│
├── /portal/patients/[id] (page.tsx) ─── Patient Detail
│   ├── PatientCard (expanded)
│   ├── DeviceLinkForm ─── Link QR devices
│   └── EmergencyLogTable ─── SOS history for this patient
│
├── /portal/devices (page.tsx) ─── Device Management
│   ├── DataTable ─── Device list
│   ├── DeviceLinkForm
│   └── ConfirmDialog ─── Unlink confirmation
│
├── /portal/emergency-logs (page.tsx) ─── Emergency History
│   └── EmergencyLogTable
│       └── DataTable, Badge
│
└── /portal/settings (page.tsx) ─── Account Settings
    └── Input, Button
```

## 4. Shared Hooks Dependency

```
useAuth ──────────── lib/auth.ts (token management)
    │                lib/api.ts (fetch wrapper)
    │
useEmergency ─────── lib/api.ts
    │                useGeolocation (GPS)
    │
useMedicalRecords ── lib/api.ts
    │                useAuth (token inject)
    │
useDevices ────────── lib/api.ts
    │                useAuth
    │
useGeolocation ───── navigator.geolocation API
```

## 5. TypeScript Types Dependency

```
types/
├── user.ts
│   └── interface User { id, email, role, fullName, phoneNumber }
│   └── type Role = 'GUARDIAN' | 'DOCTOR' | 'ADMIN'
│
├── medical-record.ts
│   └── interface MedicalRecord { id, patientName, bloodType, allergies, ... }
│   └── interface EncryptedMedicalData { medicalHistory, currentMedications, ... }
│   └── type BloodType = 'A_POSITIVE' | 'A_NEGATIVE' | ...
│   └── type Gender = 'MALE' | 'FEMALE' | 'OTHER'
│   └── type DataFreshnessStatus = 'FRESH' | 'STALE' | 'EXPIRED'
│
├── device.ts
│   └── interface Device { id, qrCode, shortId, label, isActive, medicalRecordId }
│
├── emergency-log.ts
│   └── interface EmergencyLog { id, latitude, longitude, status, createdAt }
│   └── type EmergencyStatus = 'TRIGGERED' | 'CANCELLED' | 'RESOLVED'
│
└── api-response.ts
    └── interface ApiResponse<T> { success: boolean, data?: T, message?: string }
    └── interface PaginatedResponse<T> extends ApiResponse { total, page, limit }
    └── interface ApiError { statusCode, message, error, details? }
```
