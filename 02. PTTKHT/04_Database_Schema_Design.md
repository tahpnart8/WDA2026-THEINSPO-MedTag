# 04. Thiết Kế Cơ Sở Dữ Liệu (Database Schema Design)

## 1. Triết Lý Thiết Kế

MedTag áp dụng nguyên tắc **Data Layering** (Phân lớp dữ liệu) lấy cảm hứng từ chuẩn HL7 FHIR:
- **Layer 1 – Public Data:** Dữ liệu cứu mạng hiển thị ngay khi quét QR (nhóm máu, dị ứng, bệnh nền). Lưu trữ **plaintext** để truy xuất cực nhanh.
- **Layer 2 – Encrypted Data:** Hồ sơ bệnh án chuyên sâu (tiền sử bệnh, đơn thuốc, xét nghiệm). Lưu trữ **mã hóa AES-256** chỉ bác sĩ có quyền giải mã.
- **Layer 3 – System Metadata:** Dữ liệu nội bộ hệ thống (log SOS, audit trail, session).

---

## 2. Entity Relationship Diagram (ERD)

```
┌──────────────────┐     1:N     ┌──────────────────────┐     1:N     ┌──────────────────┐
│      User        │────────────▶│   MedicalRecord      │────────────▶│     Device       │
│                  │             │                      │             │                  │
│ id          PK   │             │ id              PK   │             │ id          PK   │
│ email       UQ   │             │ patientName          │             │ qrCode      UQ   │
│ password         │             │ dateOfBirth          │             │ shortId     UQ   │
│ role        ENUM │             │ gender          ENUM │             │ label            │
│ fullName         │             │ avatarUrl            │             │ isActive    BOOL │
│ phoneNumber      │             │ bloodType            │             │ medRecordId FK   │
│ isActive    BOOL │             │ allergies       JSON │             │ createdAt        │
│ createdAt        │             │ dangerConds     JSON │             │ updatedAt        │
│ updatedAt        │             │ emergencyPhone       │             └──────────────────┘
└──────────────────┘             │ encryptedData   TEXT │                     │
        │                       │ dataFreshness   ENUM │                     │
        │                       │ guardianId      FK   │                     │
        │                       │ createdAt            │                     │
        │                       │ updatedAt            │                     │
        │                       │ confirmedAt          │                     │
        │                       └──────────────────────┘                     │
        │                               │                                   │
        │                               │ 1:N                               │
        │                               ▼                                   │
        │                       ┌──────────────────────┐                    │
        │                       │   EmergencyLog       │◀───────────────────┘
        │                       │                      │     N:1
        │                       │ id              PK   │
        │                       │ latitude        FLOAT│
        │                       │ longitude       FLOAT│
        │                       │ status          ENUM │
        │                       │ bystanderIp          │
        │                       │ bystanderUA          │
        │                       │ medRecordId     FK   │
        │                       │ deviceId        FK   │
        │                       │ resolvedById    FK   │
        │                       │ notes                │
        │                       │ smsStatus       ENUM │
        │                       │ createdAt            │
        │                       │ updatedAt            │
        │                       └──────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────┐
│   AuditLog       │
│                  │
│ id          PK   │
│ action      ENUM │
│ targetType       │
│ targetId         │
│ userId      FK   │
│ ipAddress        │
│ userAgent        │
│ metadata    JSON │
│ createdAt        │
└──────────────────┘
```

---

## 3. Prisma Schema Đề Xuất (Hoàn Chỉnh)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum Role {
  GUARDIAN
  DOCTOR
  ADMIN
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum BloodType {
  A_POSITIVE    // A+
  A_NEGATIVE    // A-
  B_POSITIVE    // B+
  B_NEGATIVE    // B-
  O_POSITIVE    // O+
  O_NEGATIVE    // O-
  AB_POSITIVE   // AB+
  AB_NEGATIVE   // AB-
  UNKNOWN
}

enum DataFreshnessStatus {
  FRESH       // Đã xác nhận < 6 tháng
  STALE       // 6-12 tháng chưa xác nhận
  EXPIRED     // > 12 tháng chưa xác nhận
}

enum EmergencyStatus {
  TRIGGERED   // Đã kích hoạt
  CANCELLED   // Bệnh nhân/Bystander hủy
  RESOLVED    // Đã xử lý xong
}

enum SmsDeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
}

enum AuditAction {
  LOGIN
  LOGOUT
  VIEW_PUBLIC_RECORD
  VIEW_MEDICAL_RECORD
  CREATE_RECORD
  UPDATE_RECORD
  DELETE_RECORD
  LINK_DEVICE
  UNLINK_DEVICE
  TRIGGER_SOS
  CANCEL_SOS
  CONFIRM_DATA_FRESHNESS
}

// ============================================================
// MODELS
// ============================================================

/// Người dùng hệ thống (Giám hộ, Bác sĩ, Admin)
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String   // bcrypt hash
  role          Role     @default(GUARDIAN)
  fullName      String
  phoneNumber   String?
  avatarUrl     String?
  isActive      Boolean  @default(true)

  // Quan hệ
  medicalRecords MedicalRecord[]
  auditLogs      AuditLog[]
  resolvedLogs   EmergencyLog[]  @relation("ResolvedBy")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@index([role])
}

/// Hồ sơ y tế bệnh nhân - Lõi của hệ thống
model MedicalRecord {
  id                    String   @id @default(uuid())
  
  // --- Thông tin cá nhân (Public Layer) ---
  patientName           String
  dateOfBirth           DateTime?
  gender                Gender?
  avatarUrl             String?  // Ảnh chân dung cho Visual Double Check
  
  // --- Dữ liệu cấp cứu công khai (Public Layer - Plaintext) ---
  bloodType             BloodType @default(UNKNOWN)
  allergies             Json?     // ["Penicillin", "Đậu phộng", "Latex"]
  dangerousConditions   Json?     // ["Nhồi máu cơ tim", "Tiểu đường Type 2"]
  emergencyPhone        String?   // Số điện thoại khẩn cấp hiển thị công khai
  emergencyContactName  String?   // Tên người liên hệ khẩn cấp
  
  // --- Dữ liệu y tế nhạy cảm (Encrypted Layer - AES-256) ---
  // Lưu trữ JSON string đã mã hóa chứa toàn bộ bệnh án chi tiết
  // Cấu trúc JSON gốc trước mã hóa: xem phần 4 bên dưới
  encryptedMedicalData  String?   // iv:ciphertext (AES-256-CBC)
  
  // --- Metadata quản trị ---
  dataFreshnessStatus   DataFreshnessStatus @default(FRESH)
  dataConfirmedAt       DateTime  @default(now()) // Lần cuối Guardian xác nhận
  notes                 String?   // Ghi chú nội bộ

  // Quan hệ
  guardianId            String
  guardian              User      @relation(fields: [guardianId], references: [id], onDelete: Cascade)
  devices               Device[]
  emergencyLogs         EmergencyLog[]

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([guardianId])
  @@index([dataFreshnessStatus])
}

/// Thiết bị vật lý (vòng tay, thẻ, mặt dây chuyền)
model Device {
  id              String   @id @default(uuid())
  qrCode          String   @unique  // Mã QR đầy đủ (có thể là URL)
  shortId         String   @unique  // Mã ID ngắn 6 ký tự (VD: X7K9A2)
  label           String?  // Nhãn hiển thị: "Vòng tay Ông", "Thẻ Bà"
  isActive        Boolean  @default(true)

  // Quan hệ
  medicalRecordId String
  medicalRecord   MedicalRecord @relation(fields: [medicalRecordId], references: [id], onDelete: Cascade)
  emergencyLogs   EmergencyLog[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([shortId])
  @@index([medicalRecordId])
}

/// Nhật ký sự kiện cấp cứu
model EmergencyLog {
  id              String           @id @default(uuid())
  latitude        Float?
  longitude       Float?
  status          EmergencyStatus  @default(TRIGGERED)

  // Thông tin Bystander (ẩn danh)
  bystanderIp     String?
  bystanderUA     String?          // User-Agent trình duyệt

  // SMS Tracking
  smsStatus       SmsDeliveryStatus @default(PENDING)
  smsMessageSid   String?          // Twilio Message SID

  // Ghi chú xử lý
  notes           String?

  // Quan hệ
  medicalRecordId String
  medicalRecord   MedicalRecord    @relation(fields: [medicalRecordId], references: [id])
  deviceId        String?
  device          Device?          @relation(fields: [deviceId], references: [id])
  resolvedById    String?
  resolvedBy      User?            @relation("ResolvedBy", fields: [resolvedById], references: [id])

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([medicalRecordId])
  @@index([status])
  @@index([createdAt])
}

/// Nhật ký kiểm toán bảo mật
model AuditLog {
  id          String      @id @default(uuid())
  action      AuditAction
  targetType  String      // "MedicalRecord", "Device", "EmergencyLog"
  targetId    String?     // ID của đối tượng bị tác động
  
  userId      String?
  user        User?       @relation(fields: [userId], references: [id])
  
  ipAddress   String?
  userAgent   String?
  metadata    Json?       // Dữ liệu bổ sung dạng JSON

  createdAt   DateTime    @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

---

## 4. Cấu Trúc JSON Dữ Liệu Y Tế Nhạy Cảm (Encrypted Layer)

Trường `encryptedMedicalData` lưu trữ chuỗi JSON đã mã hóa AES-256. Dưới đây là cấu trúc JSON **trước khi mã hóa**, được thiết kế theo chuẩn tham khảo HL7 FHIR:

```json
{
  "medicalHistory": {
    "chronicDiseases": [
      {
        "name": "Tiểu đường Type 2",
        "diagnosedDate": "2020-03-15",
        "severity": "moderate",
        "status": "active",
        "treatingDoctor": "BS. Nguyễn Văn B",
        "hospital": "BV Chợ Rẫy"
      }
    ],
    "pastSurgeries": [
      {
        "name": "Phẫu thuật nối xương đùi phải",
        "date": "2019-06-20",
        "hospital": "BV 115",
        "notes": "Có gắn nẹp titan"
      }
    ],
    "familyHistory": "Cha: Tiểu đường. Mẹ: Huyết áp cao."
  },
  "currentMedications": [
    {
      "name": "Metformin 500mg",
      "dosage": "2 lần/ngày (sáng, tối)",
      "purpose": "Kiểm soát đường huyết",
      "prescribedBy": "BS. Nguyễn Văn B",
      "startDate": "2020-04-01",
      "isOngoing": true
    },
    {
      "name": "Lisinopril 10mg",
      "dosage": "1 lần/ngày (sáng)",
      "purpose": "Huyết áp",
      "prescribedBy": "BS. Trần Thị C",
      "startDate": "2021-01-15",
      "isOngoing": true
    }
  ],
  "clinicalContraindications": [
    {
      "drug": "NSAIDs (Ibuprofen, Aspirin)",
      "reason": "Suy thận mạn giai đoạn 2",
      "severity": "high"
    },
    {
      "drug": "Metformin (quá liều)",
      "reason": "Nguy cơ nhiễm toan lactic",
      "severity": "critical"
    }
  ],
  "recentLabResults": [
    {
      "testName": "HbA1c",
      "result": "7.2%",
      "date": "2025-12-01",
      "normalRange": "4.0-5.6%",
      "status": "above_normal"
    },
    {
      "testName": "Creatinine",
      "result": "1.4 mg/dL",
      "date": "2025-12-01",
      "normalRange": "0.7-1.2 mg/dL",
      "status": "above_normal"
    }
  ],
  "vaccinationHistory": [
    {
      "vaccine": "COVID-19 (Pfizer)",
      "doses": 3,
      "lastDoseDate": "2023-09-15"
    },
    {
      "vaccine": "Cúm mùa",
      "doses": 1,
      "lastDoseDate": "2025-10-01"
    }
  ],
  "insuranceInfo": {
    "provider": "BHXH Việt Nam",
    "policyNumber": "HS4020230012345",
    "expiryDate": "2026-12-31"
  }
}
```

---

## 5. Luồng Mã Hóa / Giải Mã

```
┌────────────────┐     JSON.stringify()     ┌──────────────────┐
│  Structured    │ ─────────────────────▶   │  Plaintext JSON  │
│  Medical Data  │                          │  String          │
└────────────────┘                          └──────────────────┘
                                                    │
                                          CryptoService.encrypt()
                                          AES-256-CBC + Random IV
                                                    │
                                                    ▼
                                            ┌──────────────────┐
                                            │ "iv_hex:cipher"  │ ◀── Lưu vào DB
                                            │ encryptedMedical │
                                            │ Data column      │
                                            └──────────────────┘

Giải mã (chỉ khi Bác sĩ yêu cầu):

┌──────────────────┐   CryptoService.decrypt()   ┌──────────────────┐
│ "iv_hex:cipher"  │ ──────────────────────────▶ │  Plaintext JSON  │
│ from DB          │   AES-256-CBC               │  String          │
└──────────────────┘                             └──────────────────┘
                                                          │
                                                  JSON.parse()
                                                          │
                                                          ▼
                                                 ┌──────────────────┐
                                                 │  Structured      │
                                                 │  Medical Data    │ ◀── Trả về cho FE
                                                 └──────────────────┘
```

---

## 6. Seed Data Mẫu

```typescript
// Dữ liệu mẫu cho testing (đã expand từ seed.ts hiện tại)

const sampleEncryptedData = {
  medicalHistory: {
    chronicDiseases: [
      { name: "Nhồi máu cơ tim", diagnosedDate: "2018-05-10", severity: "severe", status: "managed" },
      { name: "Huyết áp cao", diagnosedDate: "2015-11-20", severity: "moderate", status: "active" }
    ],
    pastSurgeries: [
      { name: "Đặt stent mạch vành", date: "2018-06-01", hospital: "Viện Tim TP.HCM" }
    ],
    familyHistory: "Cha: Đột quỵ ở tuổi 62"
  },
  currentMedications: [
    { name: "Aspirin 81mg", dosage: "1 lần/ngày", purpose: "Chống đông máu", isOngoing: true },
    { name: "Atorvastatin 20mg", dosage: "1 lần/ngày (tối)", purpose: "Giảm cholesterol", isOngoing: true },
    { name: "Losartan 50mg", dosage: "1 lần/ngày (sáng)", purpose: "Huyết áp", isOngoing: true }
  ],
  clinicalContraindications: [
    { drug: "Penicillin", reason: "Dị ứng nặng – Sốc phản vệ", severity: "critical" },
    { drug: "NSAID liều cao", reason: "Tăng nguy cơ xuất huyết do dùng Aspirin", severity: "high" }
  ],
  recentLabResults: [
    { testName: "Cholesterol toàn phần", result: "210 mg/dL", date: "2025-11-15", normalRange: "<200 mg/dL" }
  ],
  vaccinationHistory: [],
  insuranceInfo: { provider: "BHXH", policyNumber: "HS40201234567", expiryDate: "2026-06-30" }
};

// Mã hóa bằng CryptoService rồi lưu vào encryptedMedicalData
```

---

## 7. So Sánh Schema Cũ vs Schema Mới

| Trường / Tính năng | Schema Cũ (Hiện tại) | Schema Mới (Đề xuất) |
|---|---|---|
| `MedicalRecord.bloodType` | `String?` tự do | `BloodType` Enum chuẩn hóa |
| `MedicalRecord.allergies` | `String?` text đơn | `Json?` mảng có cấu trúc |
| `MedicalRecord.dangerousConditions` | `String?` text đơn | `Json?` mảng có cấu trúc |
| `MedicalRecord.dateOfBirth` | ❌ Không có | ✅ Thêm mới |
| `MedicalRecord.gender` | ❌ Không có | ✅ `Gender` Enum |
| `MedicalRecord.emergencyPhone` | Lấy từ `guardian.phoneNumber` | ✅ Trường riêng (flexibility) |
| `MedicalRecord.dataFreshness` | ❌ Không có | ✅ Enum + `confirmedAt` |
| `Device.shortId` | Dùng `qrCode` làm cả hai | ✅ Tách riêng `qrCode` và `shortId` |
| `Device.label` | ❌ Không có | ✅ Nhãn "Vòng tay Ông" |
| `EmergencyLog.smsStatus` | ❌ Không có | ✅ Tracking SMS delivery |
| `EmergencyLog.bystanderIp` | ❌ Không có | ✅ Ghi nhận ẩn danh |
| `AuditLog` | ❌ Không có | ✅ Bảng mới hoàn toàn |

---

## 8. Indexing Strategy

| Bảng | Trường Index | Loại | Lý do |
|---|---|---|---|
| `User` | `email` | Unique | Đăng nhập, tránh trùng |
| `User` | `role` | B-tree | Filter theo vai trò |
| `Device` | `shortId` | Unique | Lookup nhanh khi quét QR |
| `Device` | `qrCode` | Unique | Lookup nhanh từ URL |
| `Device` | `medicalRecordId` | B-tree | JOIN với MedicalRecord |
| `MedicalRecord` | `guardianId` | B-tree | Dashboard Guardian |
| `MedicalRecord` | `dataFreshnessStatus` | B-tree | Cron-Job filter |
| `EmergencyLog` | `medicalRecordId` | B-tree | Lịch sử SOS của bệnh nhân |
| `EmergencyLog` | `status` | B-tree | Filter active emergencies |
| `EmergencyLog` | `createdAt` | B-tree | Sort theo thời gian |
| `AuditLog` | `userId` | B-tree | Tra cứu theo user |
| `AuditLog` | `action` | B-tree | Filter theo hành động |
| `AuditLog` | `createdAt` | B-tree | Sort theo thời gian |
