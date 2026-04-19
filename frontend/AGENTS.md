# MedTag – Emergency Medical Information Platform

## Dự Án Này Là Gì?
MedTag là hệ thống thông tin y tế khẩn cấp. Mỗi bệnh nhân đeo thiết bị có QR code.
Khi gặp tai nạn, bất kỳ ai quét QR đều xem được nhóm máu, dị ứng, bệnh nền ngay lập tức.

## Kiến Trúc
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS → `/frontend`
- **Backend:** NestJS + Prisma ORM → `/backend`  
- **Database:** PostgreSQL (Supabase) + Redis (Upstash)
- **Bảo mật:** JWT + AES-256-CBC mã hóa bệnh án

## 3 Phân Hệ
1. **Public Gateway** `/e/[shortId]` → Quét QR → Xem info → Bấm SOS (KHÔNG cần auth)
2. **Management Portal** `/portal/*` → Guardian quản lý hồ sơ (JWT Guardian)
3. **Medical Vault** `/medical/*` → Bác sĩ xem bệnh án giải mã (JWT Doctor)

## Tài Liệu
- `02. PTTKHT/` → Phân tích thiết kế (Schema, API, Use Case, Architecture)
- `03. IMPLEMENTATION-PLAN/` → Kế hoạch triển khai 6 phases, 50 tasks
- `01. VibeCoding_Workflow/01_AI_Agent_Workflow_Guide.md` → Hướng dẫn vibecoding

## Test Accounts (Seed Data)
- **Guardian:** `nguoithan@medtag.vn` / `123456`
- **Doctor:** `bacsi@medtag.vn` / `123456`
- **QR Code test:** `X7K9A2`

## Quy Tắc Quan Trọng
- Dữ liệu Public (bloodType, allergies) = plaintext → truy xuất nhanh
- Dữ liệu nhạy cảm (tiền sử bệnh, đơn thuốc) = AES-256 encrypted
- API `/api/emergency/*` KHÔNG cần auth (tốc độ ưu tiên)
- API `/api/portal/*` cần JWT Guardian
- API `/api/medical/*` cần JWT Doctor
- KHÔNG BAO GIỜ trả encryptedMedicalData ở Emergency API
