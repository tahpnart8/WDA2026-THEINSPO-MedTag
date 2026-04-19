# 🤖 Hướng Dẫn VibeCoding Với AI Agent – Dự Án MedTag

> Tài liệu này hướng dẫn chi tiết cách sử dụng AI Agent (Gemini, Cursor, Claude) để
> phát triển dự án MedTag một cách hiệu quả nhất. Copy nguyên văn các prompt template
> và điều chỉnh theo task cụ thể.

---

## 📖 Mục Lục
1. [Cấu Trúc Dự Án](#1-cấu-trúc-dự-án)
2. [Quy Trình Mỗi Session](#2-quy-trình-mỗi-session)
3. [Prompt Templates](#3-prompt-templates)
4. [Git Workflow](#4-git-workflow)
5. [Checklist Bàn Giao Ca](#5-checklist-bàn-giao-ca)
6. [Xử Lý Sự Cố](#6-xử-lý-sự-cố)
7. [Danh Sách File Context Theo Phase](#7-danh-sách-file-context-theo-phase)

---

## 1. Cấu Trúc Dự Án

```
WDA2026-THEINSPO-MedTag/
│
├── 00. Document/              📄 Tài liệu cuộc thi (PDF, poster)
├── 01. VibeCoding_Workflow/   🤖 BẠN ĐANG Ở ĐÂY – Hướng dẫn workflow
├── 02. PTTKHT/                🏗️ Phân tích thiết kế hệ thống (9 files)
├── 03. IMPLEMENTATION-PLAN/   📋 Kế hoạch triển khai (7 files, 50 tasks)
│
├── backend/                   ⚙️ NestJS + Prisma + PostgreSQL
│   ├── prisma/schema.prisma   🧱 Database schema
│   ├── src/auth/              🔑 JWT authentication
│   ├── src/crypto/            🔐 AES-256 mã hóa
│   ├── src/emergency/         🚑 API cấp cứu công khai
│   ├── src/portal/            📊 API quản trị Guardian
│   └── src/medical/           🏥 API y tế Bác sĩ
│
└── frontend/                  🎨 Next.js + Tailwind CSS
    ├── src/app/page.tsx       🏠 Landing page (nhập ShortID)
    ├── src/app/e/[shortId]/   🚑 Trang cấp cứu công khai
    ├── src/app/portal/        📊 Dashboard Guardian
    └── src/app/medical/       🏥 Dashboard Bác sĩ
```

---

## 2. Quy Trình Mỗi Session VibeCoding

### 🔄 Session Flow (Làm theo đúng thứ tự)

```
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 1: CẬP NHẬT CODE TỪ GIT                           │
│                                                         │
│   cd WDA2026-THEINSPO-MedTag                            │
│   git pull origin main                                  │
│   cd backend && npm install                             │
│   cd ../frontend && npm install                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ BƯỚC 2: ĐỌC CONTEXT (Quan trọng nhất!)                 │
│                                                         │
│   Mở file 03. IMPLEMENTATION-PLAN/ → Phase đang làm    │
│   Đọc checklist → xác định Task tiếp theo              │
│   Mở file HANDOFF_LOG.md → đọc note người trước        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ BƯỚC 3: CHUẨN BỊ PROMPT CHO AI AGENT                   │
│                                                         │
│   Copy Prompt Template phù hợp (Section 3)             │
│   Gắn file context (Section 7)                         │
│   Mô tả task cụ thể (1 task tại 1 thời điểm)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ BƯỚC 4: AI AGENT CODE → BẠN REVIEW                     │
│                                                         │
│   Đọc code AI tạo ra → hiểu logic                      │
│   Chạy npm run build kiểm tra compile                   │
│   Test chức năng trên browser/Postman                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ BƯỚC 5: COMMIT + GHI LOG                                │
│                                                         │
│   git add -A                                            │
│   git commit -m "feat: [mô tả]"                        │
│   Cập nhật checklist trong Phase file                   │
│   Viết note vào HANDOFF_LOG.md (nếu hết ca)            │
└─────────────────────────────────────────────────────────┘
```

### ⏱️ Rhythm: 1 Session = 1 Task = 15-30 phút

| Thời gian | Hoạt động |
|---|---|
| 0-2 phút | Pull code, đọc context |
| 2-5 phút | Chuẩn bị prompt, gắn file context |
| 5-20 phút | AI code + bạn review |
| 20-25 phút | Test chạy thử |
| 25-30 phút | Commit + ghi log |

---

## 3. Prompt Templates

### 📌 Template A: Tạo Module/Feature Backend Mới

```
=== NGỮ CẢNH DỰ ÁN ===
Tôi đang phát triển dự án MedTag – Hệ thống thông tin y tế khẩn cấp.
Kiến trúc: Monorepo với /frontend (Next.js 14, App Router, Tailwind CSS) 
và /backend (NestJS, Prisma, PostgreSQL).

=== FILE CONTEXT ===
Hãy đọc kỹ các file sau trước khi code:
1. [GẮN FILE: backend/prisma/schema.prisma]
2. [GẮN FILE: 02. PTTKHT/05_API_Specification.md → Section liên quan]
3. [GẮN FILE: backend/src/app.module.ts]
4. [GẮN FILE: Code liên quan đã có]

=== TASK ===
[MÔ TẢ CHÍNH XÁC TASK, ví dụ:]
Tạo PortalController trong backend/src/portal/portal.controller.ts với các
endpoint sau:
- GET /api/portal/medical-records (lấy danh sách hồ sơ của Guardian)
- POST /api/portal/medical-records (tạo hồ sơ mới)
Tất cả endpoint phải có @UseGuards(JwtAuthGuard, RolesGuard) và @Roles(Role.GUARDIAN).

=== RÀNG BUỘC ===
- TypeScript strict (không dùng `any`, định nghĩa interface/type)
- Tuân thủ NestJS Module/Controller/Service pattern
- Inject PrismaService (không tạo new PrismaClient)
- Validation bằng class-validator DTOs
- Trả về JSON format chuẩn
- Code phải compile: npm run build
```

---

### 📌 Template B: Tạo Trang/Component Frontend

```
=== NGỮ CẢNH ===
Dự án MedTag – Frontend Next.js 14 (App Router) + Tailwind CSS.

=== FILE CONTEXT ===
1. [GẮN FILE: 02. PTTKHT/08_Screen_List_And_UI_Spec.md → Wireframe màn nào]
2. [GẮN FILE: frontend/src/types/relevant-type.ts]
3. [GẮN FILE: frontend/src/lib/api.ts]
4. [GẮN FILE: Component tương tự đã có để tham khảo style]

=== TASK ===
[MÔ TẢ, ví dụ:]
Tạo trang frontend/src/app/portal/dashboard/page.tsx (Guardian Dashboard).
Trang gồm:
1. Stats cards: Số hồ sơ, Số thiết bị, Số SOS tháng này
2. Alert banner nếu có hồ sơ STALE/EXPIRED
3. Danh sách Patient cards
4. Nút "+ Thêm hồ sơ mới"
Gọi API: GET /api/portal/medical-records (Bearer token).

=== RÀNG BUỘC ===
- "use client" vì có useState/useEffect
- TypeScript strict, dùng interface đã định nghĩa
- Tailwind CSS responsive (mobile-first)
- Xử lý loading state (Skeleton) và error state
- Không dùng thư viện UI bên ngoài (chỉ Tailwind + tự viết component)
```

---

### 📌 Template C: Fix Bug

```
=== NGỮ CẢNH ===
Dự án MedTag. Component/Module [TÊN] đang bị lỗi.

=== MÃ LỖI ===
```
[PASTE TOÀN BỘ ERROR LOG TỪ TERMINAL HOẶC BROWSER CONSOLE]
```

=== FILE BỊ LỖI ===
[GẮN FILE: file đang lỗi]

=== MÔ TẢ ===
Hành vi mong đợi: [...]
Hành vi thực tế: [...]

=== YÊU CẦU ===
1. Phân tích nguyên nhân gốc (root cause)
2. Đề xuất 2 phương án sửa, giải thích ưu nhược điểm
3. Sau khi tôi chọn phương án, mới viết code sửa
```

---

### 📌 Template D: Refactor / Tối Ưu Code

```
=== TASK ===
File [TÊN FILE] đang hoạt động nhưng cần refactor.

=== FILE CONTEXT ===
[GẮN FILE]

=== YÊU CẦU ===
1. Tách component lớn thành các file nhỏ hơn
2. Đưa logic API ra custom hook (useSomething.ts)
3. Thêm TypeScript types cho tất cả props
4. Giữ nguyên 100% hành vi hiện tại (no breaking changes)

Hãy in ra cấu trúc thư mục mới trước rồi mới viết code chi tiết.
```

---

### 📌 Template E: Review Bảo Mật

```
=== TASK ===
Tôi chuẩn bị push đoạn code sau. Đây là API liên quan đến dữ liệu y tế
bệnh nhân. Rà soát bảo mật:

[GẮN CODE]

=== CHECKLIST KIỂM TRA ===
- Có lộ secret key nào không?
- Có SQL injection / Prisma injection không?
- JWT token có được verify đúng không?
- Role-based access có chặt chẽ không?
- encryptedMedicalData có bị trả về ở API không cần auth không?
- Input có được validate không?
```

---

## 4. Git Workflow

### Commit Convention
```bash
# Tính năng mới
git commit -m "feat: tên tính năng ngắn gọn"
# Ví dụ:
git commit -m "feat: PortalController CRUD medical records"
git commit -m "feat: Guardian login page with form validation"

# Sửa lỗi
git commit -m "fix: mô tả lỗi"
# Ví dụ:
git commit -m "fix: SOSButton GPS not working on iOS Safari"

# Refactor (không đổi hành vi)
git commit -m "refactor: mô tả thay đổi"
# Ví dụ:
git commit -m "refactor: extract emergency page into sub-components"

# Style/UI (chỉ thay đổi giao diện)
git commit -m "style: mô tả"

# Chore (config, deps, scripts)
git commit -m "chore: mô tả"
```

### Branch Strategy (Đơn giản cho 48h)
```bash
main ────────────────────────────────────→
  │
  └── Tất cả commit trực tiếp lên main
      (không có thời gian cho PR review trong 48h)
      
# Nếu AI làm hỏng:
git log --oneline -5          # Xem 5 commit gần nhất
git revert HEAD               # Undo commit cuối
# Hoặc:
git reset --hard HEAD~1       # Xóa commit cuối (mất code)
```

### Quy Tắc An Toàn
```bash
# TRƯỚC KHI cho AI code 1 task lớn:
git add -A && git commit -m "checkpoint: before [tên task]"

# SAU KHI AI code xong + test OK:
git add -A && git commit -m "feat: [tên task]"

# NẾU AI làm hỏng:
git diff                      # Xem thay đổi
git checkout -- .             # Discard tất cả thay đổi
# Hoặc:
git stash                     # Cất thay đổi tạm
git stash pop                 # Lấy lại nếu cần
```

---

## 5. Checklist Bàn Giao Ca (Relay Handoff)

Khi hết ca vibecoding, người cầm trịch PHẢI:

### ✅ Trước khi bàn giao:
```
1. [ ] Code compile thành công (npm run build cả FE lẫn BE)
2. [ ] Commit tất cả thay đổi (không để code uncommitted)
3. [ ] Push lên remote: git push origin main
4. [ ] Cập nhật checklist trong file Phase (đánh [x] task đã xong)
5. [ ] Viết note vào 01. VibeCoding_Workflow/HANDOFF_LOG.md
```

### 📝 Format ghi note HANDOFF_LOG.md:
```markdown
## [Ngày] [Giờ] – [Tên người code]

### Đã làm xong:
- Task 2.1: EmergencyService refactor (PrismaService + Cache) ✅
- Task 2.2: EmergencyController + SOS DTO ✅

### Đang làm dở (nếu có):
- Task 2.3: EmergencyModule imports – Đã tạo file nhưng chưa test

### Lưu ý cho người tiếp theo:
- Redis chưa cấu hình trên local, đang dùng in-memory fallback
- API GET /api/emergency/:shortId đã hoạt động, test bằng: 
  curl http://localhost:3001/api/emergency/X7K9A2
- File frontend/src/types/emergency.ts đã tạo nhưng chưa được import

### Bugs biết mà chưa fix:
- AntiSpamGate đôi khi bị treo ở 99% trên Firefox
```

---

## 6. Xử Lý Sự Cố

### 🔴 AI không hiểu context
```
GIẢI PHÁP: Prompt ngắn lại. Chia thành 2-3 bước nhỏ hơn.

BAD:  "Code xong cả trang Dashboard với chart, table, sidebar"
GOOD: "Bước 1: Tạo component PatientCard.tsx hiển thị tên, nhóm máu, badge."
      → Test xong → Commit
      "Bước 2: Tạo trang dashboard/page.tsx render danh sách PatientCard."
```

### 🔴 AI tạo code compile error
```
1. Copy toàn bộ error log
2. Paste cho AI kèm prompt Template C (Fix Bug)
3. Nếu AI sửa sai 2 lần → DỪNG LẠI
4. Đọc lại error tự suy nghĩ, hoặc undo code:
   git checkout -- [file bị lỗi]
5. Prompt lại từ đầu với context rõ hơn
```

### 🔴 AI tạo file sai vị trí
```
Luôn chỉ rõ đường dẫn TUYỆT ĐỐI trong prompt:
BAD:  "Tạo file auth.controller.ts"
GOOD: "Tạo file backend/src/auth/auth.controller.ts"
```

### 🔴 Code AI bị conflict với code người trước
```bash
git pull origin main
# Nếu có conflict:
# 1. Mở file conflict → chọn version đúng
# 2. git add [file đã resolve]
# 3. git commit -m "merge: resolve conflict in [file]"
```

### 🔴 Database migration lỗi
```bash
# Reset DB (CHỈ dùng trên development!):
npx prisma migrate reset
npx prisma generate
npx prisma db seed
```

---

## 7. Danh Sách File Context Theo Phase

### Phase 0: Infrastructure
```
Cho AI đọc:
- 02. PTTKHT/07_System_Architecture.md
- backend/package.json
- frontend/package.json
- backend/src/main.ts
```

### Phase 1: Database & Core
```
Cho AI đọc:
- 02. PTTKHT/04_Database_Schema_Design.md (QUAN TRỌNG NHẤT)
- 02. PTTKHT/05_API_Specification.md (Section Auth)
- backend/prisma/schema.prisma
- backend/src/auth/auth.service.ts
- backend/src/crypto/crypto.service.ts
- backend/src/app.module.ts
```

### Phase 2: Emergency Gateway
```
Cho AI đọc:
- 02. PTTKHT/05_API_Specification.md (Section Emergency)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (S01-S05)
- 02. PTTKHT/06_Sequence_Diagrams.md (Luồng 1)
- backend/src/emergency/emergency.service.ts
- backend/src/emergency/emergency.controller.ts
- frontend/src/app/e/[shortId]/page.tsx
- frontend/src/components/emergency/SOSButton.tsx
- frontend/src/components/emergency/AntiSpamGate.tsx
```

### Phase 3: Management Portal
```
Cho AI đọc:
- 02. PTTKHT/05_API_Specification.md (Section Portal)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (S08-S16)
- 02. PTTKHT/06_Sequence_Diagrams.md (Luồng 3)
- backend/prisma/schema.prisma
- frontend/src/hooks/useAuth.ts (nếu đã tạo)
- frontend/src/lib/api.ts
```

### Phase 4: Medical Vault
```
Cho AI đọc:
- 02. PTTKHT/05_API_Specification.md (Section Medical)
- 02. PTTKHT/04_Database_Schema_Design.md (Section 4: Encrypted JSON)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (S06-S07)
- backend/src/crypto/crypto.service.ts
- backend/src/common/guards/jwt-auth.guard.ts
- backend/src/common/guards/roles.guard.ts
```

### Phase 5: Integration & Polish
```
Cho AI đọc:
- 02. PTTKHT/07_System_Architecture.md (Deployment section)
- frontend/next.config.ts
- backend/src/app.module.ts (toàn bộ imports)
```

---

## 8. Quick Reference Card (In ra dán bàn)

```
╔══════════════════════════════════════════════╗
║         MEDTAG VIBECODING CHEAT SHEET        ║
╠══════════════════════════════════════════════╣
║                                              ║
║  Before Code:  git pull → read Phase file    ║
║  1 Session  =  1 Task  =  15-30 min         ║
║  After Code :  npm run build → commit → push ║
║                                              ║
║  Backend  :  http://localhost:3001/api        ║
║  Frontend :  http://localhost:3000            ║
║                                              ║
║  Test QR  :  /e/X7K9A2  (seed data)          ║
║  Guardian :  nguoithan@medtag.vn / 123456    ║
║  Doctor   :  bacsi@medtag.vn / 123456        ║
║                                              ║
║  AI hỏng? :  git checkout -- .               ║
║  DB hỏng? :  npx prisma migrate reset        ║
║                                              ║
╚══════════════════════════════════════════════╝
```
