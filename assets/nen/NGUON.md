# Nguồn ảnh nền và ảnh trang trí

| File | Kích thước | Dùng ở đâu |
|---|---|---|
| `ngan-ha.jpg` | 1170 × 779 | Nền màn chào mừng và màn chúc mừng |
| `vong-hoang-dao.jpg` | 720 × 720 | Bước nhập ngày sinh, và màn Khám phá |
| `dong-ho-cat.jpg` | 270 × 380 | Bước nhập giờ sinh |
| `sao-doc.jpg` | 780 × 1389 | Nền sáu màn nhập hồ sơ |
| `khung-hoa-van.jpg` | 1680 × 2520 | Nền bốn màn Tarot — **đã làm sáng**, xem mục cuối |
| `khung-hoa-van-nguyen-ban.jpg` | 840 × 1260 | Bản công ty cấp, giữ để dựng lại |
| `khung-so.jpg` | 840 × 1260 | Nền màn Thần số học |
| `khung-cung.jpg` | 840 × 1260 | Nền ba màn cung hoàng đạo và độ hợp |
| `tinh-van.jpg` | 941 × 1672 | Nền màn Khám phá |
| `../cards/mat-sau.jpg` | 600 × 1053 | Mặt sau lá bài |

Sáu ảnh đầu do công ty cấp ngày 2026-09-29.
`khung-so.jpg` và `khung-cung.jpg` do công ty cấp ngày 2026-10-01, gốc 1024 × 1536,
đã thu về 840 × 1260 cho khớp với `khung-hoa-van.jpg`.

`tinh-van.jpg` do người dùng đưa ngày 2026-10-13, gốc là PNG nặng 2414 KB, đã đổi
sang JPEG chất lượng 88 còn 237 KB. Giữ nguyên kích thước gốc. **Chưa biết nguồn** —
xem mục ngay dưới đây.

## Cần làm rõ trước khi phát hành

**Xin công ty xác nhận nguồn và giấy phép của chín ảnh này**, rồi ghi vào bảng trên:
lấy từ đâu, mua ở đâu, hay tự tạo. Cả hai chợ đều không kiểm ảnh, nhưng chủ sở hữu
ảnh vẫn có thể khiếu nại sau khi app đã lên.

Riêng `ngan-ha.jpg` trông giống ảnh chụp thật của nhiếp ảnh gia, loại hay bán trên các
sàn ảnh. Đây là ảnh rủi ro nhất trong ba ảnh vì nó là thứ đầu tiên khách nhìn thấy.

`tinh-van.jpg` cũng cùng loại rủi ro đó và chưa rõ lấy từ đâu. Nếu tải trên mạng thì
cần tìm lại trang gốc và đọc giấy phép trước khi phát hành — ảnh tinh vân đẹp kiểu này
phần nhiều là ảnh bán hoặc ảnh dựng của hoạ sĩ, không phải ảnh tự do.

## Về chất lượng

`tinh-van.jpg` rộng 941 điểm. Màn cắt bớt hai bên nên chỉ dùng khoảng 80% bề ngang,
tức máy 3x phải phóng lên chừng 1,3 lần. Tinh vân vốn mềm nên phóng không lộ, nhưng
xin được bản rộng từ 1600 điểm trở lên thì thay vào, không cần sửa code.

`dong-ho-cat.jpg` chỉ 270 × 380 nên hiện ở cỡ 150 điểm là vừa. Phóng lớn hơn sẽ mờ.
Nếu xin được bản to hơn thì thay vào, không cần sửa code.

`ngan-ha.jpg` là ảnh ngang. Màn hình dọc nên chỉ dùng phần trên rồi tan dần vào nền,
xem `src/components/nen-sao.tsx`. Nếu có bản dọc thì đổi cách đặt sẽ đẹp hơn nữa.

## Ghi chú thêm

`sao-doc.jpg` gốc chỉ 415 × 739, đã phóng lên 780 × 1389. Ảnh mờ sẵn nên phóng lên
không lộ, nhưng có bản to hơn thì vẫn nên thay.

`mat-sau.jpg` gốc là 976 × 1612, tỷ lệ 0,605. Đã cắt bớt trên dưới đều nhau để về đúng
tỷ lệ 0,57 của bộ Rider-Waite, nhờ vậy mặt trước mặt sau cùng khung.

## Hai khung mới chạy mờ hơn

`khung-so.jpg` và `khung-cung.jpg` có hoa văn ăn khá sâu vào trong lề, chữ chạy đè lên
là rối mắt. Hai ảnh này đặt độ mờ 0,55 trong `src/components/nen-anh.tsx`, khác với
`khung-hoa-van.jpg` chạy nguyên độ đậm vì hoa văn của nó nằm sát mép.

## Khung Tarot đã làm sáng — 2026-10-31

Sếp gửi ảnh mẫu, muốn viền trăng rõ và vàng hơn. Đo ra hai nguyên nhân, cả hai
đều KHÔNG phải do màu của tệp gốc:

1. **Mất hẳn bốn góc.** `NenKhung` chạy `contentFit: 'cover'`. Ảnh tỷ lệ 0,67 mà
   màn điện thoại 0,46, nên nó khớp chiều cao rồi cắt 70dp mỗi bên — cắt đúng
   hai góc trăng trên và hai góc mặt trời dưới. Màn chỉ còn trơ đường viền
   trong. Đổi sang `fill`: được đủ bốn góc, đổi lại bóp ngang ~30%, với khung
   viền đối xứng thì không nhận ra.

2. **Nét 1px bị phóng to nên nhoè.** Ảnh gốc 840 × 1260 mà màn DPR2 cần ~1242px
   bề ngang, tức phóng 1,5 lần. Đo trên ảnh chụp thật từ omorasoul.com: độ bão
   hoà của nét tụt từ 55,8 trong tệp xuống 29,9 trên màn. Xuất lại ở 2x để app
   THU NHỎ thay vì phóng to.

Dựng bằng `lam-khung-sang.py` (đọc `khung-hoa-van-nguyen-ban.jpg`). Ba việc
script đó làm và lý do từng việc nằm trong phần chú thích đầu tệp. Tóm tắt:
dập nhiễu JPEG vùng tối trước (không thì tăng sáng lên là nổi đốm xám và đốm
TÍM — đã thử và thấy rõ), ép mọi nét về đúng vàng `#D4A84B` của app, rồi xuất 2x.

Dung lượng 75 KB → 319 KB. Đo lại sau khi sửa: độ bão hoà nét trên màn 21,8 →
35,1, độ sáng 125,5 → 131,6.

**Hai khung kia chưa đụng tới.** `khung-so.jpg` và `khung-cung.jpg` vẫn là bản
gốc 840 × 1260, chỉ hưởng phần `fill`. Cần sáng như khung Tarot thì chạy lại
script với đường dẫn tương ứng.
