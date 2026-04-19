# Các Mẫu Prompt chuẩn cho AI Agent (Vibecoding MedTag)

Bạn (Developer) hãy copy và điều chỉnh các prompt dưới đây khi giao việc cho AI Agent.

## 1. Mẫu khởi tạo Tính năng mới (New Feature)
> **Ngữ cảnh:** Tôi đang phát triển dự án MedTag. Hãy đọc file `02_Architecture_Context.md` để hiểu kiến trúc.
> **Yêu cầu:** Tôi cần bạn xây dựng component/chức năng: [Tên chức năng, VD: Nút bấm SOS trễ 15s].
> **Tech stack:** [Next.js App Router, Tailwind CSS].
> **Yêu cầu chi tiết:** 
> - Khi user bấm, hiển thị màn hình đếm ngược 15s (Progressive Circle).
> - Cho phép bấm nút "Hủy" để dừng. 
> - Nếu hết 15s, gọi API `POST /api/emergency/sos` với body chứa tọa độ GPS.
> **Ràng buộc:** Trả về toàn bộ file `.tsx` hoàn chỉnh, sử dụng TypeScript chặt chẽ. Có xử lý lỗi nếu browser không cấp quyền GPS.

## 2. Mẫu Fix Bug (Gỡ lỗi)
> **Ngữ cảnh:** Component [Tên file] đang bị lỗi.
> **Mô tả lỗi:** [Mô tả ngắn gọn, VD: Nút SOS không gửi được GPS trên iOS Safari].
> **Mã lỗi (Terminal/Console):** 
> ```
> [Paste mã lỗi vào đây]
> ```
> **Phân tích:** Bạn hãy cho tôi biết tại sao lại xảy ra lỗi này và đề xuất 2 phương án sửa chữa. Sau khi tôi chọn, bạn mới tiến hành sinh code.

## 3. Mẫu Refactor (Tối ưu hóa Code)
> **Ngữ cảnh:** File `[tên_file.tsx]` đang hoạt động nhưng code lộn xộn và quá dài.
> **Yêu cầu:** 
> 1. Tách các UI components lớn thành các file nhỏ hơn (Ví dụ: `Button`, `Timer`).
> 2. Đưa logic gọi API ra một Custom Hook (`useSOS.ts`).
> 3. Giữ nguyên toàn bộ hành vi hiện tại (No breaking changes).
> Hãy in ra cấu trúc thư mục mới và giải thích ngắn gọn lý do phân tách trước khi viết code chi tiết.

## 4. Mẫu Review Bảo mật
> **Yêu cầu:** Tôi chuẩn bị push đoạn code sau lên nhánh chính. Đây là API giải mã hồ sơ y tế bệnh nhân dùng AES-256. Bạn hãy rà soát xem có lỗ hổng bảo mật nào không (Ví dụ: Lộ secret key, chưa kiểm tra quyền JWT, SQL Injection).
> [Paste Code]