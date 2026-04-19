# Phase 2: Emergency Public Gateway (Luồng 1)

> **Mục tiêu:** Xây dựng từ đầu luồng cấp cứu công khai: Quét QR → AntiSpam Gate → Xem Thông Tin → Bấm SOS → Gửi GPS.
> Đây là luồng **quan trọng nhất** vì demo trước ban giám khảo sẽ bắt đầu từ đây.

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/02_Use_Case_Specification.md` → UC-01 đến UC-05
- `02. PTTKHT/05_API_Specification.md` → Module Emergency
- `02. PTTKHT/06_Sequence_Diagrams.md` → Luồng 1 Bystander
- `02. PTTKHT/08_Screen_List_And_UI_Spec.md` → S01-S05

---

## Task 2.1: Backend – Tạo EmergencyService

**File mới:** `backend/src/emergency/emergency.service.ts`

**Logic:**
1. Inject `PrismaService`
2. Lookup bằng `device.shortId` → include `medicalRecord` + `guardian`
3. Map response format chuẩn (xem bên dưới)
4. KHÔNG trả `encryptedMedicalData` (bảo mật)

**Response format:**
```json
{
  "deviceId": "uuid",
  "patientName": "Nguyễn Văn A",
  "dateOfBirth": "1965-03-15",
  "gender": "MALE",
  "avatarUrl": "...",
  "bloodType": "O_POSITIVE",
  "bloodTypeDisplay": "O+",
  "allergies": ["Penicillin", "Đậu phộng"],
  "dangerousConditions": ["Nhồi máu cơ tim", "Huyết áp cao"],
  "emergencyContact": { "name": "Trần Văn Vợ", "phone": "0901234567" },
  "dataFreshness": "FRESH",
  "lastConfirmed": "2026-01-15T10:00:00Z"
}
```

**Thêm utility function** map BloodType enum → display string:
```typescript
function bloodTypeDisplay(bt: BloodType): string {
  const map = {
    A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
    O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
    AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
    UNKNOWN: '?'
  };
  return map[bt] || '?';
}
```

**Methods cần implement:**
```typescript
async getPublicProfile(shortId: string): Promise<EmergencyProfileResponse>
async triggerSOS(shortId: string, dto: TriggerSosDto, ip: string, ua: string): Promise<SOSResponse>
async cancelSOS(logId: string): Promise<void>
```

**Commit:** `feat: EmergencyService with public profile lookup and SOS trigger`

---

## Task 2.2: Backend – EmergencyController + DTOs

**File mới:** `backend/src/emergency/emergency.controller.ts`

**Endpoints (KHÔNG cần auth – public API):**
- `GET /api/emergency/:shortId` → Lấy thông tin công khai
- `POST /api/emergency/:shortId/sos` → Kích hoạt SOS
- `POST /api/emergency/:shortId/cancel` → Hủy SOS

### File mới: `backend/src/emergency/dto/trigger-sos.dto.ts`
```typescript
export class TriggerSosDto {
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
}
```

### File mới: `backend/src/emergency/dto/cancel-sos.dto.ts`
```typescript
export class CancelSosDto {
  @IsUUID() logId: string;
}
```

**Lưu ý:** Controller ghi nhận `bystanderIp` và `bystanderUA` từ request headers.

**Commit:** `feat: EmergencyController with SOS trigger, cancel, DTOs`

---

## Task 2.3: Backend – EmergencyModule + Wire AppModule

**File mới:** `backend/src/emergency/emergency.module.ts`

```typescript
@Module({
  controllers: [EmergencyController],
  providers: [EmergencyService],
})
export class EmergencyModule {}
```

**Cập nhật** `app.module.ts` → thêm `EmergencyModule` vào imports.

**Verification:**
```powershell
Invoke-RestMethod -Uri http://localhost:3001/api/emergency/X7K9A2
```

**Commit:** `feat: EmergencyModule wired into AppModule`

---

## Task 2.4: Frontend – TypeScript Types + API Client

**File mới:** `frontend/src/types/emergency.ts`

```typescript
export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface EmergencyProfile {
  deviceId: string;
  patientName: string;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  avatarUrl: string;
  bloodType: string;
  bloodTypeDisplay: string;
  allergies: string[];
  dangerousConditions: string[];
  emergencyContact: EmergencyContact;
  dataFreshness: 'FRESH' | 'STALE' | 'EXPIRED';
  lastConfirmed: string;
}

export interface SOSResponse {
  success: boolean;
  message: string;
  logId: string;
  mapsUrl?: string;
}
```

**File mới:** `frontend/src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchEmergencyProfile(shortId: string): Promise<EmergencyProfile> {
  const res = await fetch(`${API_URL}/emergency/${shortId}`);
  if (!res.ok) throw new Error('Mã thiết bị không hợp lệ hoặc đã hết hạn.');
  return res.json();
}

export async function triggerSOS(shortId: string, lat?: number, lng?: number): Promise<SOSResponse> {
  const res = await fetch(`${API_URL}/emergency/${shortId}/sos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });
  return res.json();
}
```

**Commit:** `feat: TypeScript types and API client for emergency`

---

## Task 2.5: Frontend – Tạo Landing Page (`/`)

**File:** `frontend/src/app/page.tsx` (overwrite default Next.js page)

**Thiết kế:**
- Logo MedTag + tagline "Cổng thông tin sơ cứu khẩn cấp"
- Input nhập ShortID (6 ký tự, VD: X7K9A2)
- Nút "Tra cứu" → redirect `/e/[shortId]`
- SEO metadata (title, description)
- Link "Đăng nhập Quản trị" ở footer (→ Portal + Medical login)
- Mobile-first, max-width 448px, responsive

**Commit:** `feat: landing page with ShortID input and SEO metadata`

---

## Task 2.6: Frontend – Tạo Emergency Page `/e/[shortId]`

**File mới:** `frontend/src/app/e/[shortId]/page.tsx`

**Logic:**
1. Lấy `shortId` từ URL params
2. Gọi `fetchEmergencyProfile(shortId)` từ `lib/api.ts`
3. Hiển thị AntiSpamGate trước → nhấn giữ → mở khóa
4. Sau khi verified → hiển thị thông tin bệnh nhân

**Cấu trúc component:**
```tsx
<AntiSpamGate onVerified={setIsVerified} />
{isVerified && (
  <>
    <VisualCheck avatar={profile.avatarUrl} />
    <ContactBox name={profile.patientName} contact={profile.emergencyContact} />
    <div className="grid grid-cols-2 gap-4">
      <BloodTypeBox type={profile.bloodTypeDisplay} />
      <AllergyBox items={profile.allergies} />
    </div>
    <ConditionBox items={profile.dangerousConditions} />
    <SOSButton shortId={shortId} />
    <DoctorLoginLink shortId={shortId} />
  </>
)}
```

**Ràng buộc UI (Cognitive Load Trimming):**
- Font cực to, dễ đọc trong tình huống khẩn cấp
- 4 khối màu: Black (Nhóm máu), Red (Dị ứng), Yellow (Bệnh nền), Green (Liên hệ)
- Mobile-first, max-width 448px

**Commit:** `feat: emergency page with typed API and sub-components`

---

## Task 2.7: Frontend – Tạo Emergency Sub-Components

Tạo **6 component mới** trong `frontend/src/components/emergency/`:

### `VisualCheck.tsx`
- Hiển thị ảnh chân dung + text "ĐỐI CHIẾU KHUÔN MẶT"
- 192x192px, rounded-3xl, border-4 white

### `BloodTypeBox.tsx`
- **Black box**, text-6xl cho blood type display (O+, A-, AB+...)
- Props: `{ type: string }`

### `AllergyBox.tsx`
- **Red box**, ⛔ icon, hiển thị danh sách dị ứng (array → bullets)
- Props: `{ items: string[] }`

### `ConditionBox.tsx`
- **Yellow/Amber box**, ⚠️ icon, danh sách bệnh nền
- Props: `{ items: string[] }`

### `ContactBox.tsx`
- **Green box**, hiển thị tên + giới tính + tuổi + SĐT liên hệ
- Nút gọi điện trực tiếp (`tel:`)
- Props: `{ name, gender, age, contact }`

### `DoctorLoginLink.tsx`
- Nút nhỏ "🏥 Đăng nhập Y Tế Đặc Quyền"
- Redirect tới `/medical/login?shortId=X7K9A2`

**Commit:** `feat: emergency sub-components (BloodType, Allergy, Condition, Contact, DoctorLoginLink)`

---

## Task 2.8: Frontend – Tạo AntiSpamGate Component

**File mới:** `frontend/src/components/emergency/AntiSpamGate.tsx`

**UX:**
- Hiển thị full-screen modal overlay
- Text: "Nhấn và giữ để xác nhận bạn là người thật"
- Nút tròn → nhấn giữ 2 giây → progress bar tròn chạy → mở khóa
- Animation: slide-up khi verified
- Icon khóa → mở khóa transition
- Accessibility: `aria-label`, `role="button"`
- Props: `{ onVerified: () => void }`

**Commit:** `feat: AntiSpamGate hold-to-unlock component`

---

## Task 2.9: Frontend – Tạo SOSButton Component

**File mới:** `frontend/src/components/emergency/SOSButton.tsx`

**Logic:**
1. Nhấn nút SOS → Bắt đầu xin GPS (`navigator.geolocation`)
2. Countdown 15 giây (vòng tròn quay ngược)
3. Sau 15 giây → Gọi `triggerSOS()` từ `lib/api.ts`
4. Hiển thị kết quả: "🚨 Đã phát tín hiệu cấp cứu!"
5. Hiển thị `mapsUrl` nếu có GPS
6. Vibration API: `navigator.vibrate([200, 100, 200])` khi SOS trigger
7. Có nút "HỦY" trong lúc countdown
8. Fallback message khi GPS bị từ chối

**Commit:** `feat: SOSButton with 15s countdown, GPS, vibration`

---

## Task 2.10: Frontend – Loading Skeleton + Error States

### File mới: `frontend/src/app/e/[shortId]/loading.tsx`
- Skeleton UI (animate-pulse): skeleton avatar + 4 skeleton boxes
- Tailwind: `bg-gray-200 animate-pulse rounded-xl`

### Error handling trong `page.tsx`:
- Nếu API trả 404: "Mã thiết bị không hợp lệ"
- Nếu network error: "Không thể kết nối server"
- Retry button

**Commit:** `feat: loading skeleton and error states for emergency page`

---

## ✅ Checklist Phase 2

- [ ] Task 2.1: EmergencyService (tạo mới)
- [ ] Task 2.2: EmergencyController + DTOs (tạo mới)
- [ ] Task 2.3: EmergencyModule + Wire AppModule
- [ ] Task 2.4: TypeScript types + API client (tạo mới)
- [ ] Task 2.5: Landing page (tạo mới)
- [ ] Task 2.6: Emergency page `/e/[shortId]` (tạo mới)
- [ ] Task 2.7: Emergency sub-components – 6 files (tạo mới)
- [ ] Task 2.8: AntiSpamGate component (tạo mới)
- [ ] Task 2.9: SOSButton component (tạo mới)
- [ ] Task 2.10: Loading skeleton + error states (tạo mới)

**Verification:** Mở browser → `http://localhost:3000/e/X7K9A2` → Phải thấy:
1. AntiSpam Gate modal → nhấn giữ → mở khóa
2. Avatar + Green/Black/Red/Yellow boxes
3. SOS button → countdown 15s → GPS request → API call thành công

**Khi tất cả ✅ → Phase 2 DONE. Phase 4 có thể bắt đầu.**

---

## 🤖 Prompt Template Cho AI Agent (Phase 2)

```
Ngữ cảnh: Dự án MedTag – Tôi đang ở Phase 2: Emergency Public Gateway.
Đây là luồng Bystander quét QR → xem thông tin → bấm SOS.
Chúng tôi đang xây dựng từ đầu (KHÔNG có code cũ).

Hãy đọc các file sau:
- 02. PTTKHT/05_API_Specification.md (Section 2: Module Emergency)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (Section S03: Emergency Info View)
- backend/prisma/schema.prisma (Schema)
- frontend/src/types/emergency.ts (Types)
- frontend/src/lib/api.ts (API client)

Task: [MÔ TẢ CỤ THỂ]

Ràng buộc:
- Frontend: TypeScript strict, dùng interface EmergencyProfile (không any)
- UI phải tuân thủ Cognitive Load Trimming: Font cực to, 4 khối màu
- Mobile-first, max-width 448px
- Có xử lý error states (404, network error)
```
