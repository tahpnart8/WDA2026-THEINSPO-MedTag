# 08. Danh Sách Màn Hình & Wireframe Mô Tả (Screen List & UI Specification)

## 1. Tổng Quan Màn Hình

| # | Màn hình | Route | Actor | Phân hệ |
|---|---|---|---|---|
| S01 | Landing Page (Nhập ShortID) | `/` | Bystander | Public Gateway |
| S02 | Anti-Spam Gate (Modal) | `/e/[shortId]` | Bystander/Doctor | Public Gateway |
| S03 | Emergency Info View | `/e/[shortId]` | Bystander/Doctor | Public Gateway |
| S04 | SOS Countdown (15s) | `/e/[shortId]` | Bystander | Public Gateway |
| S05 | SOS Confirmed | `/e/[shortId]` | Bystander | Public Gateway |
| S06 | Doctor Login | `/medical/login` | Doctor | Medical Vault |
| S07 | Medical Dashboard | `/medical/[shortId]` | Doctor | Medical Vault |
| S08 | Guardian Login | `/portal/login` | Guardian | Portal |
| S09 | Guardian Register | `/portal/register` | Guardian | Portal |
| S10 | Dashboard Overview | `/portal/dashboard` | Guardian | Portal |
| S11 | Patient List | `/portal/patients` | Guardian | Portal |
| S12 | Patient Create/Edit Form | `/portal/patients/new` | Guardian | Portal |
| S13 | Patient Detail | `/portal/patients/[id]` | Guardian | Portal |
| S14 | Device Management | `/portal/devices` | Guardian | Portal |
| S15 | Emergency History | `/portal/emergency-logs` | Guardian | Portal |
| S16 | Account Settings | `/portal/settings` | Guardian | Portal |
| S17 | Offline Fallback (Skeleton) | `/e/[shortId]` | Bystander | PWA |
| S18 | 404 Error Page | `/*` | All | Common |

---

## 2. Chi Tiết Từng Màn Hình

### S01 – Landing Page

```
┌──────────────────────────────┐
│                              │
│         🚑 (animate-bounce)  │
│           MEDTAG             │
│   Cổng thông tin sơ cứu     │
│        khẩn cấp              │
│                              │
│  ┌────────────────────────┐  │
│  │  Nhập mã ID Khẩn cấp  │  │
│  │                        │  │
│  │  Dự phòng khi QR bị   │  │
│  │  xước. Mã 6 ký tự in  │  │
│  │  dưới mã QR.           │  │
│  │                        │  │
│  │  ┌──────────────────┐  │  │
│  │  │    X 7 K 9 A 2   │  │  │ ← Input uppercase, tracking-widest
│  │  └──────────────────┘  │  │
│  │                        │  │
│  │  ┌──────────────────┐  │  │
│  │  │  TRUY XUẤT HỒ SƠ │  │  │ ← Button disabled khi < 5 ký tự
│  │  └──────────────────┘  │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│   Thuộc hệ sinh thái Y tế   │
│   Dành cho đội phản ứng 115  │
│                              │
└──────────────────────────────┘
```

**Design Notes:**
- Mobile-first, max-width 448px, center aligned
- Background: gray-50, Card: white rounded-3xl shadow-xl
- Input: text-3xl font-black uppercase tracking-widest
- Ambulance emoji animates bounce

---

### S03 – Emergency Info View (Core Screen)

```
┌──────────────────────────────┐
│           ĐỐI CHIẾU        │ ← text-red-600 animate-pulse
│        KHUÔN MẶT            │
│                              │
│     ┌────────────────┐       │
│     │                │       │ ← 192x192px avatar
│     │   👤 AVATAR    │       │    rounded-3xl
│     │                │       │    border-4 white
│     └────────────────┘       │    shadow-2xl
│                              │
│  ┌────────────────────────┐  │
│  │ 🟢 GREEN BOX           │  │ ← bg-emerald-600
│  │                        │  │
│  │  NGUYỄN VĂN A          │  │ ← text-3xl font-black
│  │  Nam • 61 tuổi          │  │ ← text-lg
│  │                        │  │
│  │  ┌──────────────────┐  │  │
│  │  │ Người thân:      │  │  │ ← bg-emerald-800/40
│  │  │ 0901 234 567     │  │  │ ← text-2xl font-black
│  │  └──────────────────┘  │  │
│  └────────────────────────┘  │
│                              │
│  ┌──────────┐ ┌───────────┐  │
│  │ ⬛ NHÓM  │ │ 🟥 DỊ ỨNG │  │
│  │   MÁU    │ │           │  │
│  │          │ │ Penicillin│  │
│  │   O+     │ │ Đậu phộng │  │ ← O+ is text-6xl
│  │          │ │           │  │
│  └──────────┘ └───────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ ⚠️ 🟡 BỆNH NỀN         │  │ ← bg-yellow-400
│  │                        │  │
│  │ Nhồi máu cơ tim,      │  │ ← text-xl font-bold
│  │ Huyết áp cao           │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │     🆘 CẤP CỨU         │  │ ← Giant red button
│  │  Chạm để đếm ngược 15s│  │    shadow-red-600
│  │                        │  │    hover: translate-y-1
│  └────────────────────────┘  │
│                              │
│      MedTag © 2026           │
└──────────────────────────────┘
```

**Design Notes:**
- Cognitive Load Trimming: NO unnecessary text, only critical data
- Font sizes: Blood type 60px, Name 30px, Allergies 20px
- Color coding: Each box has distinct background for instant recognition
- Under stress/panic, user needs to scan info in < 3 seconds

---

### S07 – Medical Dashboard (Doctor View)

```
┌──────────────────────────────────────────────┐
│  🏥 MedTag Medical Portal     [Logout]       │
│  BS. Trần Văn C | Chứng chỉ: BV-2024-0123   │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ BỆNH NHÂN: Nguyễn Văn A             │    │
│  │ Sinh: 15/03/1965 | Nam | O+          │    │
│  │                                      │    │
│  │ 🟢 Dữ liệu: FRESH (cập nhật 94 ngày│    │
│  │     trước)                           │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌─── Tab Navigation ──────────────────┐     │
│  │ [Tiền sử] [Thuốc] [XN] [Chống CĐ]  │     │
│  └──────────────────────────────────────┘    │
│                                              │
│  ── Tab: Tiền Sử Bệnh Lý ──                 │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🔴 Bệnh mạn tính đang điều trị      │    │
│  │ • Nhồi máu cơ tim (2018) – severe    │    │
│  │   BS. Nguyễn Văn B – Viện Tim HCM    │    │
│  │ • Huyết áp cao (2015) – moderate      │    │
│  │   Đang kiểm soát bằng Losartan       │    │
│  ├──────────────────────────────────────┤    │
│  │ 🔧 Lịch sử phẫu thuật               │    │
│  │ • Đặt stent mạch vành (01/06/2018)   │    │
│  │   Viện Tim TP.HCM                    │    │
│  ├──────────────────────────────────────┤    │
│  │ 👨‍👩‍👧 Tiền sử gia đình                  │    │
│  │ Cha: Đột quỵ ở tuổi 62               │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ── Tab: Thuốc Đang Dùng ──                  │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 💊 Aspirin 81mg                      │    │
│  │    1 lần/ngày | Chống đông máu       │    │
│  │    BS. Nguyễn Văn B                   │    │
│  ├──────────────────────────────────────┤    │
│  │ 💊 Atorvastatin 20mg                 │    │
│  │    1 lần/ngày (tối) | Giảm cholest.  │    │
│  ├──────────────────────────────────────┤    │
│  │ 💊 Losartan 50mg                     │    │
│  │    1 lần/ngày (sáng) | Huyết áp      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ── Tab: Chống Chỉ Định ──                   │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ ⛔ CRITICAL: Penicillin               │    │
│  │    Sốc phản vệ                       │    │
│  ├──────────────────────────────────────┤    │
│  │ ⚠️ HIGH: NSAIDs liều cao             │    │
│  │    Tăng nguy cơ xuất huyết (Aspirin)  │    │
│  └──────────────────────────────────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

---

### S10 – Guardian Dashboard

```
┌───────────────────────────────────────────────────────┐
│  ┌─────────┐                                          │
│  │ MEDTAG  │  Dashboard     [Trần Văn Vợ] [Logout]   │
│  │  PORTAL │                                          │
│  ├─────────┤──────────────────────────────────────────┤
│  │         │                                          │
│  │ 📊 Tổng │  Xin chào, Trần Văn Vợ!                │
│  │    quan │                                          │
│  │ 👤 Hồ sơ│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │ 📱 TB   │  │ 2      │ │ 3      │ │ 1      │      │
│  │ 📋 LS   │  │ Hồ sơ  │ │ Thiết  │ │ SOS    │      │
│  │    SOS  │  │ bệnh   │ │ bị     │ │ tháng  │      │
│  │ ⚙️ Cài  │  │ nhân   │ │ active │ │ này    │      │
│  │    đặt  │  └────────┘ └────────┘ └────────┘      │
│  │         │                                          │
│  │         │  ┌──────────────────────────────────┐    │
│  │         │  │ ⚠️ CẦN CHÚ Ý                     │    │
│  │         │  │                                  │    │
│  │         │  │ 🟠 Hồ sơ "Nguyễn Thị Bà" chưa   │    │
│  │         │  │    được xác nhận 7 tháng.         │    │
│  │         │  │    [Xác nhận ngay]                │    │
│  │         │  └──────────────────────────────────┘    │
│  │         │                                          │
│  │         │  ── Hồ sơ bệnh nhân ──                  │
│  │         │                                          │
│  │         │  ┌──────────────┐ ┌──────────────┐      │
│  │         │  │ 👴 Ông       │ │ 👵 Bà       │      │
│  │         │  │ Nguyễn Văn A │ │ Nguyễn Thị B│      │
│  │         │  │ O+ | 🟢 Fresh│ │ AB- | 🟠 Stale│   │
│  │         │  │ 2 thiết bị   │ │ 1 thiết bị   │      │
│  │         │  │ [Chi tiết]   │ │ [Chi tiết]   │      │
│  │         │  └──────────────┘ └──────────────┘      │
│  │         │                                          │
│  │         │  [+ Thêm hồ sơ bệnh nhân mới]           │
│  │         │                                          │
│  └─────────┘──────────────────────────────────────────┤
└───────────────────────────────────────────────────────┘
```

---

### S12 – Patient Create/Edit Form

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  Thêm Hồ Sơ Bệnh Nhân Mới                           │
│  ──────────────────────────                           │
│                                                       │
│  === THÔNG TIN CÁ NHÂN ===                           │
│                                                       │
│  Họ và tên: [_________________________]               │
│  Ngày sinh:  [___/___/______]                         │
│  Giới tính:  (●) Nam  ( ) Nữ  ( ) Khác               │
│  Ảnh chân dung: [📷 Tải lên] preview.webp            │
│                                                       │
│  === THÔNG TIN CẤP CỨU (Hiển thị công khai) ===     │
│                                                       │
│  Nhóm máu:   [▼ O+ ]                                 │
│  Dị ứng:     [Penicillin    ] [+ Thêm]               │
│              [Đậu phộng     ] [🗑️]                   │
│  Bệnh nền:   [Nhồi máu cơ tim] [+ Thêm]             │
│  SĐT khẩn cấp: [0901234567_____]                     │
│  Tên người LH:  [Trần Văn Vợ____]                    │
│                                                       │
│  === HỒ SƠ Y TẾ CHI TIẾT (Mã hóa AES-256) ===      │
│                                                       │
│  🔒 Dữ liệu này sẽ được mã hóa và chỉ bác sĩ      │
│     có quyền xem sau khi xác thực.                   │
│                                                       │
│  Bệnh mạn tính:                                      │
│  ┌──────────────────────────────────────┐             │
│  │ Tên bệnh: [Tiểu đường Type 2_____]  │             │
│  │ Ngày CĐ:  [15/03/2020]              │             │
│  │ Mức độ:   [▼ moderate]              │             │
│  │ BS điều trị: [Nguyễn Văn B_______]  │             │
│  │ Bệnh viện: [BV Chợ Rẫy___________] │             │
│  └──────────────────────────────────────┘             │
│  [+ Thêm bệnh mạn tính]                             │
│                                                       │
│  Thuốc đang dùng:                                     │
│  ┌──────────────────────────────────────┐             │
│  │ Tên thuốc: [Metformin 500mg_______]  │             │
│  │ Liều dùng: [2 lần/ngày (sáng, tối)]  │            │
│  │ Mục đích: [Kiểm soát đường huyết_]  │             │
│  └──────────────────────────────────────┘             │
│  [+ Thêm thuốc]                                      │
│                                                       │
│  Chống chỉ định:                                      │
│  ┌──────────────────────────────────────┐             │
│  │ Thuốc: [NSAIDs__________________]   │             │
│  │ Lý do: [Suy thận mạn GĐ 2______]   │             │
│  │ Mức độ: [▼ high]                    │             │
│  └──────────────────────────────────────┘             │
│  [+ Thêm chống chỉ định]                             │
│                                                       │
│  ┌────────────────┐  ┌────────────────┐               │
│  │    HỦY BỎ      │  │  LƯU HỒ SƠ   │               │
│  └────────────────┘  └────────────────┘               │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 3. Nguyên Tắc UI/UX

### 3.1. Emergency Screen (S03)
- **Cognitive Load Trimming:** Tối đa 4 khối thông tin, KHÔNG text mô tả thừa.
- **Đọc được trong 3 giây:** Under stress, user chỉ cần scan nhanh.
- **Contrast cao:** Nền trắng/xám, khối đen/đỏ/vàng/xanh nổi bật.
- **Font cực to:** Nhóm máu 60px, tên 30px, dị ứng 20px.
- **Mobile-first:** Max-width 448px, tối ưu cho smartphone một tay.

### 3.2. Portal (S10-S16)
- **Sidebar persistent:** Luôn hiển thị menu bên trái (desktop), hamburger (mobile).
- **Card-based layout:** Mỗi bệnh nhân là một card, dễ scan.
- **Status colors:** 🟢 Fresh, 🟠 Stale, 🔴 Expired.
- **Form validation:** Real-time, inline error messages.

### 3.3. Medical Dashboard (S07)
- **Professional, clinical feel:** Màu xanh nhạt, font rõ ràng.
- **Tab navigation:** Phân chia nội dung theo category.
- **Severity badges:** Critical (đỏ), High (cam), Moderate (vàng), Low (xanh).
- **Data Freshness Flag:** Luôn hiển thị ở header.

### 3.4. Color System

| Biến | Mã hex | Sử dụng |
|---|---|---|
| Primary | `#2563eb` (blue-600) | Buttons, links |
| Danger | `#dc2626` (red-600) | SOS, Alerts, Allergies |
| Success | `#059669` (emerald-600) | Confirmed, Fresh |
| Warning | `#f59e0b` (amber-500) | Stale, Caution |
| Dark | `#111827` (gray-900) | Blood type box |
| Surface | `#f9fafb` (gray-50) | Backgrounds |
| Card | `#ffffff` | Card backgrounds |
