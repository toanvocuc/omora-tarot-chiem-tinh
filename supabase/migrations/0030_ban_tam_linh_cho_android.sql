-- Bản tâm linh của hồ sơ chuyên gia, CHỈ Android và web đọc.
--
-- ───────────────────────────────────────────────────── VÌ SAO CẦN THÊM HAI CỘT NỮA
--
-- Migration 0029 đã dựng luật mặc-định-cấm và thêm `chuyen_gia.chuyen_sau_mo_rong`.
-- Nhưng đo lại ngày 2026-10-27 thì thấy thiếu: phần tâm linh của hồ sơ chuyên gia
-- nằm ở BA chỗ chứ không phải một.
--
--   ten         "Luna Chiêm Tinh"  ->  đã dọn thành "Luna"
--   chuyen_sau  "Tarot, Chiêm tinh, Hành trình linh hồn"  ->  đã dọn
--   gioi_thieu  "Luna xem Tarot, chiêm tinh và luận giải hành trình linh hồn…"  ->  đã viết lại
--
-- Bản Android muốn hiện lại đủ cả ba thì phải có chỗ cất cả ba. Thiếu một cột là
-- bên đó hiện nửa nạc nửa mỡ: tên "Luna" mà chuyên sâu lại là "Tarot, Chiêm tinh".
--
-- ──────────────────────────────────────────────────────────── HƯỚNG HỎNG VẪN GIỮ NGUYÊN
--
-- Cột GỐC luôn là bản SẠCH và iOS chỉ đọc cột gốc. Phần tâm linh nằm ở cột
-- `_mo_rong` mà chỉ Android/web đọc, và bên đó đọc theo kiểu CÓ THÌ DÙNG, KHÔNG
-- THÌ LẤY CỘT GỐC.
--
-- Quên điền cột mở rộng  ->  Android hiện bản sạch, trông nhạt đi một chút.
-- Làm ngược lại           ->  iOS hiện nội dung tâm linh, điều 2.5.19, khoá tài khoản.
--
-- Hỏng về phía nhạt thì sửa lúc nào cũng được. Hỏng về phía kia thì không.

alter table chuyen_gia
  add column if not exists ten_mo_rong text,
  add column if not exists gioi_thieu_mo_rong text;

comment on column chuyen_gia.ten_mo_rong is
  'Tên hiển thị bản Android/web, ví dụ "Luna Chiêm Tinh". Để trống thì bên đó '
  'lấy `ten`. Bản iOS LUÔN đọc `ten` và không bao giờ đọc cột này.';

comment on column chuyen_gia.gioi_thieu_mo_rong is
  'Lời giới thiệu bản Android/web, được nhắc tới tarot và chiêm tinh. Để trống '
  'thì bên đó lấy `gioi_thieu`. Bản iOS LUÔN đọc `gioi_thieu`.';

comment on column chuyen_gia.ten is
  'Tên bản SẠCH, hiện trên MỌI nền tảng kể cả iOS. Không ghi tarot / chiêm tinh '
  'vào đây — xem `ten_mo_rong`.';

comment on column chuyen_gia.gioi_thieu is
  'Lời giới thiệu bản SẠCH, hiện trên MỌI nền tảng kể cả iOS — xem '
  '`gioi_thieu_mo_rong`.';

-- ── Điền lại bản cũ, lấy từ `src/data/noi-dung-mau.ts` của nhánh phase-shop ──
--
-- Đây đúng là chữ đang chạy trên Google Play trước khi dọn, không phải tôi viết
-- mới. `where` theo `ma` chứ không theo tên, vì tên là thứ vừa bị đổi.

update chuyen_gia set
  ten_mo_rong = 'Luna Chiêm Tinh',
  chuyen_sau_mo_rong = 'Tarot, Chiêm tinh, Hành trình linh hồn',
  gioi_thieu_mo_rong =
    'Luna xem Tarot, chiêm tinh và luận giải hành trình linh hồn. Thế mạnh là '
    'chuyện tình cảm và các mối quan hệ, cùng việc định hướng sự nghiệp và những '
    'bước sắp tới. Cách làm của Luna là ghép nhiều góc nhìn lại chứ không phán '
    'một chiều.'
where ma = 'luna-chiem-tinh';

update chuyen_gia set
  chuyen_sau_mo_rong = 'Tâm linh, Luận giải vận mệnh, Tư vấn nhân duyên',
  gioi_thieu_mo_rong =
    'Thầy Trí Huệ đồng hành cùng những người đang tìm kiếm lời giải đáp về nhân '
    'duyên, gia đạo, công việc và những bước ngoặt trong cuộc sống. Với cách chia '
    'sẻ gần gũi, thầy giúp người hữu duyên nhìn nhận vấn đề từ nhiều góc độ, hiểu '
    'rõ hơn hoàn cảnh hiện tại và tìm ra hướng đi phù hợp cho bản thân.'
where ma = 'tri-hue';

update chuyen_gia set
  chuyen_sau_mo_rong = 'Tư vấn tâm linh, Nhân duyên, Gia đạo, Định hướng cuộc sống',
  gioi_thieu_mo_rong =
    'Thầy Minh Châu tập trung tư vấn những vấn đề liên quan đến tình cảm, gia '
    'đình, công việc và các lựa chọn quan trọng trong cuộc sống. Qua từng buổi '
    'trao đổi, thầy hướng đến việc giúp người xem tháo gỡ băn khoăn, nhìn nhận rõ '
    'hơn những điều đang trải qua và có thêm góc nhìn trước khi đưa ra quyết định.'
where ma = 'minh-chau';

-- `tai-khoan-thu` CỐ Ý để trống cả ba cột mở rộng. Đó là hồ sơ người duyệt app
-- đăng nhập vào, không phải chuyên gia thật, nên không có gì để mở rộng.
