-- Luật MẶC ĐỊNH CẤM: bản iOS chỉ hiện thứ đã được duyệt riêng cho iOS.
--
-- ─────────────────────────────────────────── VÌ SAO CẦN, VÀ CẦN TRƯỚC KHI LÀM ANDROID
--
-- Từ đây Omora là HAI sản phẩm dùng CHUNG một cơ sở dữ liệu: bản iOS không có
-- tâm linh, bản Android và bản web thì có lại tarot và chiêm tinh. Apple đã từ
-- chối app hai lần theo điều 4.3(b).
--
-- Điểm gãy là cột `chuyen_gia.chuyen_sau`. Nó nuôi ba chỗ trên iOS cùng lúc:
-- dòng mô tả dưới tên chuyên gia, CÁC CHIP CHỌN CHỦ ĐỀ lúc đặt lịch, và giá trị
-- `chu_de` ghi xuống đơn rồi hiện lại ở màn chuyên gia.
--
-- Nghĩa là sửa một ô trong bảng là nội dung tâm linh hiện lên iOS NGAY, không
-- cần cập nhật app, không qua duyệt. Đó là điều 2.5.19 — tính năng ẩn — và mức
-- phạt của nó là khoá tài khoản nhà phát triển, không phải chỉ từ chối bản cập
-- nhật.
--
-- ─────────────────────────────────────────────────── HƯỚNG AN TOÀN KHÁC NHAU THEO LOẠI
--
-- Với CỘT CHỮ: cột gốc giữ bản sạch, iOS đọc cột gốc. Phần tâm linh cho vào cột
-- thêm mà chỉ Android/web đọc. Quên điền cột thêm thì Android hiện ít đi — iOS
-- không bao giờ vi phạm vì bỏ sót.
--
-- Với CẢ DÒNG (gói tư vấn, sản phẩm): cờ `cho_ios` mặc định FALSE, iOS lọc theo
-- nó. Quên bật cờ thì iOS hiện thiếu một món — không hiện bậy một món.
--
-- Cả hai đều hỏng về phía an toàn. Làm NGƯỢC LẠI là hỏng về phía vi phạm.

-- ── 1. Chỗ cho phần chuyên sâu tâm linh, iOS KHÔNG đọc cột này ───────────────

alter table chuyen_gia
  add column if not exists chuyen_sau_mo_rong text;

comment on column chuyen_gia.chuyen_sau_mo_rong is
  'Chuyên sâu phần tâm linh (tarot, chiêm tinh...). CHỈ bản Android và bản web '
  'đọc cột này. Bản iOS đọc `chuyen_sau` — cột đó phải LUÔN sạch tâm linh, vì '
  'nó sinh ra các chip chọn chủ đề lúc đặt lịch trên iOS.';

comment on column chuyen_gia.chuyen_sau is
  'Chuyên sâu bản SẠCH, hiện trên MỌI nền tảng kể cả iOS. Tuyệt đối không ghi '
  'tarot / chiêm tinh / tử vi / thần số vào đây — xem `chuyen_sau_mo_rong`.';

-- ── 2. Cờ cho từng dòng, mặc định CẤM ────────────────────────────────────────

alter table goi_tu_van
  add column if not exists cho_ios boolean not null default false;

alter table san_pham
  add column if not exists cho_ios boolean not null default false;

comment on column goi_tu_van.cho_ios is
  'Gói này có được hiện trên bản iOS không. MẶC ĐỊNH FALSE: gói mới phải được '
  'bật tay sau khi đã soát chữ. Quên bật thì iOS thiếu một gói, còn hơn lòi ra '
  'một gói tarot.';

comment on column san_pham.cho_ios is
  'Món này có được hiện trên bản iOS không. Mặc định FALSE, xem `goi_tu_van.cho_ios`.';

-- Mọi dòng ĐANG CÓ đều đã soát và sạch tính tới 2026-10-24, nên bật hết. Chỉ
-- dòng thêm MỚI mới phải qua cửa duyệt tay.
update goi_tu_van set cho_ios = true where cho_ios is distinct from true;
update san_pham   set cho_ios = true where cho_ios is distinct from true;
