# Phase 2: Emergency Public Gateway (Luồng 1)

> **Mục tiêu:** Hoàn thiện luồng cấp cứu công khai: Quét QR → AntiSpam Gate → Xem Thông Tin → Bấm SOS → Gửi GPS.
> Đây là luồng **quan trọng nhất** vì demo trước ban giám khảo sẽ bắt đầu từ đây.

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/02_Use_Case_Specification.md` → UC-01 đến UC-05
- `02. PTTKHT/05_API_Specification.md` → Module Emergency
- `02. PTTKHT/06_Sequence_Diagrams.md` → Luồng 1 Bystander
- `02. PTTKHT/08_Screen_List_And_UI_Spec.md` → S01-S05

---

## Task 2.1: Refactor EmergencyService (Dùng PrismaService + Cache)

**Vấn đề hiện tại:** Service dùng `new PrismaClient()` trực tiếp, không có caching.

**File:** `backend/src/emergency/emergency.service.ts`

**Thay đổi:**
1. Inject `PrismaService` thay vì tạo `new PrismaClient()`
2. Inject `CacheService` cho Redis caching
3. Cập nhật query cho schema mới (BloodType enum, Json arrays, shortId tách riêng)
4. Lookup bằng `device.shortId` thay vì `device.qrCode`

**Logic caching:**
```
GET /api/emergency/:shortId
  → CacheService.get(`emergency:public:${shortId}`)
  → Cache Hit? Return cached data
  → Cache Miss? Query DB → Set cache (TTL: 300s) → Return
```

**Response format mới (theo API Spec):**
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

**Kiểm tra:**
```bash
curl http://localhost:3001/api/emergency/X7K9A2
```

**Commit:** `refactor: EmergencyService with PrismaService, Redis cache, new schema`

---

## Task 2.2: Refactor EmergencyController + SOS DTO

**File:** `backend/src/emergency/emergency.controller.ts`

**Thêm:**
- DTO validation cho SOS request body
- Endpoint hủy SOS: `POST /api/emergency/:shortId/cancel`
- Ghi nhận `bystanderIp` và `bystanderUA` từ request

### `backend/src/emergency/dto/trigger-sos.dto.ts`
```typescript
export class TriggerSosDto {
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
}
```

### `backend/src/emergency/dto/cancel-sos.dto.ts`
```typescript
export class CancelSosDto {
  @IsUUID() logId: string;
}
```

**Commit:** `feat: EmergencyController with SOS trigger, cancel, DTOs`

---

## Task 2.3: Update EmergencyModule imports

**File:** `backend/src/emergency/emergency.module.ts`

```typescript
@Module({
  imports: [PrismaModule, CacheModule],
  controllers: [EmergencyController],
  providers: [EmergencyService],
})
export class EmergencyModule {}
```

*Note: NotificationModule sẽ được thêm ở Phase 5.*

**Commit:** `feat: update EmergencyModule imports`

---

## Task 2.4: Frontend – TypeScript Types

**File:** `frontend/src/types/emergency.ts` (MỚI)

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

**File:** `frontend/src/lib/api.ts` (MỚI)

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

**Commit:** `feat: add TypeScript types and API client for emergency`

---

## Task 2.5: Frontend – Refactor Landing Page (`/`)

**File:** `frontend/src/app/page.tsx`

**Thay đổi:**
- Giữ nguyên UX hiện tại (đã tốt)
- Cập nhật import path nếu cần
- Đảm bảo SEO metadata (title, description)
- Thêm link "Đăng nhập Quản trị" ở footer (dropdown cho Portal + Medical login)

**Commit:** `refactor: update landing page with SEO metadata`

---

## Task 2.6: Frontend – Refactor Emergency Page `/e/[shortId]`

**File:** `frontend/src/app/e/[shortId]/page.tsx`

**Thay đổi:**
1. Sử dụng `EmergencyProfile` type thay vì `any`
2. Gọi `fetchEmergencyProfile()` từ `lib/api.ts`
3. Tách UI thành sub-components (import từ `components/emergency/`)
4. Handle `allergies` là array thay vì string
5. Tính tuổi từ `dateOfBirth`
6. Hiển thị `bloodTypeDisplay` thay vì enum raw value
7. Thêm nút "Đăng nhập Y Tế Đặc Quyền" (redirect `/medical/login?shortId=X7K9A2`)

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

**Commit:** `refactor: emergency page with typed API, sub-components`

---

## Task 2.7: Frontend – Tách Emergency Sub-Components

Tạo/refactor các component riêng biệt:

### `frontend/src/components/emergency/VisualCheck.tsx`
- Hiển thị ảnh chân dung + text "ĐỐI CHIẾU KHUÔN MẶT"
- 192x192px, rounded-3xl, border-4 white

### `frontend/src/components/emergency/BloodTypeBox.tsx`
- Black box, text-6xl cho blood type display
- Props: `{ type: string }`

### `frontend/src/components/emergency/AllergyBox.tsx`
- Red box, hiển thị danh sách dị ứng (array → bullets)
- Props: `{ items: string[] }`

### `frontend/src/components/emergency/ConditionBox.tsx`
- Yellow/Amber box, ⚠️ icon, danh sách bệnh nền
- Props: `{ items: string[] }`

### `frontend/src/components/emergency/ContactBox.tsx`
- Green box, hiển thị tên + giới tính + tuổi + SĐT liên hệ
- Props: `{ name, gender, age, contact }`

### `frontend/src/components/emergency/DoctorLoginLink.tsx` (MỚI)
- Nút nhỏ "🏥 Đăng nhập Y Tế Đặc Quyền"
- Redirect tới `/medical/login?shortId=X7K9A2`

**Commit:** `feat: create emergency sub-components (BloodType, Allergy, Condition, Contact, DoctorLoginLink)`

---

## Task 2.8: Frontend – Refactor AntiSpamGate

**File:** `frontend/src/components/emergency/AntiSpamGate.tsx`

**Cải thiện:**
- Giữ nguyên UX hold-to-unlock (đã tốt)
- Thêm animation slide-up khi đã verified
- Thêm icon khóa → mở khóa transition
- Accessibility: `aria-label`, `role="button"`

**Commit:** `refactor: improve AntiSpamGate animations and accessibility`

---

## Task 2.9: Frontend – Refactor SOSButton

**File:** `frontend/src/components/emergency/SOSButton.tsx`

**Thay đổi:**
1. Gọi `triggerSOS()` từ `lib/api.ts` thay vì inline fetch
2. Hiển thị `mapsUrl` trong kết quả SOS nếu có GPS
3. Thêm fallback message khi GPS bị từ chối
4. Improve circle countdown animation (smoother)
5. Thêm vibration API: `navigator.vibrate([200, 100, 200])` khi SOS trigger

**Commit:** `refactor: SOSButton with API client, vibration, improved countdown`

---

## Task 2.10: Frontend – Loading Skeleton + Error Page

### `frontend/src/app/e/[shortId]/loading.tsx` (MỚI)
```tsx
// Skeleton UI hiển thị khi đang fetch data
// Gồm: skeleton avatar + 4 skeleton boxes
// Tailwind: animate-pulse bg-gray-200
```

### Error handling trong page.tsx
```tsx
// Nếu API trả 404: "Mã thiết bị không hợp lệ"
// Nếu network error: "Không thể kết nối server"
// Nếu mất mạng (offline): Service Worker sẽ handle ở Phase 5
```

**Commit:** `feat: add loading skeleton and error states for emergency page`

---

## ✅ Checklist Phase 2

- [ ] Task 2.1: EmergencyService refactor (PrismaService + Cache)
- [ ] Task 2.2: EmergencyController + SOS DTO + Cancel endpoint
- [ ] Task 2.3: EmergencyModule imports
- [ ] Task 2.4: TypeScript types + API client
- [ ] Task 2.5: Landing page refactor
- [ ] Task 2.6: Emergency page refactor (typed, sub-components)
- [ ] Task 2.7: Emergency sub-components (6 files)
- [ ] Task 2.8: AntiSpamGate improvements
- [ ] Task 2.9: SOSButton refactor
- [ ] Task 2.10: Loading skeleton + error states

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

Hãy đọc các file sau:
- 02. PTTKHT/05_API_Specification.md (Section 2: Module Emergency)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (Section S03: Emergency Info View)
- backend/src/emergency/emergency.service.ts (Service hiện tại)
- frontend/src/app/e/[shortId]/page.tsx (Page hiện tại)
- backend/prisma/schema.prisma (Schema mới)

Task: [MÔ TẢ CỤ THỂ]

Ràng buộc:
- Frontend: TypeScript strict, dùng interface EmergencyProfile (không any)
- UI phải tuân thủ Cognitive Load Trimming: Font cực to, 4 khối màu
- Mobile-first, max-width 448px
- Có xử lý error states (404, network error)
```
