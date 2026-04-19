# 🗺️ MASTER IMPLEMENTATION PLAN – MedTag

> Tài liệu tổng hợp kế hoạch triển khai dự án MedTag từ hạ tầng tới sản phẩm cuối.
> Được thiết kế để AI Agent (Cursor, Gemini, Claude) có thể đọc và vibecoding từng Phase.

---

## 📋 Tổng Quan Các Phase

| Phase | Tên | Mục tiêu | File chi tiết | Dependencies |
|---|---|---|---|---|
| **0** | Infrastructure & Bootstrap | Khởi tạo repo, cài đặt dependencies, cấu hình CI/CD, biến môi trường | `Phase_0_Infrastructure.md` | Không |
| **1** | Database & Core Backend | Prisma Schema, Migrations, PrismaService (singleton), CryptoService, AuthService | `Phase_1_Database_And_Core.md` | Phase 0 |
| **2** | Emergency Public Gateway | API GET/POST emergency, Frontend Luồng 1 (QR → AntiSpam → Info → SOS), Redis Cache | `Phase_2_Emergency_Gateway.md` | Phase 1 |
| **3** | Management Portal | Auth Guardian (Login/Register), CRUD Hồ sơ, Device Link, Dashboard Guardian | `Phase_3_Management_Portal.md` | Phase 1 |
| **4** | Secure Medical Vault | Auth Doctor (Mock SSO), API giải mã AES-256, Dashboard Bác sĩ, AuditLog | `Phase_4_Medical_Vault.md` | Phase 1, Phase 2 |
| **5** | Integration & Polish | PWA/Offline, SMS Twilio, Data Freshness Cron, Responsive QA, Error Handling, Deploy | `Phase_5_Integration_Polish.md` | Phase 2, 3, 4 |

---

## 🏗️ Architecture Overview (Cho AI Agent đọc)

```
Monorepo:
├── frontend/          Next.js 14 (App Router) + Tailwind CSS
├── backend/           NestJS + Prisma + PostgreSQL
├── 02. PTTKHT/        Tài liệu phân tích thiết kế (đọc tham khảo)
└── 03. IMPLEMENTATION-PLAN/   ← BẠN ĐANG Ở ĐÂY
```

**Tech Stack:** Next.js + TailwindCSS | NestJS + Prisma | PostgreSQL (Supabase) | Redis (Upstash) | JWT + AES-256

**3 Phân Hệ Core:**
1. **Public Gateway** `/e/[shortId]` → Bystander quét QR, xem info, bấm SOS (KHÔNG cần auth)
2. **Management Portal** `/portal/*` → Guardian đăng nhập, CRUD bệnh án, liên kết thiết bị
3. **Secure Medical Vault** `/medical/*` → Bác sĩ đăng nhập, xem bệnh án được giải mã AES-256

---

## 🎯 Quy Tắc Khi VibeCoding Với AI Agent

### 1. Mỗi Session = 1 Task Nhỏ
Đừng bao giờ prompt: *"Code xong cả Phase 2"*. Thay vì đó, hãy:
```
Session 1: "Tạo EmergencyController + EmergencyService với API GET /api/emergency/:shortId"
Session 2: "Tạo trang frontend /e/[shortId] với AntiSpamGate component"
Session 3: "Tạo SOSButton component với countdown 15 giây + GPS"
```

### 2. Context = Sức Mạnh
Luôn cung cấp file context cho AI khi bắt đầu session:
```
"Đọc các file sau trước khi code:
- 02. PTTKHT/04_Database_Schema_Design.md (Schema)
- 02. PTTKHT/05_API_Specification.md (API spec)
- backend/prisma/schema.prisma (Schema hiện tại)
- [File liên quan đến task]"
```

### 3. Commit Sớm, Commit Thường Xuyên
```bash
git add -A && git commit -m "feat: [mô tả ngắn]"
# Ví dụ:
git commit -m "feat: EmergencyController + Service with GET API"
git commit -m "feat: AntiSpamGate hold-to-unlock component"
git commit -m "feat: SOSButton with 15s countdown and GPS"
```

### 4. Testing Sau Mỗi Session
Sau mỗi session, chạy:
```bash
# Backend
cd backend && npm run build  # Kiểm tra compile error
npm run start:dev             # Test API bằng Postman/curl

# Frontend
cd frontend && npm run build  # Kiểm tra compile error
npm run dev                   # Test UI trên browser
```

---

## 📊 Dependency Graph Giữa Các Phase

```
Phase 0: Infrastructure
    │
    ▼
Phase 1: Database & Core ──────────────────┐
    │                                      │
    ├───────────────┐                      │
    ▼               ▼                      ▼
Phase 2:        Phase 3:              Phase 4:
Emergency       Portal                Medical Vault
Gateway         (Guardian)            (Doctor)
    │               │                      │
    └───────────────┼──────────────────────┘
                    │
                    ▼
              Phase 5: Integration & Polish
                    │
                    ▼
              🎉 MVP COMPLETE
```

**Lưu ý:** Phase 2 và Phase 3 có thể chạy SONG SONG (2 người vibecoding khác nhau).
Phase 4 nên chờ Phase 2 xong (cần tái sử dụng trang Public).

---

## ⏰ Ước Tính Thời Gian (Vibecoding Speed)

| Phase | Tasks | Ước tính (1 Vibecoder) | Có thể song song? |
|---|---|---|---|
| Phase 0 | 5 tasks | 1-2 giờ | ❌ Phải làm trước |
| Phase 1 | 8 tasks | 2-3 giờ | ❌ Phải làm sau Phase 0 |
| Phase 2 | 10 tasks | 4-5 giờ | ✅ Song song Phase 3 |
| Phase 3 | 12 tasks | 5-6 giờ | ✅ Song song Phase 2 |
| Phase 4 | 7 tasks | 3-4 giờ | ❌ Chờ Phase 2 |
| Phase 5 | 8 tasks | 3-4 giờ | ❌ Chờ tất cả |
| **Tổng** | **50 tasks** | **18-24 giờ** | 2 Vibecoders: ~14-16 giờ |

---

## 📁 Danh Sách File Trong Folder Này

```
03. IMPLEMENTATION-PLAN/
├── 00_Master_Plan.md              ← BẠN ĐANG ĐỌC FILE NÀY
├── Phase_0_Infrastructure.md      ← Setup env, deps, CI/CD
├── Phase_1_Database_And_Core.md   ← Prisma, Auth, Crypto modules
├── Phase_2_Emergency_Gateway.md   ← Luồng 1: QR → Info → SOS
├── Phase_3_Management_Portal.md   ← Luồng 3: Guardian CRUD
├── Phase_4_Medical_Vault.md       ← Luồng 2: Bác sĩ giải mã
└── Phase_5_Integration_Polish.md  ← PWA, SMS, Polish, Deploy
```
