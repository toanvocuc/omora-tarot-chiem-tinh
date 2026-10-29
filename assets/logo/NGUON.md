# Logo Omora — bản vàng ánh kim

Dựng lại bằng `assets/logo/dung-logo.py`. Chạy một lệnh ra đủ tám tệp.

| File | Kích thước | Đục? | Dùng ở đâu |
|---|---|---|---|
| `omora-day-du.png` | 600 × 510 | trong | Đăng nhập, mở đầu nhập hồ sơ, hoàn tất, thẻ chia sẻ |
| `omora-dau.png` | 600 × 516 | trong | Bản chỉ còn hình, chưa dùng tới |
| `omora-vuong.png` | 1024 × 1024 | trong | Bản vuông, chưa dùng tới |
| `../images/icon.png` | 1024 × 1024 | **ĐỤC** | Biểu tượng app |
| `../images/splash-icon.png` | 1024 × 1024 | trong | Màn chờ |
| `../images/android-icon-foreground.png` | 1024 × 1024 | trong | Biểu tượng thích ứng Android |
| `../images/android-icon-monochrome.png` | 1024 × 1024 | trong | Bản một màu cho Android 13+ |
| `../images/favicon.png` | 96 × 96 | **ĐỤC** | Thẻ trình duyệt |

Ảnh gốc đã khử nhân-sẵn nằm ở `../images/logo-goc.png`.

## BẪY: ảnh gốc là nét vàng vẽ trên nền ĐEN

Không phải nét vàng trên nền trong suốt. Màu đã nhân sẵn với độ sáng — chỗ
sáng mờ là màu vàng nhân với một số nhỏ nên ra gần đen. Đo bản gốc:

- 55,5% số ô nửa trong suốt, màu trung bình (26, 20, 13) — gần như đen
- đặt nguyên lên nền `#0B1220` thì **19,3% số ô LÀM TỐI nền**

Mắt thấy ra một **đĩa đen sau vòng tròn** và vệt đen quanh ngôi sao. Đúng thứ
"nhìn không tự nhiên".

**Cách chữa: khử nhân-sẵn.** Lấy kênh màu lớn nhất làm độ đục, rồi chia màu
lại cho chính nó. Đen thành trong suốt hẳn, vàng mờ thành vàng nhạt, vàng đậm
giữ nguyên. Đo lại sau khi khử: **0 ô làm tối nền**.

**ĐỪNG áp cách của bản logo xanh hôm 27/10.** Bản đó là nét trên nền TRẮNG nên
phải loang từ mép ngoài vào. Hai bài toán ngược nhau.

## Hai tệp PHẢI đục

- `icon.png` — iOS tô đen vào mọi vùng trong suốt của biểu tượng app.
- `favicon.png` — thanh thẻ trình duyệt thường sáng màu. Để trong suốt thì
  phần âm bên trong vòng tròn hiện ra màu sáng, và gương mặt tan mất vì nó vẽ
  bằng khoảng tối chứ không bằng nét.

Hai tệp đó ghép lên nền `#0B1220`, đúng màu nền app.

## Vùng an toàn của biểu tượng thích ứng

Android cắt biểu tượng thành tròn hoặc vuông bo và chỉ chừa ~66% ở giữa. Nên
`android-icon-foreground.png` để lề 0,22 và chỉ lấy PHẦN HÌNH, bỏ chữ OMORA —
chữ thu nhỏ vào vùng an toàn thì không đọc được nữa. Đã đo: lề thật
235/270/229/268, đều lớn hơn mức cần 174.

## Đổi nhận diện thì quét CẢ HAI thư mục

Bài học từ lần trước còn nguyên giá trị: hôm 24/10 chỉ đổi `assets/images/`,
bỏ sót `assets/logo/`, nên biểu tượng ngoài màn hình là logo mới mà mở app ra
vẫn là logo cũ ở ba màn người duyệt chắc chắn thấy. Lần này script đổi cả hai.

Sửa kích thước thì **phải sửa luôn `TY_LE_DAY_DU` và `TY_LE_DAU`** trong
`src/components/logo.tsx`, không thì logo bị kéo dẹt.

## Chỉ nhánh này

Bản vàng chỉ dùng cho Android và web. Nhánh iOS `phase-thuc-hanh` giữ nguyên
logo xanh — đừng đồng bộ thư mục này sang đó.
