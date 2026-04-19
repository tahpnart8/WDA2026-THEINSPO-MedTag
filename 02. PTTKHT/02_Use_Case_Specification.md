# 02. Đặc Tả Use Case (Use Case Specification)

## 1. Sơ Đồ Use Case Tổng Quát

```
┌─────────────────────────────────────────────────────────────────┐
│                     HỆ THỐNG MEDTAG                             │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │  PUBLIC GATEWAY      │  │  MANAGEMENT PORTAL               │ │
│  │                      │  │                                  │ │
│  │  ○ UC-01: Quét QR    │  │  ○ UC-06: Đăng nhập Guardian     │ │
│  │  ○ UC-02: AntiSpam   │  │  ○ UC-07: CRUD Hồ sơ bệnh nhân   │ │
│  │  ○ UC-03: Xem info   │  │  ○ UC-08: Liên kết thiết bị QR   │ │
│  │  ○ UC-04: Bấm SOS    │  │  ○ UC-09: Upload ảnh chân dung   │ │
│  │  ○ UC-05: Nhận thông │  │  ○ UC-10: Xem lịch sử SOS        │ │
│  │          báo (Guard.)│  │  ○ UC-11: Xác nhận dữ liệu       │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SECURE MEDICAL VAULT                                    │   │
│  │                                                          │   │
│  │  ○ UC-12: Đăng nhập Bác sĩ (SSO VNeID Mock)              │   │
│  │  ○ UC-13: Giải mã & xem toàn bộ bệnh án                  │   │
│  │  ○ UC-14: Kiểm tra Data Freshness Flag                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Actors:
  👤 Bystander ──── UC-01 → UC-04
  👨‍⚕️ Doctor    ──── UC-01 → UC-03, UC-12 → UC-14
  👪 Guardian   ──── UC-05 → UC-11
  🤖 System     ──── UC-05 (Auto-Trigger), UC-11 (Cron-Job)
```

---

## 2. Đặc Tả Chi Tiết Từng Use Case

### UC-01: Quét mã QR / Nhập ShortID

| Trường | Mô tả |
|---|---|
| **Tên** | Quét mã QR hoặc Nhập mã ID ngắn |
| **Actor** | Bystander, Doctor |
| **Precondition** | Nạn nhân đeo thiết bị MedTag có mã QR còn hoạt động |
| **Postcondition** | Hệ thống chuyển hướng đến trang cấp cứu `/e/[shortId]` |

**Luồng chính (Main Flow):**
1. Actor dùng camera quét mã QR trên thiết bị nạn nhân.
2. Camera nhận diện URL dạng: `https://medtag.vn/e/X7K9A2`.
3. Trình duyệt mở trang tương ứng.

**Luồng phụ (Alternate Flow):**
- **A1 – QR bị xước > 30%:** Actor truy cập `https://medtag.vn`, nhập Mã ID ngắn 6 ký tự (in dưới QR), bấm "TRUY XUẤT HỒ SƠ". Hệ thống redirect tới `/e/[shortId]`.

**Luồng ngoại lệ (Exception Flow):**
- **E1 – Mã không tồn tại:** Hệ thống trả về HTTP 404 + thông báo "Mã thiết bị không hợp lệ hoặc đã hết hạn."
- **E2 – Thiết bị bị vô hiệu hóa:** `device.isActive = false` → trả về lỗi tương tự E1.

---

### UC-02: Xác minh Anti-Spam Gate

| Trường | Mô tả |
|---|---|
| **Tên** | Cổng Rào Chắn Chống Spam |
| **Actor** | Bystander, Doctor |
| **Precondition** | Đã truy cập trang `/e/[shortId]` thành công |
| **Postcondition** | isVerified = true, hệ thống bắt đầu tải dữ liệu y tế |

**Luồng chính:**
1. Hệ thống hiển thị modal overlay với nút "Nhấn giữ để mở khóa".
2. Actor nhấn và giữ nút trong ~2 giây.
3. Thanh progress bar tăng dần từ 0% → 100%.
4. Khi đạt 100%, modal hiển thị "Đã xác minh!" → tự đóng sau 200ms.
5. Hệ thống bắt đầu fetch dữ liệu bệnh nhân từ API.

**Luồng ngoại lệ:**
- **E1 – Thả tay sớm (< 100%):** Progress bar reset về 0%, Actor phải thực hiện lại.
- **E2 – Bot tự động:** Không thể giữ pointer event → bị chặn.

---

### UC-03: Xem Thông Tin Y Tế Công Khai

| Trường | Mô tả |
|---|---|
| **Tên** | Trích xuất thông tin Cognitive Load Trimming |
| **Actor** | Bystander, Doctor |
| **Precondition** | AntiSpam Gate đã passed, API trả dữ liệu thành công |
| **Postcondition** | Hiển thị đầy đủ 4 khối thông tin cấp cứu |

**Luồng chính:**
1. **Visual Double Check:** Ảnh chân dung lớn (192x192px) để đối chiếu khuôn mặt.
2. **Green Box:** Tên bệnh nhân + Giới tính + Tuổi + Số điện thoại người thân.
3. **Black Box:** Nhóm máu (font cực to, 60px).
4. **Red Box:** Danh sách dị ứng thuốc.
5. **Yellow/Amber Box:** Bệnh nền nguy hiểm (⚠️ icon cảnh báo).

**Dữ liệu API trả về (Public – không cần token):**
```json
{
  "deviceId": "uuid",
  "patientName": "Nguyễn Văn A",
  "avatarUrl": "https://...",
  "bloodType": "O+",
  "allergies": "Penicillin, Đậu phộng",
  "dangerousConditions": "Nhồi máu cơ tim, Huyết áp cao",
  "emergencyContact": "0901 234 567 (Trần Văn Vợ)"
}
```

---

### UC-04: Kích Hoạt SOS Cấp Cứu

| Trường | Mô tả |
|---|---|
| **Tên** | Nút SOS với đếm ngược 15 giây |
| **Actor** | Bystander |
| **Precondition** | Đã xem được thông tin bệnh nhân (UC-03) |
| **Postcondition** | EmergencyLog được tạo, SMS/Push gửi cho Guardian |

**Luồng chính:**
1. Bystander bấm nút "🆘 CẤP CỨU" lớn.
2. Hệ thống chuyển sang màn hình đếm ngược 15 giây (progressive circle).
3. Đồng thời, hệ thống gửi Push Notification tới điện thoại bệnh nhân (UC-05).
4. Sau 15 giây, nếu không bị hủy:
   a. Browser yêu cầu quyền GPS (`navigator.geolocation`).
   b. Gửi `POST /api/emergency/:qrCode/sos` kèm `{ latitude, longitude }`.
   c. Backend tạo bản ghi `EmergencyLog` (status: TRIGGERED).
   d. Backend gọi Twilio API gửi SMS kèm link Google Maps tới Guardian.
5. Hiển thị "🚨 Đã phát tín hiệu!".

**Luồng phụ:**
- **A1 – Bystander hủy SOS:** Bấm "HỦY CẤP CỨU" trong 15 giây → timer reset, không gửi request.
- **A2 – Bệnh nhân tự hủy:** Bệnh nhân nhận notification, bấm hủy từ điện thoại → status đổi thành CANCELLED.

**Luồng ngoại lệ:**
- **E1 – GPS bị từ chối:** Hệ thống gửi SOS không có tọa độ (latitude/longitude = null).
- **E2 – Mất mạng:** Request được queue bởi Service Worker, gửi lại khi có mạng.

---

### UC-05: Nhận Thông Báo Khẩn Cấp (Guardian)

| Trường | Mô tả |
|---|---|
| **Tên** | Push Notification / SMS Cấp Cứu |
| **Actor** | Guardian (tự động nhận), System |
| **Trigger** | SOS được kích hoạt (UC-04) |

**Luồng chính:**
1. System gửi SMS tới `guardian.phoneNumber`.
2. Nội dung: `"[MedTag] Cấp cứu! {patientName} đã được quét tại {GPS link}. Liên hệ ngay: {SOSlogLink}"`
3. Guardian nhận SMS và có thể mở link xem vị trí trên Google Maps.

---

### UC-06: Đăng Nhập Guardian

| Trường | Mô tả |
|---|---|
| **Tên** | Đăng nhập Management Portal |
| **Actor** | Guardian |
| **Postcondition** | JWT Token được lưu vào Cookie/LocalStorage |

**Luồng chính:**
1. Guardian truy cập `/portal/login`.
2. Nhập Email + Password → `POST /api/auth/login`.
3. Backend so khớp bcrypt hash → trả về JWT Token (expiresIn: 1 ngày).
4. Frontend lưu token → redirect tới `/portal/dashboard`.

**Luồng phụ:**
- **A1 – Đăng ký mới:** Guardian truy cập `/portal/register`, nhập thông tin → `POST /api/auth/register`.
- **A2 – Quên mật khẩu:** Gửi email OTP để reset (P2).

---

### UC-07: CRUD Hồ Sơ Bệnh Nhân

| Trường | Mô tả |
|---|---|
| **Tên** | Quản lý hồ sơ y tế |
| **Actor** | Guardian |
| **Precondition** | Đã đăng nhập thành công |

**Luồng chính (Tạo mới):**
1. Guardian bấm "Thêm hồ sơ bệnh nhân".
2. Nhập: Tên bệnh nhân, Ngày sinh, Giới tính, Nhóm máu, Dị ứng, Bệnh nền, Thuốc đang dùng, Ảnh chân dung.
3. Frontend gửi `POST /api/portal/medical-records` kèm JWT.
4. Backend:
   a. Lưu dữ liệu Public (bloodType, allergies, dangerousConditions) ở dạng plaintext.
   b. Mã hóa AES-256 dữ liệu nhạy cảm (tiền sử bệnh chi tiết, đơn thuốc) → `encryptedMedicalData`.
5. Trả về hồ sơ vừa tạo.

**Các thao tác CRUD khác:**
- **Read:** `GET /api/portal/medical-records` – Liệt kê tất cả hồ sơ của Guardian.
- **Update:** `PUT /api/portal/medical-records/:id` – Cập nhật thông tin.
- **Delete:** `DELETE /api/portal/medical-records/:id` – Xóa hồ sơ (soft delete).

---

### UC-08: Liên Kết Thiết Bị QR

| Trường | Mô tả |
|---|---|
| **Tên** | Ánh xạ mã QR vật lý với hồ sơ y tế |
| **Actor** | Guardian |

**Luồng chính:**
1. Guardian chọn một hồ sơ bệnh nhân.
2. Bấm "Liên kết thiết bị".
3. Nhập Mã QR (in trên thiết bị vật lý, VD: X7K9A2) hoặc quét bằng camera.
4. `POST /api/portal/devices` kèm `{ qrCode, medicalRecordId }`.
5. Backend kiểm tra mã QR chưa được liên kết → tạo bản ghi Device.

**Luồng ngoại lệ:**
- **E1 – QR đã được liên kết:** Trả về lỗi Conflict 409.
- **E2 – Hủy liên kết:** `DELETE /api/portal/devices/:id` → ngắt kết nối thiết bị khỏi hồ sơ.

---

### UC-09: Upload Ảnh Chân Dung

| Trường | Mô tả |
|---|---|
| **Tên** | Tải lên ảnh sinh trắc thị giác |
| **Actor** | Guardian |

**Luồng chính:**
1. Guardian chọn hồ sơ → bấm "Cập nhật ảnh".
2. Chọn ảnh từ thư viện hoặc chụp trực tiếp.
3. Frontend resize ảnh (max 500x500px, WebP) → upload tới Storage.
4. `PUT /api/portal/medical-records/:id` kèm `{ avatarUrl }`.

---

### UC-10: Xem Lịch Sử SOS

| Trường | Mô tả |
|---|---|
| **Tên** | Xem danh sách các lần kích hoạt SOS |
| **Actor** | Guardian |

**Luồng chính:**
1. Guardian truy cập `/portal/emergency-history`.
2. `GET /api/portal/emergency-logs` – trả về danh sách EmergencyLog.
3. Mỗi entry hiển thị: Thời gian, Trạng thái (TRIGGERED/CANCELLED/RESOLVED), Tọa độ GPS (link Maps).

---

### UC-11: Xác Nhận Dữ Liệu Định Kỳ (Data Freshness)

| Trường | Mô tả |
|---|---|
| **Tên** | Nhắc nhở xác nhận dữ liệu 6 tháng/lần |
| **Actor** | System (Cron-Job), Guardian |

**Luồng chính:**
1. Cron-Job chạy hàng ngày, kiểm tra `medicalRecord.updatedAt`.
2. Nếu `updatedAt` > 6 tháng → đánh dấu `dataFreshnessStatus = STALE`.
3. Gửi email/push nhắc nhở Guardian: "Vui lòng xác nhận dữ liệu y tế vẫn đúng."
4. Guardian đăng nhập → xem thông tin → bấm "Xác nhận dữ liệu vẫn đúng".
5. Hệ thống cập nhật `dataFreshnessStatus = FRESH`, reset `updatedAt`.

**Tác động:**
- Nếu dữ liệu STALE → Bác sĩ ở UC-13 sẽ thấy **Cờ Cam/Đỏ** cảnh báo.

---

### UC-12: Đăng Nhập Bác Sĩ (Zero-Trust)

| Trường | Mô tả |
|---|---|
| **Tên** | Xác thực đặc quyền y tế |
| **Actor** | Doctor |
| **Precondition** | Đã xem info Public (UC-03) |

**Luồng chính (MVP – Mock):**
1. Bác sĩ bấm nút "Đăng nhập Y Tế Đặc Quyền" trên trang Public.
2. Redirect tới `/medical/login`.
3. Nhập License Number + Password (Mock login).
4. Backend xác thực → trả JWT Token với `role: DOCTOR`.
5. Redirect tới `/medical/[shortId]`.

**Luồng chính (Production – Future):**
- SSO VNeID (Xác thực chứng chỉ hành nghề quốc gia).

---

### UC-13: Xem Toàn Bộ Bệnh Án Mã Hóa

| Trường | Mô tả |
|---|---|
| **Tên** | Giải mã AES-256 & hiển thị hồ sơ chuyên sâu |
| **Actor** | Doctor |
| **Precondition** | JWT Token với role DOCTOR |

**Luồng chính:**
1. Frontend gửi `GET /api/medical/:shortId` kèm JWT Doctor.
2. Backend:
   a. Verify JWT → kiểm tra `role === DOCTOR`.
   b. Query `MedicalRecord` từ DB (bao gồm `encryptedMedicalData`).
   c. Gọi `CryptoService.decrypt()` → giải mã tại RAM.
   d. Trả về toàn bộ: thông tin Public + dữ liệu giải mã.
3. Frontend hiển thị dashboard y tế chuyên sâu:
   - Tiền sử bệnh lý
   - Danh sách thuốc đang dùng
   - Chống chỉ định lâm sàng
   - Lịch sử phẫu thuật
   - Kết quả xét nghiệm gần nhất

**Luồng ngoại lệ:**
- **E1 – Token hết hạn:** HTTP 401 → redirect login.
- **E2 – Data STALE:** Hiển thị cờ cảnh báo nhưng vẫn cho xem (informational only).

---

### UC-14: Kiểm Tra Data Freshness Flag

| Trường | Mô tả |
|---|---|
| **Tên** | Đánh giá độ tin cậy dữ liệu |
| **Actor** | Doctor |
| **Trigger** | Khi xem hồ sơ y tế (UC-13) |

**Logic Business:**
```
Nếu updatedAt < 6 tháng: 🟢 FRESH (Dữ liệu đáng tin cậy)
Nếu 6 tháng < updatedAt < 12 tháng: 🟠 STALE (Cần xác nhận lại)
Nếu updatedAt > 12 tháng: 🔴 EXPIRED (Dữ liệu có thể không chính xác)
```
