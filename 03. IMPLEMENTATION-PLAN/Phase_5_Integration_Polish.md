# Phase 5: Integration, PWA & Polish

> **Mục tiêu:** Tích hợp tất cả phân hệ, thêm PWA offline, SMS notification, Data Freshness cron-job, responsive QA, error handling toàn diện, và deploy production.
> **Dependency:** Cần Phase 2, 3, 4 hoàn thành.

---

## Tham Chiếu Tài Liệu
- `02. PTTKHT/02_Use_Case_Specification.md` → UC-05 (Notification), UC-11 (Data Freshness)
- `02. PTTKHT/07_System_Architecture.md` → Deployment Architecture

---

## Task 5.1: Backend – NotificationModule (SMS/Push)

### Cấu trúc:
```
backend/src/notification/
├── notification.module.ts
└── notification.service.ts
```

### `notification.service.ts`
```typescript
@Injectable()
export class NotificationService {
  private twilioClient: Twilio.Twilio | null = null;

  constructor(private config: ConfigService) {
    const sid = config.get('TWILIO_ACCOUNT_SID');
    const token = config.get('TWILIO_AUTH_TOKEN');
    
    // Chỉ khởi tạo Twilio nếu có credentials thật
    if (sid && !sid.startsWith('MOCK')) {
      this.twilioClient = new Twilio.Twilio(sid, token);
    }
  }

  async sendEmergencySMS(
    toPhone: string,
    patientName: string,
    mapsUrl: string,
  ): Promise<{ status: 'SENT' | 'MOCK_SENT'; sid?: string }> {
    
    const message = `[MedTag] 🚨 Cấp cứu!\n${patientName} đã được quét tại:\n${mapsUrl}\nLiên hệ ngay!`;

    if (!this.twilioClient) {
      // Mock mode: log + return fake SID
      console.log(`[MOCK SMS] To: ${toPhone}\n${message}`);
      return { status: 'MOCK_SENT' };
    }

    const result = await this.twilioClient.messages.create({
      body: message,
      from: this.config.get('TWILIO_PHONE_NUMBER'),
      to: toPhone,
    });

    return { status: 'SENT', sid: result.sid };
  }
}
```

**Tích hợp:** Update `EmergencyService.triggerSOS()` → gọi `NotificationService.sendEmergencySMS()` sau khi tạo EmergencyLog.

**Commit:** `feat: NotificationModule with Twilio SMS (mock-friendly)`

---

## Task 5.2: Backend – SchedulerModule (Data Freshness Cron-Job)

### Cấu trúc:
```
backend/src/scheduler/
├── scheduler.module.ts
└── freshness-check.service.ts
```

### `freshness-check.service.ts`
```typescript
@Injectable()
export class FreshnessCheckService {
  constructor(
    private prisma: PrismaService,
    private notification: NotificationService,
  ) {}

  // Chạy mỗi ngày lúc 00:00 UTC
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkDataFreshness() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // FRESH → STALE (> 6 tháng)
    await this.prisma.medicalRecord.updateMany({
      where: {
        dataFreshnessStatus: 'FRESH',
        dataConfirmedAt: { lt: sixMonthsAgo },
      },
      data: { dataFreshnessStatus: 'STALE' },
    });

    // STALE → EXPIRED (> 12 tháng)
    await this.prisma.medicalRecord.updateMany({
      where: {
        dataFreshnessStatus: 'STALE',
        dataConfirmedAt: { lt: twelveMonthsAgo },
      },
      data: { dataFreshnessStatus: 'EXPIRED' },
    });

    console.log('[CronJob] Data freshness check completed');
    // TODO: Send reminder emails/SMS to guardians with stale records
  }
}
```

**Cập nhật `app.module.ts`:**
```typescript
imports: [
  ScheduleModule.forRoot(),  // @nestjs/schedule
  SchedulerModule,
  NotificationModule,
  // ... existing modules
]
```

**Commit:** `feat: SchedulerModule with daily data freshness cron job`

---

## Task 5.3: Frontend – PWA Configuration

### Cấu hình `next-pwa`:

**File:** `frontend/next.config.ts`
```typescript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache Emergency API responses
      urlPattern: /\/api\/emergency\/.+/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'emergency-data',
        expiration: { maxEntries: 50, maxAgeSeconds: 600 },
      },
    },
  ],
});

module.exports = withPWA({
  // existing config
});
```

### `frontend/public/manifest.json`
```json
{
  "name": "MedTag - Cổng thông tin sơ cứu khẩn cấp",
  "short_name": "MedTag",
  "description": "Hệ thống thông tin y tế khẩn cấp cho người đi đường và bác sĩ",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f9fafb",
  "theme_color": "#2563eb",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Offline Skeleton cho Emergency Page:
- Service Worker cache response của `/api/emergency/:shortId`
- Nếu mất mạng, hiển thị cached data với banner "📡 Đang hiển thị dữ liệu từ bộ nhớ đệm"
- Nếu chưa từng cache → hiển thị skeleton xám + "Không có kết nối mạng"

**Commit:** `feat: PWA configuration with offline support for emergency data`

---

## Task 5.4: Frontend – Global Error Handling & Toast

### Cấu hình toàn cục:
- `react-hot-toast` Toaster component trong `layout.tsx`
- API error interceptor: auto-show toast khi API fail
- Loading states: Button spinner khi API đang gọi
- 404 page: `/frontend/src/app/not-found.tsx`
- Network error banner: Hiển thị khi `navigator.onLine === false`

**Commit:** `feat: global error handling, toast notifications, offline indicator`

---

## Task 5.5: Frontend – Responsive & Mobile QA

**Checklist responsive cần kiểm tra:**

### Emergency Page (`/e/[shortId]`) – CỰC KỲ QUAN TRỌNG
- [ ] iPhone SE (375px) – phải hiển thị đầy đủ
- [ ] iPhone 14 (390px)
- [ ] Android trung bình (360px)
- [ ] Galaxy Fold (280px folded) – vẫn đọc được nhóm máu
- [ ] iPad (768px)

### Portal Dashboard
- [ ] Mobile: Sidebar collapse → hamburger menu
- [ ] Tablet: Sidebar mini (icons only)
- [ ] Desktop: Full sidebar

### Medical Dashboard
- [ ] Mobile: Tabs → horizontal scroll
- [ ] Desktop: Full tabs

**Fix thường gặp:**
- Text truncation cho tên dài
- Touch targets tối thiểu 44x44px cho nút SOS
- Safe area padding cho notch/dynamic island

**Commit:** `fix: responsive adjustments for mobile devices`

---

## Task 5.6: Backend – Global Exception Filter & Logging

### `backend/src/common/filters/http-exception.filter.ts`
```typescript
// Catch tất cả exception → format chuẩn:
// {
//   statusCode: number,
//   message: string,
//   error: string,
//   timestamp: string,
//   path: string
// }
```

### Logging:
- Log tất cả API requests (method, path, duration, status)
- Log errors kèm stack trace
- Production: gửi error logs tới monitoring service (nếu có)

**Commit:** `feat: global exception filter and request logging`

---

## Task 5.7: Production Deployment

### 5.7.1: Deploy Frontend lên Vercel
```bash
cd frontend

# Vercel CLI
npx vercel --prod

# Hoặc connect GitHub repo → auto deploy
# Environment variables trên Vercel:
# NEXT_PUBLIC_API_URL=https://medtag-backend.onrender.com/api
# NEXT_PUBLIC_APP_URL=https://medtag.vercel.app
```

### 5.7.2: Deploy Backend lên Render
```bash
# render.yaml hoặc dashboard config:
# Build command: npm install && npx prisma generate && npm run build
# Start command: npm run start:prod
# Environment variables:
# DATABASE_URL, DIRECT_URL, JWT_SECRET, AES_SECRET_KEY, 
# REDIS_URL, TWILIO_*, FRONTEND_URL
```

### 5.7.3: Database Migration (Production)
```bash
npx prisma migrate deploy
npx prisma db seed
```

### 5.7.4: Verify Production
1. Truy cập `https://medtag.vercel.app` → Landing page hoạt động
2. Truy cập `https://medtag.vercel.app/e/X7K9A2` → Emergency flow hoạt động
3. Login Guardian → CRUD hoạt động
4. Login Doctor → Giải mã hoạt động

**Commit:** `chore: production deployment configuration`

---

## Task 5.8: Final Integration Test & Code Review

### Checklist kiểm thử toàn diện:

**Luồng 1 – Bystander:**
- [ ] Quét QR → mở trang cấp cứu
- [ ] Nhập ShortID → redirect đúng
- [ ] AntiSpam Gate → hold → unlock
- [ ] Hiển thị đúng: Avatar, Tên, Nhóm máu, Dị ứng, Bệnh nền, Liên hệ
- [ ] SOS button → Countdown 15s → GPS → API call → "Đã phát tín hiệu"
- [ ] HỦY SOS trong lúc countdown → timer reset
- [ ] Mất mạng giữa chừng → Skeleton hiển thị (PWA)

**Luồng 2 – Bác sĩ:**
- [ ] Bấm "Đăng nhập Y Tế" từ trang Public
- [ ] Login bằng tài khoản Doctor
- [ ] Xem toàn bộ bệnh án giải mã (tiền sử, thuốc, chống chỉ định)
- [ ] Data Freshness Flag hiển thị đúng color
- [ ] AuditLog ghi nhận truy cập

**Luồng 3 – Guardian:**
- [ ] Đăng ký tài khoản mới
- [ ] Đăng nhập → xem Dashboard
- [ ] Tạo hồ sơ bệnh nhân mới (với dữ liệu y tế chi tiết)
- [ ] Chỉnh sửa hồ sơ → verify data update
- [ ] Liên kết thiết bị (ShortID) → quét QR hiển thị đúng
- [ ] Hủy liên kết thiết bị
- [ ] Xem lịch sử SOS
- [ ] Bấm "Xác nhận dữ liệu" → Freshness reset

**Bảo mật:**
- [ ] Truy cập `/api/portal/*` không có token → 401
- [ ] Truy cập `/api/medical/*` với Guardian token → 403
- [ ] Truy cập `/api/portal/*` với Doctor token → 403
- [ ] encryptedMedicalData KHÔNG bao giờ xuất hiện ở Emergency API response
- [ ] AES key KHÔNG xuất hiện trong frontend code

**Code cleanup:**
```bash
# Xóa console.log thừa
grep -r "console.log" frontend/src --include="*.tsx" --include="*.ts"
grep -r "console.log" backend/src --include="*.ts"

# Xóa unused imports
# Xóa TODO comments đã hoàn thành
# Verify .env không bị commit vào git
```

**Commit:** `chore: final code cleanup and integration test verification`

---

## ✅ Checklist Phase 5

- [ ] Task 5.1: NotificationModule (Twilio SMS)
- [ ] Task 5.2: SchedulerModule (Data Freshness Cron)
- [ ] Task 5.3: PWA + Offline fallback
- [ ] Task 5.4: Global error handling & toasts
- [ ] Task 5.5: Responsive & mobile QA
- [ ] Task 5.6: Exception filter & logging
- [ ] Task 5.7: Production deployment (Vercel + Render)
- [ ] Task 5.8: Final integration test + code cleanup

**Khi tất cả ✅ → 🎉 MVP COMPLETE → Quay video Demo + Hoàn thiện Poster + Báo cáo kỹ thuật**

---

## 🤖 Prompt Template (Phase 5)

```
Ngữ cảnh: Dự án MedTag – Phase 5: Integration & Polish.
Tất cả 3 luồng chính (Emergency, Portal, Medical) đã hoạt động.
Bây giờ cần tích hợp, polish, và deploy.

Task: [MÔ TẢ CỤ THỂ]

Ràng buộc:
- Không thêm tính năng mới (Code Freeze)
- Chỉ fix bug, thêm error handling, improve UX
- PWA phải hoạt động offline cho Emergency page
- SMS có thể mock (log ra console nếu chưa có Twilio credentials)
```
