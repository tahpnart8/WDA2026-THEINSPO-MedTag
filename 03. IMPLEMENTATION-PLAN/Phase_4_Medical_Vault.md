# Phase 4: Secure Medical Vault (Luồng 2 – Bác Sĩ)

> **Mục tiêu:** Xây dựng cổng y tế đặc quyền: Bác sĩ đăng nhập → Hệ thống giải mã AES-256 → Hiển thị toàn bộ bệnh án chi tiết.
> **Dependency:** Cần Phase 1 (Auth, Crypto) + Phase 2 (Emergency page có nút "Đăng nhập Y Tế").

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/02_Use_Case_Specification.md` → UC-12, UC-13, UC-14
- `02. PTTKHT/05_API_Specification.md` → Module Medical
- `02. PTTKHT/06_Sequence_Diagrams.md` → Luồng 2 Bác sĩ
- `02. PTTKHT/08_Screen_List_And_UI_Spec.md` → S06, S07

---

## Task 4.1: Backend – Tạo MedicalModule

### Cấu trúc file:
```
backend/src/medical/
├── medical.module.ts
├── medical.controller.ts
├── medical.service.ts
└── dto/
    └── medical-query.dto.ts
```

### `medical.module.ts`
```typescript
@Module({
  imports: [AuthModule, CryptoModule],
  controllers: [MedicalController],
  providers: [MedicalService],
})
export class MedicalModule {}
```

**Cập nhật** `app.module.ts` → import `MedicalModule`.

**Commit:** `feat: scaffold MedicalModule`

---

## Task 4.2: Backend – MedicalService (Giải mã AES-256)

**File:** `backend/src/medical/medical.service.ts`

```typescript
@Injectable()
export class MedicalService {
  constructor(
    private prisma: PrismaService,
    private crypto: CryptoService,
  ) {}

  async getFullMedicalRecord(shortId: string) {
    // 1. Find device by shortId → include medicalRecord + guardian
    // 2. Extract public data (bloodType, allergies, etc.)
    // 3. Decrypt encryptedMedicalData → JSON.parse
    // 4. Calculate data freshness info
    // 5. Return combined response

    const device = await this.prisma.device.findUnique({
      where: { shortId },
      include: {
        medicalRecord: {
          include: { guardian: true },
        },
      },
    });

    if (!device?.medicalRecord) {
      throw new NotFoundException('Không tìm thấy hồ sơ y tế.');
    }

    const mr = device.medicalRecord;

    // Giải mã dữ liệu nhạy cảm
    let decryptedMedicalData = null;
    if (mr.encryptedMedicalData) {
      try {
        const plaintext = this.crypto.decrypt(mr.encryptedMedicalData);
        decryptedMedicalData = JSON.parse(plaintext);
      } catch (err) {
        // Log lỗi nhưng không throw → cho bác sĩ vẫn xem được public data
        decryptedMedicalData = { error: 'Không thể giải mã dữ liệu.' };
      }
    }

    // Tính Data Freshness
    const daysSinceConfirmed = Math.floor(
      (Date.now() - new Date(mr.dataConfirmedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      publicData: {
        patientName: mr.patientName,
        dateOfBirth: mr.dateOfBirth,
        gender: mr.gender,
        bloodType: mr.bloodType,
        allergies: mr.allergies,
        dangerousConditions: mr.dangerousConditions,
        avatarUrl: mr.avatarUrl,
        emergencyContact: {
          name: mr.emergencyContactName || mr.guardian.fullName,
          phone: mr.emergencyPhone || mr.guardian.phoneNumber,
        },
      },
      decryptedMedicalData,
      dataFreshness: {
        status: mr.dataFreshnessStatus,
        lastConfirmedAt: mr.dataConfirmedAt,
        daysSinceConfirmed,
      },
      accessedAt: new Date().toISOString(),
    };
  }
}
```

**Commit:** `feat: MedicalService with AES-256 decryption`

---

## Task 4.3: Backend – MedicalController (Protected Route)

**File:** `backend/src/medical/medical.controller.ts`

```typescript
@Controller('medical')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
export class MedicalController {
  constructor(private medicalService: MedicalService) {}

  @Get(':shortId')
  async getFullRecord(
    @Param('shortId') shortId: string,
    @CurrentUser() doctor: User,
    @Req() req: Request,
  ) {
    const record = await this.medicalService.getFullMedicalRecord(shortId);

    // Ghi AuditLog
    await this.medicalService.logAccess({
      action: 'VIEW_MEDICAL_RECORD',
      userId: doctor.id,
      targetId: shortId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return record;
  }
}
```

**Kiểm tra (PowerShell):**
```powershell
# Login as doctor
$loginResp = Invoke-RestMethod -Uri http://localhost:3001/api/auth/login -Method Post -ContentType "application/json" -Body '{"email":"bacsi@medtag.vn","password":"123456"}'
$token = $loginResp.access_token

# Get decrypted record
Invoke-RestMethod -Uri http://localhost:3001/api/medical/X7K9A2 -Headers @{Authorization="Bearer $token"}

# Verify: response phải chứa decryptedMedicalData với JSON bệnh án đã giải mã
# Verify: AuditLog phải có bản ghi mới
```

**Commit:** `feat: MedicalController with Doctor auth guard and audit logging`

---

## Task 4.4: Frontend – Doctor Login Page

### `frontend/src/app/medical/login/page.tsx` (MỚI)

**Thiết kế:**
- Logo MedTag + "🏥 Cổng Y Tế Đặc Quyền"
- Form: Email + Mật khẩu
- *(MVP Text notice):* "Trong phiên bản MVP, vui lòng đăng nhập bằng tài khoản Bác sĩ đã được cấp."
- *(Future banner):* "Tích hợp SSO VNeID sẽ ra mắt trong phiên bản chính thức"
- Nút "Đăng Nhập"
- Sau login → redirect `/medical/[shortId]` (shortId lấy từ query param)
- Giao diện nghiêm trang, professional (xanh nhạt thay vì xanh emerald)

**Commit:** `feat: Doctor login page (Mock SSO)`

---

## Task 4.5: Frontend – Medical Dashboard (Doctor View)

### `frontend/src/app/medical/[shortId]/page.tsx` (MỚI)

**Thiết kế (xem wireframe S07):**

**Header section:**
- Tên bác sĩ + Chứng chỉ hành nghề
- Thông tin bệnh nhân (tên, DOB, giới tính, nhóm máu)
- **Data Freshness Flag:** `FreshnessFlag` component
  - 🟢 FRESH: "Dữ liệu đáng tin cậy (X ngày trước)"
  - 🟠 STALE: "⚠️ Cần xác nhận lại (N tháng)"  
  - 🔴 EXPIRED: "🚨 Dữ liệu có thể không chính xác (>12 tháng)"

**Tab Navigation:**
```tsx
<Tabs defaultValue="history">
  <Tab value="history" label="Tiền sử bệnh lý" />
  <Tab value="medications" label="Thuốc đang dùng" />
  <Tab value="lab" label="Xét nghiệm" />
  <Tab value="contraindications" label="Chống chỉ định" />
  <Tab value="insurance" label="Bảo hiểm" />
</Tabs>
```

**Components cần tạo:**

### `frontend/src/components/medical/MedicalHistory.tsx`
- Bệnh mạn tính: List cards (tên, ngày chẩn đoán, mức độ, BS, BV)
- Phẫu thuật: Timeline cards
- Tiền sử gia đình: Text block

### `frontend/src/components/medical/MedicationList.tsx`
- Danh sách thuốc dạng cards
- Mỗi card: Tên thuốc, liều dùng, mục đích, BS kê đơn
- Badge: "Đang dùng" (xanh) / "Đã ngừng" (xám)

### `frontend/src/components/medical/LabResults.tsx`
- Bảng kết quả xét nghiệm
- Highlight nếu result ngoài normal range (red text)

### `frontend/src/components/medical/Contraindications.tsx`
- List warnings với severity badges
- CRITICAL: Red background
- HIGH: Orange background
- Moderate: Yellow background

### `frontend/src/components/medical/FreshnessFlag.tsx`
- Banner component hiển thị ở đầu trang
- Color-coded theo status

**Commit:** `feat: Medical dashboard with tabs (history, meds, lab, contraindications)`

---

## Task 4.6: Frontend – AuthGuard cho Medical Routes

### Cập nhật `frontend/src/components/layout/AuthGuard.tsx`

Mở rộng AuthGuard để kiểm tra role:
```tsx
// AuthGuard({ requiredRole?: 'GUARDIAN' | 'DOCTOR' })
// Nếu role = DOCTOR → chỉ cho phép truy cập /medical/*
// Nếu role = GUARDIAN → chỉ cho phép truy cập /portal/*
```

**Commit:** `feat: extend AuthGuard with role-based routing`

---

## Task 4.7: Integration Test – Full Doctor Flow

**Test thủ công:**
1. Mở `http://localhost:3000/e/X7K9A2`
2. Hold-to-unlock AntiSpam Gate
3. Xem thông tin Public (nhóm máu, dị ứng)
4. Bấm "Đăng nhập Y Tế Đặc Quyền"
5. Login với `bacsi@medtag.vn / 123456`
6. Xem toàn bộ bệnh án giải mã (tiền sử, thuốc, chống chỉ định)
7. Verify Data Freshness Flag hiển thị đúng

**Nếu hợp lệ → Commit:** `test: verify full doctor authentication and decryption flow`

---

## ✅ Checklist Phase 4

- [ ] Task 4.1: MedicalModule scaffold
- [ ] Task 4.2: MedicalService (AES-256 decryption)
- [ ] Task 4.3: MedicalController (Doctor auth + AuditLog)
- [ ] Task 4.4: Doctor login page
- [ ] Task 4.5: Medical dashboard (tabs + components)
- [ ] Task 4.6: AuthGuard role-based
- [ ] Task 4.7: Integration test full doctor flow

**Khi tất cả ✅ → Phase 4 DONE. Chờ Phase 3 xong → Phase 5.**

---

## 🤖 Prompt Template (Phase 4)

```
Ngữ cảnh: Dự án MedTag – Phase 4: Secure Medical Vault.
Đây là luồng Bác sĩ đăng nhập → giải mã AES-256 → xem toàn bộ bệnh án.

Hãy đọc:
- 02. PTTKHT/05_API_Specification.md (Section 5: Module Medical)
- 02. PTTKHT/04_Database_Schema_Design.md (Section 4: Encrypted JSON structure)
- 02. PTTKHT/08_Screen_List_And_UI_Spec.md (S07: Medical Dashboard)
- backend/src/crypto/crypto.service.ts (CryptoService)

Task: [MÔ TẢ CỤ THỂ]

Ràng buộc:
- Route /api/medical/* phải có JwtAuthGuard + RolesGuard(DOCTOR)
- Giải mã PHẢI diễn ra tại RAM server, KHÔNG gửi key ra frontend
- Ghi AuditLog cho mỗi lần truy cập
- UI: Professional/clinical feel, tab navigation
```
