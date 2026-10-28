# Logo Omora

| File | Kích thước | Dùng ở đâu |
|---|---|---|
| `omora-day-du.png` | 600 × 585 | Màn đăng nhập, mở đầu nhập hồ sơ, màn hoàn tất |
| `omora-dau.png` | 600 × 553 | Bản chỉ còn hình, chưa dùng tới |
| `omora-vuong.png` | 1024 × 1024 | Bản vuông, chưa dùng tới |

Cắt từ `assets/images/logo-goc.png` — chính tệp dùng để dựng biểu tượng app,
nên logo trong app và biểu tượng ngoài màn hình chắc chắn khớp nhau.

## Vì sao phải thay — đọc trước khi đụng vào

Bản cũ là **bàn tay huyền bí kèm trăng lưỡi liềm và ngôi sao**, đúng loại hình
khiến app bị Apple từ chối hai lần theo điều 4.3(b).

Hôm 24/10 đã đổi biểu tượng app sang logo xanh lá, nhưng **chỉ đổi
`assets/images/`** và bỏ sót thư mục này. Hậu quả: biểu tượng ngoài màn hình là
logo mới, mà mở app ra thì bàn tay bói toán vẫn còn nguyên ở **ba màn người
duyệt chắc chắn thấy** — đăng nhập, mở đầu nhập hồ sơ, màn hoàn tất. User phát
hiện khi chụp màn hình bản TestFlight ngày 27/10.

**Bài học: đổi nhận diện thì phải quét CẢ HAI thư mục** `assets/images/` và
`assets/logo/`, cộng phần chữ khai trên App Store và ba trang pháp lý.

## Cách dựng lại

Cắt hai khung từ `logo-goc.png` (1254 × 1254):

| | Khung | Ra |
|---|---|---|
| đủ chữ OMORA | `(57, 44, 1210, 1169)` | `omora-day-du.png` |
| chỉ hình tròn | `(180, 44, 1108, 900)` | `omora-dau.png` |

Ba bước xử lý:

1. **Nắn nền về trắng tuyệt đối.** Ảnh gốc nền 253 chứ không phải 255, để
   nguyên thì mép ảnh lệch tông so với nền thẻ.
2. **Tách nền bằng cách loang từ mép ngoài vào**, KHÔNG lọc theo màu. Gương mặt
   trong vòng tròn cũng màu trắng — lọc theo màu là thủng mất mặt.
3. **Thu nhỏ về rộng 600**, không bao giờ phóng lên.

Sửa kích thước thì **phải sửa luôn `TY_LE_DAY_DU` và `TY_LE_DAU`** trong
`src/components/logo.tsx`, không thì logo bị kéo dẹt.
