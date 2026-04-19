# Hành Trình Người Dùng & Kiến Trúc Tổng Thể MedTag (Vòng 2)

Tài liệu này chuẩn hóa luồng hoạt động của hệ thống MedTag dựa trên Báo cáo Vòng 1 của đội THE INSPO. Hệ thống được chia làm 3 phân hệ cách ly riêng biệt.

---

## 1. Hành Trình Người Dùng (User Journey)

### 1.1. Luồng 1: Người hỗ trợ tại hiện trường (Bystander) - Phân hệ Public Gateway
**Tình huống:** Nạn nhân gặp tai nạn/đột quỵ. Người đi đường phát hiện và có smartphone.

*   **Bước 1: Quét mã QR / Nhập ID ngắn**
    *   Bystander dùng Camera điện thoại quét mã QR trên vòng tay/thẻ của nạn nhân.
    *   *(Trường hợp ngoại lệ):* Nếu mã QR bị xước nặng (vượt quá 30% dung sai), Bystander truy cập trang chủ hệ thống và nhập **Mã ID Ngắn** (VD: X7K9A2) in dưới mã QR.
*   **Bước 2: Cổng Rào Chắn (Anti-Spam Target Gate)**
    *   Trình duyệt bật lên, hiển thị màn hình yêu cầu thao tác vật lý (VD: Vuốt để mở khóa, Nhấn giữ 2 giây).
    *   *Mục đích:* Ngăn chặn bot tự động quét và cào dữ liệu hàng loạt.
*   **Bước 3: Visual Double Check (Đối soát sinh trắc thị giác)**
    *   Hệ thống tải xong (dưới 1 giây). Hiển thị **Ảnh chân dung tỷ lệ lớn** của nạn nhân.
    *   Bystander nhìn ảnh trên điện thoại và so sánh với khuôn mặt nạn nhân thực tế để đảm bảo không cứu nhầm người (trường hợp mượn áo, đeo nhầm vòng).
*   **Bước 4: Trích xuất thông tin Tải lượng nhận thức tối ưu (Cognitive Load Trimming)**
    *   Màn hình hiển thị 3 khối màu khổng lồ, bỏ qua mọi chữ nghĩa rườm rà:
        *   **Khối Đen:** Chỉ chứa ký tự Nhóm máu.
        *   **Khối Đỏ:** Chứa tác nhân Dị ứng thuốc.
        *   **Khối Vàng/Cam:** Cảnh báo Bệnh nền nguy hiểm (tóm tắt).
*   **Bước 5: Kích hoạt Nút Cấp Cứu (Intervention Trigger)**
    *   Bystander bấm "SOS Cấp Cứu".
    *   Hệ thống đếm ngược **15 giây**. Trong lúc này, một Push Notification/SMS được gửi về điện thoại chủ tài khoản (nạn nhân).
    *   Nếu nạn nhân bị quét lén, họ có 15 giây để lấy điện thoại hủy lệnh.
    *   Sau 15 giây (nếu không hủy do hôn mê thật), hệ thống chính thức bắt tọa độ GPS (Geolocation) và lưu vào `EmergencyLog`, đồng thời gửi SMS/Map link về cho số điện thoại Người giám hộ.

### 1.2. Luồng 2: Bác Sĩ / Nhân viên Y tế 115 - Phân hệ Secure Medical Vault
**Tình huống:** Nạn nhân đã lên xe cấp cứu hoặc đến bệnh viện. Bác sĩ cần xem toàn bộ hồ sơ chuyên sâu để ra phác đồ điều trị.

*   **Bước 1: Quét mã QR (tương tự Luồng 1)**
    *   Bác sĩ quét mã, hệ thống hiện thông tin Public (giống Bystander).
*   **Bước 2: Xác thực Đặc Quyền (Zero-Trust Authentication)**
    *   Bác sĩ bấm vào nút "Đăng nhập Y Tế Đặc Quyền".
    *   Hệ thống yêu cầu đăng nhập bằng chứng chỉ hành nghề hoặc SSO VNeID (Trong phạm vi MVP Vòng 2, ta sẽ Mock luồng đăng nhập này).
*   **Bước 3: Giải mã AES-256 Đầu cuối**
    *   Sau khi xác thực thành công, Frontend gửi Token xuống Backend yêu cầu truy cập dữ liệu nhạy cảm.
    *   Backend lấy dữ liệu từ DB (đang bị mã hóa chuỗi vô nghĩa), dùng chìa khóa AES-256 giải mã ngay tại RAM máy chủ.
    *   Gửi toàn bộ chi tiết: Lịch sử dùng thuốc, bệnh mạn tính chuyên sâu, chống chỉ định lâm sàng về lại cho Bác sĩ.

### 1.3. Luồng 3: Người Giám Hộ (Admin Cá nhân) - Phân hệ Management Portal
**Tình huống:** Người thân quản lý thiết bị và cập nhật bệnh án cho ông bà/con cái.

*   **Bước 1: Đăng nhập Management Portal**
    *   Đăng nhập bằng Email/Password hoặc OTP.
*   **Bước 2: Quản lý thiết bị & Hồ sơ (CRUD)**
    *   Cập nhật bệnh án (Nhóm máu, Dị ứng, Bệnh nền, Ảnh khuôn mặt).
    *   Ánh xạ/Liên kết mã thiết bị QR vật lý với Hồ sơ y tế tương ứng (VD: Thẻ số 1 liên kết cho Ông, Thẻ số 2 liên kết cho Bà).
*   **Bước 3: Cron-Job Data Expire (Thẩm định độ mới dữ liệu ngầm)**
    *   Hệ thống tự động nhắc nhở Giám hộ mỗi 6 tháng phải click "Xác nhận dữ liệu vẫn đúng".
    *   Nếu để quá hạn, màn hình của Bác sĩ ở Luồng 2 sẽ hiện cảnh báo Cờ Cam/Đỏ về "Độ tin cậy của dữ liệu".

---

## 2. Kiến Trúc Hệ Thống Đề Xuất (Tái cấu trúc)

Để đảm bảo đáp ứng được các luồng trên một cách mượt mà và an toàn, chúng ta sẽ dỡ bỏ bản thử nghiệm cũ và xây lại chuẩn kiến trúc Monorepo như sau:

**Frontend (Next.js / App Router / Tailwind CSS)**
*   `src/app/page.tsx`: Trang chủ (Dành cho Bystander nhập Mã ID Ngắn).
*   `src/app/e/[shortId]/page.tsx`: Trang cấp cứu Public (Luồng 1).
*   `src/app/medical/login/page.tsx`: Cổng đăng nhập cho Bác sĩ.
*   `src/app/medical/[shortId]/page.tsx`: Trang hồ sơ chuyên sâu (Zero-Trust) cho Bác sĩ (Luồng 2).
*   `src/app/portal/*`: Dashboard quản trị cho Người Giám hộ (Luồng 3).
*   `src/components/emergency/AntiSpamGate.tsx`
*   `src/components/emergency/SOSButton.tsx`

**Backend (NestJS / Prisma / PostgreSQL / Redis)**
*   `Module Auth`: Xử lý JWT Token cho Giám hộ và Bác sĩ.
*   `Module Crypto`: Xử lý thuật toán mã hóa/giải mã AES-256.
*   `Module Emergency`: API phục vụ luồng Public (Không cần Token, kết hợp Redis Cache để chịu tải cao).
*   `Module Medical`: API phục vụ Bác sĩ (Yêu cầu Token Bác sĩ, gọi hàm Crypto để giải mã).
*   `Module Portal`: API phục vụ Giám hộ (Yêu cầu Token Giám hộ, CRUD dữ liệu).

**Database (Prisma Schema)**
Cần tái cấu trúc lại Schema để phân biệt rõ trường dữ liệu Public (`bloodType`, `allergies`) và trường dữ liệu nhạy cảm (`encryptedMedicalData`).

---
**Tóm tắt:** Hành trình trên bao phủ 100% các Use Case từ lúc tai nạn xảy ra (Offline, Rào chắn, Nút SOS) cho đến lúc vào bệnh viện (Giải mã y tế). 
