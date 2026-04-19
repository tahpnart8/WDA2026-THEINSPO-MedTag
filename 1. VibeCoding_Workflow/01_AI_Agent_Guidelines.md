# AI Agent Workflow Guidelines for MedTag (Vibecoding)

## 1. Nguyên tắc làm việc chung (Core Principles)
- **Cung cấp ngữ cảnh (Context is King):** Luôn bắt đầu session mới bằng việc cho Agent đọc file `02_Architecture_Context.md` và các file Code liên quan đang cần sửa.
- **Tiến trình từng bước (Iterative Process):** Yêu cầu Agent "Think step by step" trước khi code. Yêu cầu Agent viết ra Plan rồi hãy thực hiện.
- **Micro-commits:** Bất cứ khi nào Agent tạo ra một component/module hoạt động đúng, commit ngay lập tức để tạo điểm khôi phục an toàn. Không code quá nhiều tính năng trong một lần prompt.
- **Zero-Trust với Code Sinh ra:** Không bao giờ tin tưởng hoàn toàn code AI. Luôn kiểm tra tính an toàn (đặc biệt là lỗi lộ secrets, SQL injection, bypass Auth). Dự án có tính năng y tế nên lỗi về dữ liệu sẽ dẫn tới hậu quả nghiêm trọng.

## 2. Tiêu chuẩn viết Code (Coding Standards)
- **Frontend (Next.js & Tailwind CSS):** 
  - Bắt buộc dùng `TypeScript` chặt chẽ, định nghĩa các `interface`/`type` cho mọi object nhận từ API.
  - Sử dụng App Router của Next.js nếu bắt đầu dự án mới, lưu ý phân biệt rõ Client Component (`"use client"`) và Server Component.
  - Tailwind CSS: Giữ class gọn gàng, tách thành các component nhỏ nếu có quá nhiều div lồng nhau.
- **Backend (NestJS/Node.js):** 
  - Tuân thủ chặt chẽ kiến trúc Module, Controller, Service của NestJS.
  - Không ném trực tiếp lỗi ra ngoài. Phải xử lý Exception và trả về format chuẩn của JSON.
  - API phải là RESTful và trả về JSON thuần.
- **Database (PostgreSQL & Prisma/TypeORM):** 
  - Yêu cầu AI luôn viết Schema/Migration kỹ càng, luôn có các trường bắt buộc như `created_at`, `updated_at`.

## 3. Quy trình Debugging
Nếu gặp lỗi, không nên cung cấp mỗi mã lỗi:
1. Chạy lệnh log (ví dụ: `npm run build` hoặc console error từ browser).
2. Copy ĐẦY ĐỦ mã lỗi + dòng code nghi ngờ cho Agent.
3. Nếu Agent sửa sai 2 lần liên tiếp, yêu cầu Agent dừng lại, đọc lại context hệ thống thay vì mù quáng thử sai.