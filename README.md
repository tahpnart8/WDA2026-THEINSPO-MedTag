# 🏥 MedTag - Hệ thống Thông tin Y tế & Cấp cứu Mã nguồn mở

**MedTag** là nền tảng quản lý hồ sơ y tế khẩn cấp, giúp người sơ cứu (Bystander) và Bác sĩ/Nhân viên y tế truy cập nhanh chóng các thông tin sinh tử của bệnh nhân (nhóm máu, dị ứng, bệnh lý) thông qua mã QR hoặc Short ID, nhắm đến mục tiêu tối ưu "thời gian vàng" trong cấp cứu y tế.

Đồng thời, hệ thống đề cao tuyệt đối **quyền riêng tư** thông qua cơ chế mã hóa AES-256 đối với dữ liệu y tế nhạy cảm định danh và hàng rào bảo mật Anti-Spam Gate nhằm chặn đứng các hành vi dùng bot quét dữ liệu tự động trái phép.

---

## ✨ Tính năng nổi bật

### 1. Phân hệ Cấp cứu (Dành cho Người đi đường / Bystanders)
- **Truy cập nhanh (Quét mã QR / Nhập Short ID):** Quét mã QR gắn trên thiết bị (vòng tay, thẻ y tế) để nhận diện hoặc nhập tay mã ngắn tại trang chủ.
- **Anti-Spam Security Gate:** Yêu cầu người dùng thao tác "Nhấn và giữ" liên tục trong 2 giây để xác thực rào chắn con người, ngăn chặn rò rỉ dữ liệu qua bot.
- **Visual Double Check:** Hiển thị tức thời ảnh đại diện, giới tính và tuổi để người sơ cứu đối chiếu chính xác gương mặt bệnh nhân.
- **Public Medical Layer (Trang hiển thị lớp vật lý):** Hiển thị công khai giới hạn ở nhóm máu, các cảnh báo dị ứng nghiêm trọng và bệnh lý nguy cấp.
- **SOS Action:** Trang bị nút báo động SOS, chuyển tiếp cuộc gọi tới hotline người thân đã cấu hình sẵn hoặc chia sẻ vị trí hiện tại.
- **Trải nghiệm High-end UI mượt mà:** Gắn kèm các chuỗi chuyển cảnh mượt mà, màn hình Loading hiện đại (Glassmorphism) mô phỏng chính xác các giai đoạn hệ thống truy xuất và xác định bảo mật.

### 2. Phân hệ Bác sĩ (MedTag Pro)
- **Giải mã dữ liệu AES-256:** Cung cấp lớp giao diện chi tiết bệnh án sâu thẳm (Encrypted Layer), nội dung này được mã hóa và chỉ mở ra trên ứng dụng của Bác sĩ đã xác thực.
- **Chi tiết bệnh án y khoa:** Truy xuất tiền sử bệnh lý, danh sách đơn thuốc đang sử dụng, lịch sử thủ thuật phẫu thuật và kết quả xét nghiệm cập nhật nhất.
- **Cảnh báo tính tươi mới dữ liệu (Data Freshness Verification):** Gắn cờ cảnh báo (Fresh/Stale/Expired) nếu hồ sơ y tế của bệnh nhân quá lâu chưa được giám hộ rà soát và xác nhận trực tuyến, giúp bác sĩ thận trọng khi ra y lệnh.

### 3. Phân hệ Giám hộ (Guardian Portal)
- Dashboard tổng quan quản lý sự an toàn của người thân và danh sách thiết bị.
- Phân hệ quản lý Hệ sinh thái thiết bị & QR Code tích hợp: Sinh ra các mã Short ID ngẫu nhiên không trùng lặp, cấp quyền kết nối chúng vào dữ liệu của người bệnh và tải đồ họa QR Code dưới định dạng ảnh nét cao để in lên thẻ/vòng đeo tay.

---

## 🛠 Công nghệ & Kiến trúc Hệ thống

- **Frontend App:** Next.js 16+ (App Router), React, TailwindCSS, Lucide React Icons, qrcode.react.
- **Backend API Server:** NestJS framework, tập trung xử lý RESTful Endpoint mạnh mẽ.
- **Database & ORM:** PostgreSQL Cloud (vận hành bởi Supabase), tích hợp Prisma ORM.
- **Bảo mật & Hạ tầng:** Triển khai mã hóa đa tầng AES-256 (node:crypto), mã hóa mật khẩu tĩnh bcrypt. Môi trường sản phẩm hiện hữu deploy trực tiếp qua nền tảng Vercel và Render.

---

## 📂 Cơ cấu Dự án (Monorepo-Style)

```text
WDA2026-THEINSPO-MedTag/
│
├── frontend/               # Mã nguồn ứng dụng Frontend (Next.js)
│   ├── src/app/            # App Router (/, /e/[shortId], /medical, /portal)
│   ├── src/components/     # Các module UI thành phần (emergency, medical, portal)
│   ├── src/contexts/       # React Context (AuthContext)
│   ├── src/lib/            # Tiện ích API Client
│   └── ...
│
├── backend/                # Mã nguồn máy chủ Backend API (NestJS)
│   ├── src/                # Logic xử lý Portal, Medical, Crypto Engine, Auth
│   ├── prisma/             # Schema khai báo CSDL Prisma
│   ├── .env                # Cấu hình biến môi trường cục bộ
│   └── fix-and-seed-...js  # Các Script tạo & nạp dữ liệu Test 
│
└── README.md               # Tài liệu dự án MedTag
```

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy Toàn diện (Local Dev)

### 📋 Yêu cầu Cấu hình Căn bản
- [Node.js](https://nodejs.org/en) (Phiên bản v18.x hoặc cao hơn định kỳ ưu tiên LTS).
- Trình quản lý gói `npm` có sẵn khi cài Node.js.

### Bước 1: Khởi động Máy chủ Backend (NestJS Server)

1. Mở cửa sổ Terminal và trỏ đường dẫn vào thư mục máy chủ:
   ```bash
   cd backend
   ```
2. Cài đặt thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Thiết lập CSDL riêng (Supabase):
   - Đăng nhập [Supabase](https://supabase.com/), tạo Project mới.
   - Lấy **Connection String** (Transaction mode - port 6543) và **Direct Connection** (Session mode - port 5432).
   - Tạo file `.env` tại `backend/` và dán cấu hình của bạn vào:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   JWT_SECRET="medtag-super-secret-jwt-key"
   AES_SECRET_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
   PORT=3001
   FRONTEND_URL="http://localhost:3000"
   ```
4. Khởi tạo Schema và Import Dữ liệu:
   - **Đẩy Schema lên CSDL mới:**
     ```bash
     npx prisma generate
     npx prisma db push
     ```
   - **Nạp dữ liệu mẫu (quan trọng):**
     Bạn có thể import toàn bộ dump dữ liệu:
     - Mở **SQL Editor** trên Supabase Dashboard.
     - Copy nội dung file `backend/database/full_dump.sql` (Sẽ được tạo ra khi chạy `node export_db.js`) và Run.

5. Chạy Máy chủ:
   ```bash
   npm run start:dev
   ```
   > *Dịch vụ API sẽ lắng nghe tại IP nội bộ `http://localhost:3001`.*

### Bước 2: Thiết lập Giao diện Frontend (Next.js Application)

1. Mở song song một Terminal mới và di chuyển lại vào thư mục mặt trước:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện React UI Node Modules:
   ```bash
   npm install
   ```
3. Cấu hình biến định tuyến (Envs):
   - Lập một file cấu trúc mới tên `.env.local` ở cùng cấp độ với package.json trong thư mục `frontend/` với nội dung khai báo:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   ```
4. Biến dịch dự án và chạy máy chủ phía người dùng:
   ```bash
   npm run dev
   ```
   > *Website Frontend sẽ mở lập tức tại máy nhà ở URL `http://localhost:3000`.*

---

## 🧪 Tài khoản Cấp Phiên bản Test (Mock Credentials)

Khi chuỗi tiến trình dịch vụ phía Client lẫn Server cùng hoạt động trôi chảy, hệ thống cung cấp các bộ testcases cho các vai góc nhìn khác nhau trong vòng lặp vận hành như sau:

**1. Trải nghiệm Hành trình Người Sơ Cứu "Thời gian vàng" (Bystander Scenario):**
- Đi thẳng đường dẫn định danh: `http://localhost:3000/e/TDP183` 
- Hoặc tiếp cận Landing Page `http://localhost:3000/`, điền mã `TDP183` ở thanh ô công cụ `Tra cứu Hồ sơ` rồi trải nghiệm đồ họa Load Testing, kèm thao tác Nhấn giữ xác thực lớp cổng Anti-Spam Gate trước khi mở hồ sơ chỉ định.

**2. Đăng nhập Cổng Thừa Hành Chuyên Môn Y Tế (Doctor Portal - MedTag Pro):**
- **Đường dẫn:** `http://localhost:3000/medical/login`
- **Tài khoản:** `bacsi@medtag.vn` | **Mật khẩu:** `123456`
- **Hành động Test thử:** Tại ô tìm kiếm mã, hãy điền `TDP183`, giao diện sẽ bóc tách lớp Encrypted Data và tiến hành hiển biểu đồ khối bệnh lý, thông số sinh hóa xét nghiệm sâu được thiết lập từ Seed Data.

**3. Đăng nhập Trang Thông tin Người Nhà/Người Quản Lý Giám Hộ (Guardian Portal):**
- **Đường dẫn:** `http://localhost:3000/portal/login`
- **Tài khoản:** `tdpsince2019@gmail.com` | **Mật khẩu:** `123456`
- **Hành động Test thử:** Đi vào tab chức năng "**Thiết Bị** / **Gắn Cáp Mã Mới**" để kiểm định bộ xử lý random hóa các vòng lặp Short ID (6 ký tự) cũng như tải về thẻ ấn phẩm đuôi định dạng đồ họa QR `.png`.

---
*Developed with Modern Next.js Framework & Deep Security Methodologies for the Emergency Scenario.*
