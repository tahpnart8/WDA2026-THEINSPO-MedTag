# 06. Sơ Đồ Tuần Tự (Sequence Diagrams)

## 1. Luồng 1: Bystander Quét QR → Xem Info → Bấm SOS

```
┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Bystander│  │ Camera/Browser│  │  Frontend    │  │ Backend  │  │  Redis   │  │   DB     │
│          │  │              │  │  (Next.js)   │  │ (NestJS) │  │  Cache   │  │(Postgres)│
└────┬─────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │               │                │               │              │              │
     │  Quét QR      │                │               │              │              │
     │──────────────▶│                │               │              │              │
     │               │  URL: /e/X7K9A2│               │              │              │
     │               │───────────────▶│               │              │              │
     │               │                │               │              │              │
     │               │    ┌───────────────────────┐   │              │              │
     │               │    │ AntiSpam Gate Modal   │   │              │              │
     │               │    │ "Nhấn giữ để mở khóa" │   │              │              │
     │               │    └───────────────────────┘   │              │              │
     │  Nhấn giữ 2s  │                │               │              │              │
     │──────────────────────────────▶│               │              │              │
     │               │                │ isVerified=T  │              │              │
     │               │                │               │              │              │
     │               │                │ GET /emergency/X7K9A2        │              │
     │               │                │──────────────▶│              │              │
     │               │                │               │  Cache hit?  │              │
     │               │                │               │─────────────▶│              │
     │               │                │               │              │              │
     │               │                │               │  [Cache Miss]│              │
     │               │                │               │──────────────────────────▶│
     │               │                │               │  Query Device+MedRecord   │
     │               │                │               │◀──────────────────────────│
     │               │                │               │  Set cache   │              │
     │               │                │               │─────────────▶│              │
     │               │                │               │              │              │
     │               │                │  200 OK (JSON)│              │              │
     │               │                │◀──────────────│              │              │
     │               │                │               │              │              │
     │   ┌────────────────────────────────────────┐   │              │              │
     │   │ Render UI:                              │   │              │              │
     │   │ ✅ Avatar (Visual Double Check)        │   │              │              │
     │   │ 🩸 Black Box: O+ (Nhóm máu)           │   │              │              │
     │   │ 🔴 Red Box: Penicillin (Dị ứng)       │   │              │              │
     │   │ ⚠️ Yellow Box: Nhồi máu cơ tim        │   │              │              │
     │   │ 🟢 Green Box: Liên hệ 0901234567      │   │              │              │
     │   └────────────────────────────────────────┘   │              │              │
     │               │                │               │              │              │
     │  Bấm 🆘 SOS   │                │               │              │              │
     │──────────────────────────────▶│               │              │              │
     │               │                │ Countdown 15s │              │              │
     │               │                │──────┐        │              │              │
     │               │                │      │ tick   │              │              │
     │               │                │◀─────┘        │              │              │
     │               │                │               │              │              │
     │               │                │  [15s hết, không hủy]       │              │
     │               │                │               │              │              │
     │               │  navigator.geolocation         │              │              │
     │               │◀──────────────│               │              │              │
     │               │  GPS coords   │               │              │              │
     │               │──────────────▶│               │              │              │
     │               │                │               │              │              │
     │               │                │ POST /emergency/X7K9A2/sos  │              │
     │               │                │──────────────▶│              │              │
     │               │                │               │ Create EmergencyLog        │
     │               │                │               │──────────────────────────▶│
     │               │                │               │              │              │
     │               │                │               │ Gửi SMS/Push│              │
     │               │                │               │──────▶ Twilio              │
     │               │                │               │              │              │
     │               │                │  200: "Đã phát tín hiệu!"  │              │
     │               │                │◀──────────────│              │              │
     │               │                │               │              │              │
     │   ┌────────────────────┐       │               │              │              │
     │   │ 🚨 "Đã phát tín    │       │               │              │              │
     │   │ hiệu cấp cứu!"   │       │               │              │              │
     │   └────────────────────┘       │               │              │              │
```

---

## 2. Luồng 2: Bác Sĩ Xác Thực → Giải Mã Bệnh Án

```
┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐
│  Doctor  │  │  Frontend    │  │  Backend     │  │   DB     │  │CryptoService│
│          │  │  (Next.js)   │  │  (NestJS)    │  │(Postgres)│  │ (AES-256)   │
└────┬─────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └──────┬──────┘
     │               │                │               │               │
     │  [Bác sĩ đang xem trang Public (Luồng 1)]     │               │
     │               │                │               │               │
     │  Bấm "Đăng nhập Y Tế Đặc Quyền"              │               │
     │──────────────▶│                │               │               │
     │               │  Redirect /medical/login       │               │
     │               │                │               │               │
     │  Nhập License + Password       │               │               │
     │──────────────▶│                │               │               │
     │               │ POST /auth/login               │               │
     │               │──────────────▶│               │               │
     │               │                │ Verify bcrypt │               │
     │               │                │──────────────▶│               │
     │               │                │ Check role=DOCTOR             │
     │               │                │◀──────────────│               │
     │               │                │               │               │
     │               │  200: { token, role: DOCTOR }  │               │
     │               │◀──────────────│               │               │
     │               │                │               │               │
     │               │  Save JWT → Cookie             │               │
     │               │  Redirect /medical/X7K9A2      │               │
     │               │                │               │               │
     │               │ GET /medical/X7K9A2            │               │
     │               │ Header: Bearer {doctor_token}  │               │
     │               │──────────────▶│               │               │
     │               │                │               │               │
     │               │                │  ① Verify JWT │               │
     │               │                │  ② Check role=DOCTOR          │
     │               │                │               │               │
     │               │                │  Query MedicalRecord          │
     │               │                │──────────────▶│               │
     │               │                │ Return: public + encrypted    │
     │               │                │◀──────────────│               │
     │               │                │               │               │
     │               │                │  Decrypt encryptedMedicalData │
     │               │                │──────────────────────────────▶│
     │               │                │  AES-256-CBC decrypt at RAM   │
     │               │                │◀──────────────────────────────│
     │               │                │               │               │
     │               │                │  ③ Write AuditLog             │
     │               │                │──────────────▶│               │
     │               │                │               │               │
     │               │  200: { publicData, decryptedMedicalData,      │
     │               │         dataFreshness }        │               │
     │               │◀──────────────│               │               │
     │               │                │               │               │
     │   ┌────────────────────────────────────────┐   │               │
     │   │ Medical Dashboard:                     │   │               │
     │   │ 📋 Tiền sử bệnh lý                   │   │               │
     │   │ 💊 Thuốc đang dùng                     │   │               │
     │   │ ⛔ Chống chỉ định                      │   │               │
     │   │ 🧪 Kết quả xét nghiệm                 │   │               │
     │   │ 🟢 Data Freshness: FRESH (94 ngày)     │   │               │
     │   └────────────────────────────────────────┘   │               │
```

---

## 3. Luồng 3: Guardian Quản Lý Hồ Sơ

```
┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌─────────────┐
│ Guardian │  │  Frontend    │  │  Backend     │  │   DB     │  │CryptoService│
│          │  │  (Next.js)   │  │  (NestJS)    │  │(Postgres)│  │ (AES-256)   │
└────┬─────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └──────┬──────┘
     │               │                │               │               │
     │  Truy cập /portal/login        │               │               │
     │──────────────▶│                │               │               │
     │               │                │               │               │
     │  Nhập Email + Password         │               │               │
     │──────────────▶│                │               │               │
     │               │ POST /auth/login               │               │
     │               │──────────────▶│               │               │
     │               │  200: { token, role: GUARDIAN } │               │
     │               │◀──────────────│               │               │
     │               │  Redirect /portal/dashboard    │               │
     │               │                │               │               │
     │               │ GET /portal/medical-records     │               │
     │               │ Header: Bearer {guardian_token} │               │
     │               │──────────────▶│               │               │
     │               │                │ Query WHERE guardianId=userId │
     │               │                │──────────────▶│               │
     │               │  200: [list of records]        │               │
     │               │◀──────────────│               │               │
     │               │                │               │               │
     │   ┌────────────────────────────┐               │               │
     │   │ Dashboard:                 │               │               │
     │   │ 👴 Ông – O+ – 2 devices  │               │               │
     │   │ 👵 Bà – AB- – 1 device   │               │               │
     │   └────────────────────────────┘               │               │
     │               │                │               │               │
     │  Bấm "Thêm hồ sơ"            │               │               │
     │──────────────▶│                │               │               │
     │  Điền form hồ sơ mới          │               │               │
     │──────────────▶│                │               │               │
     │               │ POST /portal/medical-records   │               │
     │               │──────────────▶│               │               │
     │               │                │ Encrypt detailedMedicalData   │
     │               │                │──────────────────────────────▶│
     │               │                │ AES-256 encrypt → ciphertext  │
     │               │                │◀──────────────────────────────│
     │               │                │               │               │
     │               │                │ INSERT MedicalRecord          │
     │               │                │──────────────▶│               │
     │               │                │               │               │
     │               │                │ Invalidate Redis cache        │
     │               │                │ DEL emergency:public:{shortId}│
     │               │                │               │               │
     │               │  201: { record }               │               │
     │               │◀──────────────│               │               │
     │               │                │               │               │
     │  Bấm "Liên kết thiết bị"      │               │               │
     │──────────────▶│                │               │               │
     │  Nhập ShortID: X7K9A2         │               │               │
     │──────────────▶│                │               │               │
     │               │ POST /portal/devices           │               │
     │               │──────────────▶│               │               │
     │               │                │ Check unique shortId          │
     │               │                │──────────────▶│               │
     │               │                │ INSERT Device                 │
     │               │                │──────────────▶│               │
     │               │  201: { device }               │               │
     │               │◀──────────────│               │               │
```

---

## 4. Luồng Phụ: Data Freshness Cron-Job

```
┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐
│ Cron-Job │  │  Backend     │  │   DB     │  │   SMS    │
│ (Daily)  │  │  (NestJS)    │  │(Postgres)│  │  Gateway │
└────┬─────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘
     │               │               │              │
     │  Trigger daily (00:00 UTC)    │              │
     │──────────────▶│               │              │
     │               │               │              │
     │               │ SELECT * FROM MedicalRecord  │
     │               │ WHERE dataConfirmedAt        │
     │               │   < NOW() - INTERVAL '6 months'
     │               │ AND dataFreshnessStatus = 'FRESH'
     │               │──────────────▶│              │
     │               │ Return: stale records        │
     │               │◀──────────────│              │
     │               │               │              │
     │               │ UPDATE SET dataFreshnessStatus = 'STALE'
     │               │──────────────▶│              │
     │               │               │              │
     │               │ For each guardian:            │
     │               │ Send reminder email/SMS       │
     │               │──────────────────────────────▶│
     │               │               │              │
     │               │ [Tương tự cho > 12 tháng → EXPIRED]
     │               │               │              │
```

---

## 5. Luồng Phụ: SOS Cancel (Bệnh nhân tự hủy)

```
┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│ Patient  │  │ Push Notif.  │  │  Backend     │  │   DB     │
│ (Nạn nhân)│  │ (on Phone)   │  │  (NestJS)    │  │(Postgres)│
└────┬─────┘  └──────┬───────┘  └──────┬───────┘  └────┬─────┘
     │               │                │               │
     │  [Ai đó quét QR và bấm SOS]   │               │
     │               │                │               │
     │  Nhận Push Notification        │               │
     │  "Ai đó đang kích hoạt SOS    │               │
     │   cho bạn. Hủy nếu bạn an toàn"│              │
     │◀──────────────│                │               │
     │               │                │               │
     │  Bấm "Hủy SOS" (trong 15s)    │               │
     │──────────────────────────────▶│               │
     │               │                │               │
     │               │  POST /emergency/:shortId/cancel│
     │               │                │──────────────▶│
     │               │                │ UPDATE EmergencyLog
     │               │                │ SET status = 'CANCELLED'
     │               │                │──────────────▶│
     │               │                │               │
     │               │  200: "Đã hủy" │               │
     │               │◀──────────────│               │
```
