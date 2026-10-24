# Omora — bản Tarot & Chiêm tinh

Bản lưu của ứng dụng **Omora** ở giai đoạn có đầy đủ Tarot, Chiêm tinh, Thần số
học và Cửa hàng. Đây là bản **đã hoàn thiện và chạy được**, chốt ngày
**19/10/2026**.

👉 **Xem thử ngay trên trình duyệt:**
https://toanvocuc.github.io/omora-tarot-chiem-tinh/

Không cần cài đặt, không cần đăng nhập. Mở link là dùng được.

---

## Vì sao bản này không có trên App Store

Ứng dụng bị Apple từ chối **hai lần** theo điều **4.3(b) — Spam** của _App Store
Review Guidelines_. Điều khoản này áp cho nhóm ứng dụng bói toán, tử vi, tarot:
Apple xem đó là mảng đã bão hoà và hạn chế nhận thêm.

Đây là giới hạn về **chính sách của chợ ứng dụng**, không phải giới hạn kỹ
thuật. Mọi tính năng trong bản này đều đã chạy được, và có thể tự kiểm chứng
bằng link bên trên.

Bản Tarot & Chiêm tinh **đang phát hành trên Google Play**, vì Google không có
điều khoản tương đương.

Để lên được App Store, ứng dụng đã chuyển hướng sang nội dung thực hành hằng
ngày — thở, thiền, viết, vẽ — ở một nhánh phát triển riêng.

---

## Có gì trong bản này

| Phần | Nội dung |
|---|---|
| **Tarot** | Bộ 78 lá, rút một lá hoặc ba lá, nghĩa xuôi và nghĩa ngược |
| **Lá bài hôm nay** | Mỗi ngày một lá cố định theo từng người, kèm nhắc buổi sáng |
| **Chiêm tinh** | 12 cung hoàng đạo, mô tả chi tiết, bảng độ hợp 78 cặp |
| **Thần số học** | Số chủ đạo, số vận mệnh, biểu đồ ngày sinh, mũi tên biểu đồ |
| **Tử vi** | Luận giải theo ngày sinh |
| **Chuyên gia** | Hồ sơ, gói tư vấn, đặt lịch, lịch hẹn của khách |
| **Cửa hàng** | Danh sách sản phẩm, trang chi tiết, mục quan tâm |
| **Tài khoản** | Đăng nhập Google, dùng ẩn danh, hồ sơ, thông báo |

## Chạy bằng gì

Expo SDK 57 · React Native 0.86 · expo-router · NativeWind · Supabase ·
TypeScript. Mã nguồn và chú thích viết bằng tiếng Việt.

Chi tiết kỹ thuật: xem [TAI-LIEU-KY-THUAT.md](TAI-LIEU-KY-THUAT.md).

---

## Lưu ý về bản chạy trên web

Bản web ở link trên chạy ở **chế độ xem thử**: nội dung được đóng sẵn trong ứng
dụng, **không nối tới máy chủ thật**, không lưu lại gì. Hồ sơ hiện trên màn hình
là dữ liệu mẫu.

Vì vậy bản web này **không** chứa khoá kết nối, **không** đọc được dữ liệu của
người dùng thật, và mọi thao tác trên đó không ảnh hưởng tới bản đang phát hành.

Kho mã cũng đã gỡ tệp cấu hình Firebase và thông tin liên hệ thật trước khi
công khai.

## Chạy ở máy

```bash
npm install
EXPO_PUBLIC_XEM_THU=1 npx expo start --web
```
