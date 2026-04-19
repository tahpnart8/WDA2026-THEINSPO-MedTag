# 01. Tổng Quan Dự Án MedTag (Project Overview)

## 1. Giới Thiệu Dự Án

**MedTag** là một nền tảng web dịch vụ y tế khẩn cấp (**Emergency Medical Information Platform**) thuộc loại hình **Health-Tech SaaS (Software as a Service)**, kết hợp giữa:
- **mHealth (Mobile Health)** – truy cập tức thì qua QR trên thiết bị đeo/thẻ
- **PHR (Personal Health Record)** – quản lý hồ sơ sức khỏe cá nhân bởi người giám hộ
- **EHR Gateway (Electronic Health Record)** – cổng truy cập dữ liệu y tế đặc quyền cho bác sĩ

### Phân Loại Dịch Vụ Web
| Tiêu chí | Phân loại |
|---|---|
| **Loại ứng dụng** | Progressive Web App (PWA) – Zero Download |
| **Mô hình kinh doanh** | Freemium SaaS (Cá nhân miễn phí, Doanh nghiệp/BV trả phí) |
| **Lĩnh vực** | Health Information Technology (Health IT) |
| **Đối tượng phục vụ** | B2C (Người dùng cá nhân) + B2B (Bệnh viện, 115) |
| **Tham chiếu quốc tế** | Tương tự ICE (In Case of Emergency), Apple Medical ID, Road ID |

---

## 2. Vấn Đề Giải Quyết (Problem Statement)

### Bối cảnh thực tế
Khi một nạn nhân gặp tai nạn hoặc đột quỵ tại nơi công cộng:
1. **Người đi đường** không biết nhóm máu, dị ứng thuốc của nạn nhân → sơ cứu sai có thể gây tử vong.
2. **Bác sĩ cấp cứu 115** mất thời gian quý giá (thời gian vàng) để tìm kiếm tiền sử bệnh án.
3. **Người thân** không biết tai nạn đã xảy ra → mất liên lạc trong giai đoạn quan trọng.

### Giải pháp MedTag
Mỗi bệnh nhân đeo một **thiết bị vật lý** (vòng tay/thẻ/mặt dây chuyền) có in **mã QR + Mã ID ngắn**. Bất kỳ ai cũng có thể quét mã để:
- **Xem ngay** nhóm máu, dị ứng, bệnh nền nguy hiểm (KHÔNG cần tải app).
- **Kích hoạt SOS** gửi tọa độ GPS + thông báo về cho người thân.
- **Bác sĩ** có thể đăng nhập để xem toàn bộ hồ sơ y tế mã hóa chuyên sâu.

---

## 3. Stakeholders (Các Bên Liên Quan)

| Vai trò | Mô tả | Phân hệ sử dụng |
|---|---|---|
| **Bystander** (Người đi đường) | Phát hiện nạn nhân, quét QR, xem info cơ bản, bấm SOS | Public Gateway |
| **Patient** (Bệnh nhân/Nạn nhân) | Người đeo thiết bị MedTag, sở hữu hồ sơ y tế | Đối tượng thụ động |
| **Guardian** (Người giám hộ) | Quản lý thiết bị, cập nhật hồ sơ y tế cho bệnh nhân | Management Portal |
| **Doctor** (Bác sĩ / Nhân viên y tế) | Truy cập toàn bộ bệnh án mã hóa để điều trị | Secure Medical Vault |
| **Admin** (Quản trị viên hệ thống) | Quản lý toàn bộ hệ thống, người dùng, thiết bị | Admin Panel |

---

## 4. Danh Sách Tính Năng Chính (Feature List)

### 4.1. Phân hệ 1: Public Gateway (Cổng Cấp Cứu Công Khai)
| # | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| F1.1 | Quét QR / Nhập ShortID | Truy cập hồ sơ qua mã QR hoặc mã 6 ký tự dự phòng | **P0** |
| F1.2 | Anti-Spam Gate | Cổng rào chắn "Nhấn giữ 2 giây" chống bot cào dữ liệu | **P0** |
| F1.3 | Visual Double Check | Hiển thị ảnh chân dung lớn để đối chiếu khuôn mặt | **P0** |
| F1.4 | Cognitive Load Trimming | UI 3 khối màu: Nhóm máu (Đen), Dị ứng (Đỏ), Bệnh nền (Vàng) | **P0** |
| F1.5 | SOS 15s Countdown | Nút Cấp Cứu với đếm ngược 15 giây, cho phép hủy | **P0** |
| F1.6 | GPS Capture | Tự động lấy tọa độ GPS khi SOS được xác nhận | **P0** |
| F1.7 | Emergency Notification | Gửi SMS/Push kèm link Google Maps tới người giám hộ | **P1** |
| F1.8 | PWA Offline Fallback | Service Worker cache dữ liệu, hiển thị Skeleton khi mất mạng | **P1** |

### 4.2. Phân hệ 2: Secure Medical Vault (Cổng Y Tế Đặc Quyền)
| # | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| F2.1 | Doctor Authentication | Đăng nhập bằng chứng chỉ hành nghề / SSO VNeID (Mock MVP) | **P0** |
| F2.2 | AES-256 Decryption | Giải mã dữ liệu nhạy cảm tại RAM server, trả về cho bác sĩ | **P0** |
| F2.3 | Full Medical Record View | Hiển thị toàn bộ: Tiền sử bệnh, thuốc đang dùng, chống chỉ định | **P0** |
| F2.4 | Data Freshness Flag | Cờ cảnh báo Cam/Đỏ nếu dữ liệu quá hạn xác nhận 6 tháng | **P1** |
| F2.5 | Audit Trail | Ghi log ai truy cập hồ sơ bệnh nhân, khi nào, từ đâu | **P2** |

### 4.3. Phân hệ 3: Management Portal (Cổng Quản Trị)
| # | Tính năng | Mô tả | Ưu tiên |
|---|---|---|---|
| F3.1 | Guardian Login | Đăng nhập Email/Password + OTP | **P0** |
| F3.2 | Patient Profile CRUD | Thêm/Sửa/Xóa hồ sơ bệnh nhân (nhóm máu, dị ứng, bệnh nền...) | **P0** |
| F3.3 | Device Linking | Ánh xạ mã QR vật lý với hồ sơ y tế tương ứng | **P0** |
| F3.4 | Avatar Upload | Tải lên ảnh chân dung bệnh nhân cho Visual Double Check | **P0** |
| F3.5 | Data Freshness Reminder | Nhắc nhở mỗi 6 tháng xác nhận dữ liệu còn đúng | **P1** |
| F3.6 | Emergency History | Xem lịch sử các lần SOS đã được kích hoạt | **P1** |
| F3.7 | Multi-Patient Management | Quản lý nhiều hồ sơ bệnh nhân (VD: Ông, Bà, Con) | **P0** |
| F3.8 | SOS Cancel Override | Nhận Push Notification khi ai đó quét mã, hủy SOS trong 15 giây | **P1** |

---

## 5. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

| Yêu cầu | Mô tả | Chỉ tiêu |
|---|---|---|
| **Performance** | Tải trang Public Gateway nhanh (thời gian vàng cấp cứu) | < 1 giây (có cache) |
| **Scalability** | Chịu tải cao khi nhiều người cùng quét một mã tại hiện trường | Redis cache, CDN |
| **Security** | Bảo vệ dữ liệu y tế nhạy cảm (HIPAA-inspired) | AES-256, JWT, HTTPS |
| **Availability** | Hoạt động ổn định 24/7, hỗ trợ offline | PWA, Service Worker |
| **Accessibility** | Giao diện tối ưu cho tình huống stress, ánh sáng yếu | Font to, Màu tương phản cao |
| **Privacy** | Phân lớp dữ liệu Public vs Encrypted | Zero-Trust Architecture |
| **Usability** | Zero-download, hoạt động trên mọi smartphone có camera | Responsive, Mobile-first |

---

## 6. Tech Stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR/SSG tối ưu SEO, App Router chuẩn mới |
| **Styling** | Tailwind CSS | Rapid prototyping, responsive utilities |
| **Backend** | NestJS (Node.js) | Kiến trúc Module/Controller/Service rõ ràng, TypeScript native |
| **Database** | PostgreSQL (Supabase) | Ổn định, ACID, phù hợp lưu trữ y tế |
| **ORM** | Prisma | Type-safe, migration tự động, dev experience tốt |
| **Cache** | Redis (Upstash) | In-memory cache cho Emergency API tốc độ cao |
| **Auth** | JWT + bcrypt | Stateless auth, dễ scale |
| **Encryption** | AES-256-CBC | Mã hóa đầu cuối cho dữ liệu y tế nhạy cảm |
| **SMS/Push** | Twilio (hoặc Mock) | Gửi notification cho Guardian khi SOS |
| **Hosting** | Vercel (FE) + Render (BE) | Free tier, CI/CD tích hợp Git |
| **PWA** | next-pwa | Service Worker cho offline fallback |
