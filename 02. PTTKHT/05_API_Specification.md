# 05. Đặc Tả API (API Specification)

## 1. Tổng Quan API

| Prefix | Module | Auth | Mô tả |
|---|---|---|---|
| `/api/emergency/*` | Emergency | ❌ Không cần | Cổng cấp cứu công khai (tốc độ cao) |
| `/api/auth/*` | Auth | ❌ Không cần | Đăng ký / Đăng nhập |
| `/api/portal/*` | Portal | 🔒 JWT Guardian | Dashboard quản trị Guardian |
| `/api/medical/*` | Medical | 🔒 JWT Doctor | Cổng y tế đặc quyền |
| `/api/admin/*` | Admin | 🔒 JWT Admin | Quản trị hệ thống (P2) |

**Base URL:** `https://api.medtag.vn` (Production) / `http://localhost:3001` (Dev)

---

## 2. Module Emergency – Cổng Cấp Cứu Công Khai

### 2.1. GET `/api/emergency/:shortId`
> Truy xuất thông tin cấp cứu công khai qua mã QR/ShortID.

**Parameters:**
| Tên | Vị trí | Kiểu | Mô tả |
|---|---|---|---|
| `shortId` | Path | string | Mã ID ngắn 6 ký tự (VD: X7K9A2) |

**Response 200:**
```json
{
  "deviceId": "uuid-device",
  "patientName": "Nguyễn Văn A",
  "dateOfBirth": "1965-03-15",
  "gender": "MALE",
  "avatarUrl": "https://storage.medtag.vn/avatars/uuid.webp",
  "bloodType": "O_POSITIVE",
  "bloodTypeDisplay": "O+",
  "allergies": ["Penicillin", "Đậu phộng"],
  "dangerousConditions": ["Nhồi máu cơ tim", "Huyết áp cao"],
  "emergencyContact": {
    "name": "Trần Văn Vợ",
    "phone": "0901234567"
  },
  "dataFreshness": "FRESH",
  "lastConfirmed": "2026-01-15T10:00:00Z"
}
```

**Response 404:**
```json
{
  "statusCode": 404,
  "message": "Mã thiết bị không hợp lệ hoặc đã hết hạn.",
  "error": "Not Found"
}
```

**Caching Strategy:**
- Redis cache key: `emergency:public:{shortId}`
- TTL: 300 giây (5 phút)
- Invalidate khi Guardian update MedicalRecord

---

### 2.2. POST `/api/emergency/:shortId/sos`
> Kích hoạt SOS cấp cứu, lưu tọa độ GPS, gửi SMS cho Guardian.

**Parameters:**
| Tên | Vị trí | Kiểu | Mô tả |
|---|---|---|---|
| `shortId` | Path | string | Mã ID ngắn |

**Request Body:**
```json
{
  "latitude": 10.776889,
  "longitude": 106.700806
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã phát tín hiệu cấp cứu và lưu tọa độ.",
  "logId": "uuid-emergency-log",
  "smsStatus": "SENT",
  "mapsUrl": "https://maps.google.com/?q=10.776889,106.700806"
}
```

**Side Effects:**
1. Tạo bản ghi `EmergencyLog` (status: TRIGGERED).
2. Gọi Twilio API gửi SMS tới `guardian.phoneNumber`.
3. Ghi `AuditLog` (action: TRIGGER_SOS).

---

### 2.3. POST `/api/emergency/:shortId/cancel`
> Hủy SOS trong giai đoạn đếm ngược (trước khi bị confirm).

**Request Body:**
```json
{
  "logId": "uuid-emergency-log"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Đã hủy tín hiệu cấp cứu.",
  "status": "CANCELLED"
}
```

---

## 3. Module Auth – Xác Thực

### 3.1. POST `/api/auth/register`
> Đăng ký tài khoản Guardian mới.

**Request Body:**
```json
{
  "email": "nguoithan@medtag.vn",
  "password": "securePassword123",
  "fullName": "Trần Văn Vợ",
  "phoneNumber": "0901234567"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "nguoithan@medtag.vn",
    "fullName": "Trần Văn Vợ",
    "role": "GUARDIAN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Validation Rules:**
- `email`: Format email hợp lệ, unique
- `password`: Tối thiểu 8 ký tự, có chữ hoa + số
- `fullName`: 2-100 ký tự
- `phoneNumber`: Format VN (09x, 08x, 07x, 03x, 05x)

---

### 3.2. POST `/api/auth/login`
> Đăng nhập (Guardian hoặc Doctor).

**Request Body:**
```json
{
  "email": "nguoithan@medtag.vn",
  "password": "securePassword123"
}
```

**Response 200:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "nguoithan@medtag.vn",
    "fullName": "Trần Văn Vợ",
    "role": "GUARDIAN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**JWT Payload:**
```json
{
  "sub": "user-uuid",
  "email": "nguoithan@medtag.vn",
  "role": "GUARDIAN",
  "iat": 1713571200,
  "exp": 1713657600
}
```

**Response 401:**
```json
{
  "statusCode": 401,
  "message": "Email hoặc mật khẩu không đúng.",
  "error": "Unauthorized"
}
```

---

### 3.3. GET `/api/auth/me`
> Lấy thông tin user hiện tại từ JWT token.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
  "id": "uuid",
  "email": "nguoithan@medtag.vn",
  "fullName": "Trần Văn Vợ",
  "role": "GUARDIAN",
  "phoneNumber": "0901234567",
  "avatarUrl": null,
  "createdAt": "2026-04-19T10:00:00Z"
}
```

---

## 4. Module Portal – Dashboard Guardian

> Tất cả endpoint yêu cầu Header: `Authorization: Bearer {guardian_token}`

### 4.1. GET `/api/portal/medical-records`
> Lấy danh sách hồ sơ bệnh nhân của Guardian.

**Response 200:**
```json
{
  "records": [
    {
      "id": "uuid-record-1",
      "patientName": "Nguyễn Văn Ông",
      "dateOfBirth": "1955-06-20",
      "gender": "MALE",
      "bloodType": "O_POSITIVE",
      "avatarUrl": "https://...",
      "dataFreshnessStatus": "FRESH",
      "devicesCount": 2,
      "emergencyLogsCount": 3,
      "updatedAt": "2026-03-15T08:00:00Z"
    },
    {
      "id": "uuid-record-2",
      "patientName": "Nguyễn Thị Bà",
      "dateOfBirth": "1958-12-05",
      "gender": "FEMALE",
      "bloodType": "AB_NEGATIVE",
      "avatarUrl": "https://...",
      "dataFreshnessStatus": "STALE",
      "devicesCount": 1,
      "emergencyLogsCount": 0,
      "updatedAt": "2025-08-01T10:00:00Z"
    }
  ],
  "total": 2
}
```

---

### 4.2. POST `/api/portal/medical-records`
> Tạo hồ sơ bệnh nhân mới.

**Request Body:**
```json
{
  "patientName": "Nguyễn Văn Ông",
  "dateOfBirth": "1955-06-20",
  "gender": "MALE",
  "bloodType": "O_POSITIVE",
  "allergies": ["Penicillin", "Đậu phộng"],
  "dangerousConditions": ["Nhồi máu cơ tim"],
  "emergencyPhone": "0901234567",
  "emergencyContactName": "Trần Văn Vợ",
  "detailedMedicalData": {
    "medicalHistory": { ... },
    "currentMedications": [ ... ],
    "clinicalContraindications": [ ... ],
    "recentLabResults": [ ... ],
    "vaccinationHistory": [ ... ],
    "insuranceInfo": { ... }
  }
}
```

**Backend Processing:**
1. Lưu `bloodType`, `allergies`, `dangerousConditions` → plaintext.
2. `JSON.stringify(detailedMedicalData)` → `CryptoService.encrypt()` → lưu vào `encryptedMedicalData`.

**Response 201:**
```json
{
  "success": true,
  "record": { "id": "uuid-new", "patientName": "...", ... }
}
```

---

### 4.3. PUT `/api/portal/medical-records/:id`
> Cập nhật hồ sơ bệnh nhân.

**Request Body:** Tương tự POST, chỉ gửi field cần update (partial update).

---

### 4.4. DELETE `/api/portal/medical-records/:id`
> Soft delete hồ sơ bệnh nhân (đánh dấu isActive = false).

---

### 4.5. POST `/api/portal/medical-records/:id/confirm-freshness`
> Guardian xác nhận dữ liệu vẫn đúng (reset Data Freshness).

**Response 200:**
```json
{
  "success": true,
  "dataFreshnessStatus": "FRESH",
  "confirmedAt": "2026-04-19T22:00:00Z"
}
```

---

### 4.6. GET `/api/portal/devices`
> Lấy danh sách thiết bị của Guardian.

**Query Parameters:**
| Tên | Kiểu | Mô tả |
|---|---|---|
| `medicalRecordId` | string? | Filter theo hồ sơ |

---

### 4.7. POST `/api/portal/devices`
> Liên kết thiết bị mới với hồ sơ.

**Request Body:**
```json
{
  "shortId": "X7K9A2",
  "qrCode": "https://medtag.vn/e/X7K9A2",
  "medicalRecordId": "uuid-record",
  "label": "Vòng tay Ông"
}
```

---

### 4.8. DELETE `/api/portal/devices/:id`
> Hủy liên kết thiết bị khỏi hồ sơ.

---

### 4.9. GET `/api/portal/emergency-logs`
> Lấy lịch sử các lần kích hoạt SOS.

**Query Parameters:**
| Tên | Kiểu | Mô tả |
|---|---|---|
| `medicalRecordId` | string? | Filter theo hồ sơ |
| `status` | EmergencyStatus? | Filter theo trạng thái |
| `page` | number | Trang (default: 1) |
| `limit` | number | Số record/trang (default: 20) |

---

### 4.10. POST `/api/portal/upload-avatar`
> Upload ảnh chân dung bệnh nhân.

**Request:** `multipart/form-data`
| Field | Kiểu | Mô tả |
|---|---|---|
| `avatar` | File | Ảnh JPEG/PNG/WebP, max 5MB |
| `medicalRecordId` | string | ID hồ sơ |

**Response 200:**
```json
{
  "success": true,
  "avatarUrl": "https://storage.medtag.vn/avatars/uuid.webp"
}
```

---

## 5. Module Medical – Cổng Y Tế Đặc Quyền

> Tất cả endpoint yêu cầu Header: `Authorization: Bearer {doctor_token}`

### 5.1. GET `/api/medical/:shortId`
> Giải mã và trả về toàn bộ hồ sơ bệnh án (Public + Encrypted).

**Response 200:**
```json
{
  "publicData": {
    "patientName": "Nguyễn Văn A",
    "dateOfBirth": "1965-03-15",
    "gender": "MALE",
    "bloodType": "O_POSITIVE",
    "allergies": ["Penicillin", "Đậu phộng"],
    "dangerousConditions": ["Nhồi máu cơ tim", "Huyết áp cao"],
    "avatarUrl": "https://...",
    "emergencyContact": { "name": "Trần Văn Vợ", "phone": "0901234567" }
  },
  "decryptedMedicalData": {
    "medicalHistory": {
      "chronicDiseases": [ ... ],
      "pastSurgeries": [ ... ],
      "familyHistory": "..."
    },
    "currentMedications": [ ... ],
    "clinicalContraindications": [ ... ],
    "recentLabResults": [ ... ],
    "vaccinationHistory": [ ... ],
    "insuranceInfo": { ... }
  },
  "dataFreshness": {
    "status": "FRESH",
    "lastConfirmedAt": "2026-01-15T10:00:00Z",
    "daysSinceConfirmed": 94
  },
  "accessedAt": "2026-04-19T22:30:00Z"
}
```

**Side Effects:** Ghi `AuditLog` (action: VIEW_MEDICAL_RECORD).

---

## 6. Error Response Format (Chuẩn chung)

```json
{
  "statusCode": 400,
  "message": "Mô tả lỗi chi tiết bằng tiếng Việt.",
  "error": "Bad Request",
  "details": [
    { "field": "email", "message": "Email không hợp lệ." }
  ]
}
```

| HTTP Code | Ý nghĩa |
|---|---|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Dữ liệu đầu vào không hợp lệ |
| `401` | Chưa đăng nhập / Token hết hạn |
| `403` | Không có quyền truy cập |
| `404` | Không tìm thấy tài nguyên |
| `409` | Xung đột (VD: QR đã được liên kết) |
| `500` | Lỗi server nội bộ |

---

## 7. Rate Limiting

| Module | Giới hạn | Lý do |
|---|---|---|
| Emergency GET | 60 req/phút/IP | Chống DDoS nhưng cho phép nhiều người quét |
| Emergency SOS | 3 req/phút/IP | Ngăn spam SOS |
| Auth Login | 5 req/phút/IP | Chống brute force |
| Portal CRUD | 30 req/phút/Token | Sử dụng bình thường |
| Medical GET | 10 req/phút/Token | Giới hạn truy cập dữ liệu nhạy cảm |
