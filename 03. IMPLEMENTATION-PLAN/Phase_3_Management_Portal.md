# Phase 3: Management Portal (Luồng 3 – Guardian)

> **Mục tiêu:** Xây dựng Dashboard cho Người Giám Hộ: Đăng nhập/Đăng ký, CRUD hồ sơ bệnh nhân, liên kết thiết bị QR, xem lịch sử SOS.
> Phase này có thể chạy **SONG SONG** với Phase 2 bởi một Vibecoder khác.

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/02_Use_Case_Specification.md` → UC-06 đến UC-11
- `02. PTTKHT/05_API_Specification.md` → Module Portal + Auth
- `02. PTTKHT/08_Screen_List_And_UI_Spec.md` → S08-S16
- `02. PTTKHT/09_Module_Dependency_Map.md` → Portal component tree

---

## Task 3.1: Backend – Tạo PortalModule

### Cấu trúc file:
```
backend/src/portal/
├── portal.module.ts
├── portal.controller.ts
├── portal.service.ts
└── dto/
    ├── create-medical-record.dto.ts
    ├── update-medical-record.dto.ts
    ├── create-device.dto.ts
    └── query-params.dto.ts
```

### `portal.module.ts`
```typescript
@Module({
  imports: [AuthModule, CryptoModule, CacheModule],
  controllers: [PortalController],
  providers: [PortalService],
})
export class PortalModule {}
```

**Commit:** `feat: scaffold PortalModule structure`

---

## Task 3.2: Backend – Portal DTOs (Validation)

### `create-medical-record.dto.ts`
```typescript
export class CreateMedicalRecordDto {
  @IsString() @MinLength(2) patientName: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsEnum(BloodType) bloodType?: BloodType;
  @IsOptional() @IsArray() @IsString({ each: true }) allergies?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) dangerousConditions?: string[];
  @IsOptional() @IsString() emergencyPhone?: string;
  @IsOptional() @IsString() emergencyContactName?: string;
  @IsOptional() @IsObject() detailedMedicalData?: any;
  // detailedMedicalData sẽ được encrypt trước khi lưu DB
}
```

### `create-device.dto.ts`
```typescript
export class CreateDeviceDto {
  @IsString() @Length(6, 6) shortId: string;
  @IsOptional() @IsString() qrCode?: string;  // Auto-generate nếu không có
  @IsUUID() medicalRecordId: string;
  @IsOptional() @IsString() label?: string;
}
```

**Commit:** `feat: Portal DTOs with class-validator`

---

## Task 3.3: Backend – PortalService (CRUD Logic)

**File:** `backend/src/portal/portal.service.ts`

### Các method cần implement:

```typescript
// === Medical Records ===
// Tất cả đều filter theo guardianId = currentUser.id

async getMyRecords(userId: string): Promise<MedicalRecord[]>
// SELECT * FROM MedicalRecord WHERE guardianId = userId (include devices count, logs count)

async getRecordById(userId: string, recordId: string): Promise<MedicalRecord>
// Verify guardianId = userId → return record with devices & logs

async createRecord(userId: string, dto: CreateMedicalRecordDto): Promise<MedicalRecord>
// 1. Lưu public fields (bloodType, allergies, dangerousConditions) plaintext
// 2. Nếu dto.detailedMedicalData có → JSON.stringify → CryptoService.encrypt → lưu encryptedMedicalData
// 3. Invalidate Redis cache cho tất cả devices liên kết

async updateRecord(userId: string, recordId: string, dto: UpdateMedicalRecordDto): Promise<MedicalRecord>
// Verify ownership → update → invalidate cache

async deleteRecord(userId: string, recordId: string): Promise<void>
// Soft delete hoặc cascade delete devices + logs

async confirmDataFreshness(userId: string, recordId: string): Promise<MedicalRecord>
// SET dataFreshnessStatus = FRESH, dataConfirmedAt = NOW()

// === Devices ===
async getMyDevices(userId: string, medicalRecordId?: string): Promise<Device[]>
async linkDevice(userId: string, dto: CreateDeviceDto): Promise<Device>
// Check shortId unique → verify medicalRecordId belongs to user → create
async unlinkDevice(userId: string, deviceId: string): Promise<void>
// Verify ownership → delete device → invalidate cache

// === Emergency Logs ===
async getEmergencyLogs(userId: string, filters: QueryParamsDto): Promise<PaginatedResult<EmergencyLog>>
// Get all logs for records owned by this user, paginated

// === Avatar Upload ===
async updateAvatar(userId: string, recordId: string, avatarUrl: string): Promise<MedicalRecord>
```

**Commit:** `feat: PortalService CRUD for records, devices, logs`

---

## Task 3.4: Backend – PortalController (Routes + Guards)

**File:** `backend/src/portal/portal.controller.ts`

```typescript
@Controller('portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GUARDIAN)
export class PortalController {

  // === Medical Records ===
  @Get('medical-records')
  async getMyRecords(@CurrentUser() user) { ... }

  @Get('medical-records/:id')
  async getRecord(@CurrentUser() user, @Param('id') id) { ... }

  @Post('medical-records')
  async createRecord(@CurrentUser() user, @Body() dto: CreateMedicalRecordDto) { ... }

  @Put('medical-records/:id')
  async updateRecord(@CurrentUser() user, @Param('id') id, @Body() dto) { ... }

  @Delete('medical-records/:id')
  async deleteRecord(@CurrentUser() user, @Param('id') id) { ... }

  @Post('medical-records/:id/confirm-freshness')
  async confirmFreshness(@CurrentUser() user, @Param('id') id) { ... }

  // === Devices ===
  @Get('devices')
  async getDevices(@CurrentUser() user, @Query('medicalRecordId') recordId?) { ... }

  @Post('devices')
  async linkDevice(@CurrentUser() user, @Body() dto: CreateDeviceDto) { ... }

  @Delete('devices/:id')
  async unlinkDevice(@CurrentUser() user, @Param('id') id) { ... }

  // === Emergency Logs ===
  @Get('emergency-logs')
  async getLogs(@CurrentUser() user, @Query() query: QueryParamsDto) { ... }

  // === Avatar ===
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@CurrentUser() user, @UploadedFile() file, @Body('medicalRecordId') recordId) { ... }
}
```

**Kiểm tra (PowerShell):**
```powershell
# Login trước
$loginResp = Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"nguoithan@medtag.vn","password":"123456"}'
$token = $loginResp.access_token

# Get records
Invoke-RestMethod -Uri http://localhost:3001/api/portal/medical-records -Headers @{Authorization="Bearer $token"}

# Create record
Invoke-RestMethod -Uri http://localhost:3001/api/portal/medical-records -Method Post -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body '{"patientName":"Test Patient","bloodType":"A_POSITIVE","allergies":["Aspirin"]}'
```

**Commit:** `feat: PortalController with all CRUD routes + auth guards`

---

## Task 3.5: Frontend – Auth Types & Hooks

### `frontend/src/types/user.ts` (MỚI)
```typescript
export type Role = 'GUARDIAN' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}
```

### `frontend/src/hooks/useAuth.ts` (MỚI)
```typescript
// Hook quản lý authentication state:
// - login(email, password) → save token to localStorage
// - register(data) → save token
// - logout() → clear token
// - user: User | null → from /api/auth/me
// - isAuthenticated: boolean
// - isLoading: boolean
```

### `frontend/src/lib/auth.ts` (MỚI)
```typescript
// Token management:
// - getToken(): string | null → from localStorage
// - setToken(token: string): void
// - removeToken(): void
// - isTokenExpired(token: string): boolean
```

### Cập nhật `frontend/src/lib/api.ts`
```typescript
// Thêm các functions có auth header:
export async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: { ...options?.headers, Authorization: `Bearer ${token}` },
  });
}
```

**Commit:** `feat: auth types, useAuth hook, token management`

---

## Task 3.6: Frontend – Guardian Login & Register Pages

### `frontend/src/app/portal/login/page.tsx` (MỚI)
```
Màn hình gồm:
- Logo MedTag
- Form: Email + Password
- Nút "Đăng nhập"
- Link "Chưa có tài khoản? Đăng ký"
- Error toast khi login fail
- Redirect → /portal/dashboard khi login thành công
```

### `frontend/src/app/portal/register/page.tsx` (MỚI)
```
Form gồm:
- Họ tên
- Email
- Số điện thoại (optional)
- Mật khẩu
- Xác nhận mật khẩu
- Nút "Đăng ký"
- Validation bằng react-hook-form + zod
```

**Commit:** `feat: Guardian login and register pages`

---

## Task 3.7: Frontend – Portal Layout + AuthGuard

### `frontend/src/app/portal/layout.tsx` (MỚI)
```tsx
// Layout cho toàn bộ /portal/* routes:
// - AuthGuard: check token → redirect /portal/login nếu chưa login
// - Sidebar (desktop) / Hamburger (mobile)
// - Header với user info + logout button
// - Main content area
```

### `frontend/src/components/layout/AuthGuard.tsx` (MỚI)
```tsx
// Higher-order component:
// - Kiểm tra useAuth().isAuthenticated
// - Nếu false → redirect('/portal/login')
// - Nếu true → render children
// - Hiển thị loading skeleton trong khi check
```

### `frontend/src/components/portal/Sidebar.tsx` (MỚI)
```tsx
// Navigation menu items:
// 📊 Tổng quan (/portal/dashboard)
// 👤 Hồ sơ bệnh nhân (/portal/patients)
// 📱 Thiết bị (/portal/devices)
// 📋 Lịch sử SOS (/portal/emergency-logs)
// ⚙️ Cài đặt (/portal/settings)
```

**Commit:** `feat: Portal layout with Sidebar, AuthGuard`

---

## Task 3.8: Frontend – Dashboard Overview

### `frontend/src/app/portal/dashboard/page.tsx` (MỚI)

**Nội dung hiển thị:**
1. **Stats cards:** Số hồ sơ, Số thiết bị active, Số SOS tháng này
2. **Alert banner** (nếu có record STALE/EXPIRED): "⚠️ Hồ sơ X chưa được xác nhận N tháng. [Xác nhận ngay]"
3. **Patient cards:** Danh sách hồ sơ dạng card (tên, nhóm máu, freshness badge, số thiết bị)
4. **Nút:** "+ Thêm hồ sơ bệnh nhân mới" → redirect `/portal/patients/new`

**Commit:** `feat: Guardian dashboard with stats, alerts, patient cards`

---

## Task 3.9: Frontend – Patient CRUD Pages

### `frontend/src/app/portal/patients/page.tsx` – Patient List
- Grid/List các PatientCard
- Filter: Tất cả / Fresh / Stale / Expired
- Nút "Thêm mới"

### `frontend/src/app/portal/patients/new/page.tsx` – Create Form
- Form 3 sections (xem wireframe S12 trong UI Spec):
  1. Thông tin cá nhân (tên, DOB, giới tính, ảnh)
  2. Thông tin cấp cứu Public (nhóm máu, dị ứng, bệnh nền, SĐT khẩn cấp)
  3. Hồ sơ y tế chi tiết (bệnh mạn tính, thuốc, chống chỉ định) → mã hóa AES-256
- Dynamic form arrays: "Thêm dị ứng", "Thêm thuốc", "Thêm bệnh mạn tính"
- Validation bằng react-hook-form + zod
- Submit → POST /api/portal/medical-records

### `frontend/src/app/portal/patients/[id]/page.tsx` – Patient Detail
- Hiển thị toàn bộ thông tin (public section)
- Danh sách thiết bị đã liên kết
- Lịch sử SOS
- Nút "Chỉnh sửa" → redirect edit page
- Nút "Xác nhận dữ liệu" (nếu STALE/EXPIRED)

### `frontend/src/app/portal/patients/[id]/edit/page.tsx` – Edit Form
- Pre-fill form từ data hiện tại
- Submit → PUT /api/portal/medical-records/:id

**Commit:** `feat: Patient list, create, detail, edit pages`

---

## Task 3.10: Frontend – Device Management

### `frontend/src/app/portal/devices/page.tsx` (MỚI)

**Hiển thị:**
- Bảng tất cả thiết bị: ShortID | Label | Linked To | Status | Actions
- Nút "Liên kết thiết bị mới" → Modal form

### `frontend/src/components/portal/DeviceLinkForm.tsx` (MỚI)
```
Modal form:
- Select hồ sơ bệnh nhân (dropdown)
- Nhập ShortID (6 ký tự, uppercase)
- Nhãn thiết bị (VD: "Vòng tay Ông")
- Submit → POST /api/portal/devices
```

- Nút "Hủy liên kết" → ConfirmDialog → DELETE /api/portal/devices/:id

**Commit:** `feat: Device management page with link/unlink`

---

## Task 3.11: Frontend – Emergency Log History

### `frontend/src/app/portal/emergency-logs/page.tsx` (MỚI)

**Hiển thị:**
- Bảng lịch sử SOS: Thời gian | Bệnh nhân | Trạng thái | Vị trí | Actions
- Filter: Tất cả / TRIGGERED / CANCELLED / RESOLVED
- Pagination
- Click "Vị trí" → mở Google Maps link

**Commit:** `feat: Emergency log history page with filters and pagination`

---

## Task 3.12: Frontend – UI Components bổ sung

Tạo các shared components còn thiếu:

### `frontend/src/components/ui/Input.tsx`
### `frontend/src/components/ui/Select.tsx`
### `frontend/src/components/ui/Badge.tsx`
### `frontend/src/components/ui/Toast.tsx` (wrapper react-hot-toast)
### `frontend/src/components/ui/Skeleton.tsx`
### `frontend/src/components/ui/DataTable.tsx`
### `frontend/src/components/ui/ConfirmDialog.tsx`

**Commit:** `feat: add shared UI components (Input, Select, Badge, DataTable, etc.)`

---

## ✅ Checklist Phase 3

- [ ] Task 3.1: PortalModule scaffold
- [ ] Task 3.2: Portal DTOs
- [ ] Task 3.3: PortalService (CRUD logic)
- [ ] Task 3.4: PortalController (routes + guards)
- [ ] Task 3.5: Auth types & hooks
- [ ] Task 3.6: Login & Register pages
- [ ] Task 3.7: Portal layout + AuthGuard + Sidebar
- [ ] Task 3.8: Dashboard overview
- [ ] Task 3.9: Patient CRUD (list, create, detail, edit)
- [ ] Task 3.10: Device management
- [ ] Task 3.11: Emergency log history
- [ ] Task 3.12: Shared UI components

**Verification:**
1. Đăng ký tài khoản → Đăng nhập → xem Dashboard
2. Tạo hồ sơ bệnh nhân mới → verify dữ liệu lưu trong DB
3. Liên kết thiết bị (ShortID) → Quét QR (Phase 2) hiển thị data đúng
4. Xem lịch sử SOS (nếu đã trigger ở Phase 2)

---

## 🤖 Prompt Template (Phase 3)

```
Ngữ cảnh: Dự án MedTag – Phase 3: Management Portal cho Guardian.

Hãy đọc:
- 02. PTTKHT/05_API_Specification.md (Section 4: Module Portal)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (S08-S16)
- backend/prisma/schema.prisma

Task: [MÔ TẢ CỤ THỂ]

Ràng buộc:
- Tất cả routes trong /portal/* phải có JwtAuthGuard + RolesGuard(GUARDIAN)
- Frontend phải check auth trước khi render (AuthGuard component)
- Form validation bằng react-hook-form + zod
- Responsive: Sidebar desktop, Hamburger mobile
```
