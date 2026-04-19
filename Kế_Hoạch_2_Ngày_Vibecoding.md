# Kế Hoạch 2 Ngày Vibecoding & Triển Khai Dự Án MedTag

Dự án: **MedTag – Hệ thống thông tin y tế khẩn cấp**
Nhóm: **THE INSPO**
Thành viên: 5 người (3 Vibecoders, 1 UI/UX & QA, 1 PM/Architect)
Mục tiêu: Hoàn thiện sản phẩm MVP, Báo cáo kỹ thuật, Video Demo và Poster nộp thi WDA2026 Vòng 2.

---

## 🎯 Chiến Lược Phát Triển: "Chạy Tiếp Sức" (Relay Vibecoding)

Với thời gian 2 ngày, nhóm áp dụng chiến lược **Chạy tiếp sức (Relay)**. Nghĩa là tại một thời điểm, **chỉ có 1 người cầm trịch (Fullstack Vibecoder)** code cả Frontend lẫn Backend cho một cụm tính năng. Hết ca (Session), người đó commit code hoàn chỉnh, bàn giao lại ngữ cảnh (handoff) cho người tiếp theo. Cách này giúp **triệt tiêu hoàn toàn rủi ro Merge Conflict** và đảm bảo luồng suy nghĩ của AI Agent được liền mạch.

### Các Nguyên Tắc Bàn Giao (Baton Pass):
1. **Hoàn thiện mới giao:** Không giao lại code đang lỗi (compile error). Nếu hết giờ mà chưa xong, phải comment lại rõ ràng những phần AI đang làm dở.
2. **Cập nhật Context:** Người code xong phải note lại (vào file `02_Architecture_Context.md` hoặc một file nhật ký) là mình vừa làm xong cái gì, API route là gì, để người sau có ngữ cảnh đưa cho AI.

---

## 🚀 Lộ Trình Triển Khai Theo Tiến Độ Dự Án (48 Giờ)

### Giai đoạn 1: Nền Móng & Thiết Lập Hệ Thống (Giờ 0 - 10)
*Mục tiêu: Dựng xong bộ khung móng vững chắc cho cả Frontend và Backend.*
- **Khởi tạo Repo:** Setup 1 Monorepo (chứa cả thư mục `/frontend` Next.js và `/backend` NestJS) hoặc 2 repo riêng.
- **Database & Supabase:** Thiết lập PostgreSQL. Chạy migration tạo 4 bảng lõi: `Users`, `MedicalRecords`, `Devices`, `EmergencyLogs`.
- **Bảo mật cơ sở:** Cài đặt Prisma/TypeORM, setup JWT Auth và thuật toán mã hóa/giải mã AES-256 cho Backend.
- **UI Architecture:** Cài đặt TailwindCSS, cấu hình font chữ to/rõ ràng (Cognitive Load Trimming). Dựng các Component dùng chung (Button, Card, Modal).
- **Deploy lần 1:** Deploy bộ khung trắng lên Vercel và Render để test luồng CI/CD.

### Giai đoạn 2: Cổng Cấp Cứu "Thời Gian Vàng" (Giờ 10 - 22)
*Mục tiêu: Hoàn thiện màn hình Public khi người đi đường quét mã QR, bám sát các tiêu chí UX/UI và Bảo mật của hồ sơ thi WDA2026.*
- **Định tuyến QR Động & Dự phòng Mã Ngắn (Dynamic Router & Short ID):**
  - Xây dựng luồng truy cập khẩn cấp tại `app/e/[shortId]/page.tsx`.
  - Trang chủ (`/`) là ô nhập Mã ID Ngắn (Ví dụ: X7K9A2) dự phòng cho trường hợp thẻ QR vật lý bị trầy xước (Dung sai Level H 30%).
- **Cổng Rào chắn Truy cập Trái phép (Anti-Spam Target Gate):**
  - Yêu cầu người quét mã thực hiện thao tác UX vi mô (Micro-interactions) như "Vuốt/Nhấn giữ để mở khóa" nhằm phân biệt người thật và Crawling Bots, ngăn chặn cào dữ liệu hồ sơ.
- **Tối ưu Tải lượng Nhận thức (Cognitive Load Trimming):**
  - Giao diện gọt bỏ 100% text kỹ thuật rườm rà.
  - **Visual Double Check (Sinh trắc thị giác):** Avatar người bệnh to, rõ ràng để người đi đường đối chiếu khuôn mặt, loại bỏ rủi ro cấp cứu sai người (đeo nhầm thẻ/mượn đồ).
  - Thiết kế 3 khối màu khổng lồ dễ đọc nhất: **GREEN BOX** (Thông tin cá nhân & Liên hệ), **RED BOX** (Dị ứng), **BLACK BOX** (Nhóm máu).
- **Nút Cấp Cứu (SOS) & Intervention Trigger:**
  - Code vòng tròn đếm ngược 15s. Kích hoạt Push Notification/SMS cảnh báo về điện thoại chủ tài khoản (nạn nhân) để họ có 15s tự vệ hủy lệnh nếu bị quét lén.
  - Sau 15s (bỏ qua/hôn mê thật), tự động kích hoạt SOS Audit Logging gửi tọa độ GPS HTML5 (Geolocation) về gia đình.
- **Offline Fallback (Progressive Skeleton UI):** 
  - Cài đặt PWA (`next-pwa`) và Service Worker.
  - Xử lý rủi ro rớt sóng 3G (Điểm mù): Đóng băng màn hình, render giao diện Skeleton Xám (lấy từ Cache) thay vì hiện trang báo lỗi mất mạng của trình duyệt. Tích hợp SMS Gateway dự phòng.

### Giai đoạn 3: Web Portal Quản Trị & Y Tế Đặc Quyền (Giờ 22 - 36)
*Mục tiêu: Cho phép người bệnh cập nhật thông tin và Bác sĩ truy cập dữ liệu mật.*
- **Luồng Đăng nhập:** Code luồng Login cho Người giám hộ và Mock giao diện SSO VNeID cho Bác sĩ.
- **CRUD Hồ Sơ Y Tế:** 
  - Giao diện Dashboard cho Admin/Người giám hộ thêm/sửa/xóa thông tin dị ứng, nhóm máu, liên kết thiết bị (Mã QR).
- **Cổng Y Tế Đặc Quyền (Zero-Trust):** 
  - Màn hình dành riêng cho Bác sĩ sau khi xác thực.
  - Gọi API giải mã AES-256 để hiển thị toàn bộ bệnh án mạn tính, lịch sử dùng thuốc mà màn hình Public không thấy được.

### Giai đoạn 4: Đóng Băng Code, QA, Đóng Gói (Giờ 36 - 48)
*Mục tiêu: Đảm bảo tính ổn định, không lỗi vặt, hoàn thiện các sản phẩm phụ.*
- **Code Freeze:** Tuyệt đối không thêm tính năng mới. Toàn team tập trung rà soát.
- **QA & Bắt Bug:** (UI/UX & PM thực hiện) Cầm điện thoại test thực tế quét QR, bấm SOS, tắt mạng, test giao diện trên các màn hình khác nhau.
- **Refactoring:** Vibecoder trực ca cuối dùng AI để fix các bug QA tìm ra, xóa code rác (`console.log`, thư viện thừa).
- **Media & Document:**
  - Quay Video Demo: Thể hiện mượt mà 3 luồng (Quét QR -> Báo SOS -> Bác sĩ xem bệnh án).
  - Hoàn thiện Poster (1200x1600px).
  - Điền file PDF Báo cáo kỹ thuật.
- **Submit:** Đóng gói tất cả vào 1 folder Google Drive và nộp qua web BTC trước deadline (23:59 ngày 20/04/2026).

---

## 💡 Lưu Ý Quan Trọng Cho Người Cầm Trịch (Vibecoder)
1. **Luôn bắt đầu bằng Ngữ Cảnh:** Khi nhận ca, hãy gom toàn bộ file `02_Architecture_Context.md` và các file code người trước vừa làm đưa cho AI đọc trước tiên.
2. **Chia nhỏ lệnh (Micro-prompting):** Đừng bắt AI code cả 1 luồng Đăng nhập trong 1 câu. Hãy bảo: *"Bước 1, dựng form UI. Bước 2, viết hàm gọi API. Bước 3, xử lý lưu Token vào Cookie"*.
3. **Commit Thường Xuyên:** Code chạy được bước nào, commit ngay bước đó: `git commit -m "feat: done SOS button UI"`. Để lỡ AI làm hỏng ở bước sau, ta có thể `git revert` lại ngay.
