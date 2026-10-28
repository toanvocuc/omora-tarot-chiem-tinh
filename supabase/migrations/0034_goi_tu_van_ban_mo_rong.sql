-- Bản tâm linh của mô tả gói tư vấn, CHỈ Android và web đọc.
--
-- ──────────────────────────────────────────────────── VÌ SAO CẦN BẢNG NÀY
--
-- Hồ sơ chuyên gia đã có `chuyen_gia_mo_rong` (migration 0032) nên phần tâm
-- linh của nó có chỗ cất. Gói tư vấn thì chưa có gì tương đương, mà `goi_tu_van`
-- là bảng BẢN iOS ĐỌC — đo ngày 2026-10-28: cả 7 gói đều `cho_ios = true`,
-- không gói nào được lọc ra.
--
-- Hệ quả: bản biên tập giọng tự nhiên viết cho Luna câu "Luna sẽ TRẢI BÀI và
-- cùng bạn nhìn vào đúng câu hỏi ấy" không có chỗ nào đặt được. Đặt vào
-- `goi_tu_van.mo_ta` là nó đi thẳng sang iOS; không đặt thì bản web mất giọng
-- user muốn. Bảng này gỡ đúng thế kẹt đó.
--
-- ───────────────────────────────────────────────────── HƯỚNG HỎNG GIỮ NGUYÊN
--
-- Cột `goi_tu_van.mo_ta` luôn là bản SẠCH và iOS chỉ đọc cột đó. Phần tâm linh
-- nằm ở đây, bên Android/web đọc theo kiểu CÓ THÌ DÙNG, KHÔNG THÌ LẤY BẢN GỐC.
--
--   Quên điền  ->  web hiện bản sạch, nhạt đi một chút.
--   Làm ngược  ->  iOS hiện nội dung tâm linh, điều 2.5.19, khoá tài khoản.
--
-- Chạy lúc nào cũng được: mã bên web đã khai sẵn nhánh thiếu bảng thì lấy cột
-- gốc, nên dựng lại web trước hay chạy lệnh này trước đều không gãy.

create table if not exists goi_tu_van_mo_rong (
  ma      uuid primary key references goi_tu_van (ma) on delete cascade,
  mo_ta   text
);

comment on table goi_tu_van_mo_rong is
  'Mô tả gói bản tâm linh — CHỈ bản Android và web đọc. Bản iOS không bao giờ '
  'hỏi tới bảng này, nên chữ ở đây không đi tới máy iOS. Ô trống thì bên '
  'Android/web lấy `goi_tu_van.mo_ta`.';

comment on column goi_tu_van.mo_ta is
  'Mô tả bản SẠCH, hiện trên MỌI nền tảng kể cả iOS. Không ghi tarot / trải bài '
  '/ chiêm tinh vào đây — xem bảng `goi_tu_van_mo_rong`.';

alter table goi_tu_van_mo_rong enable row level security;

-- Đọc thì ai cũng đọc được, y như mấy bảng nội dung khác: bản web là trang
-- công khai, chưa đăng nhập vẫn phải xem được gói.
create policy "ai cung doc duoc" on goi_tu_van_mo_rong for select using (true);

-- Ghi thì khoá công khai không ghi được. Sửa nội dung đi qua khoá service role,
-- giống `goi_tu_van`.

-- ── Điền bản biên tập giọng tự nhiên ngày 2026-10-28 ──
--
-- Sáu dòng này là chữ user viết lại. Bốn dòng trong đó vốn đã sạch, nhưng vẫn
-- để hết ở đây cho một chỗ một giọng: bên web đọc bảng này thì đọc trọn, khỏi
-- cảnh hai gói cạnh nhau mà một gói giọng này một gói giọng kia.

insert into goi_tu_van_mo_rong (ma, mo_ta) values
  ('efd9a935-4356-4cb6-be09-c8cda718d672',
   'Bạn đang băn khoăn một chuyện cụ thể? Hãy kể rõ điều đang xảy ra. Luna sẽ trải bài và cùng bạn nhìn vào đúng câu hỏi ấy.'),
  ('60f2dd68-a551-46b9-874f-cc44351596fb',
   'Có thời gian đi sâu vào một chuyện và hỏi thêm những điều bạn còn lăn tăn.'),
  ('7aa2be91-fe7e-4dbd-ba9a-1f5068045fc8',
   'Có thời gian đi sâu vào một chuyện và hỏi thêm những điều bạn còn lăn tăn.'),
  ('c0747809-a73f-4800-aa0e-5549137c227f',
   'Một buổi trò chuyện dài hơn, dành cho lúc có nhiều điều cần gỡ hoặc bạn muốn nhìn lại cả một giai đoạn.'),
  ('8ab31cc6-8132-4198-838c-6b8edc3330dd',
   'Một buổi trò chuyện dài hơn, dành cho lúc có nhiều điều cần gỡ hoặc bạn muốn nhìn lại cả một giai đoạn.'),
  ('cd67eab0-afdf-4fba-8904-f208fdca1ee7',
   'Có một chuyện khiến bạn chưa yên lòng? Hãy kể ngắn gọn hoàn cảnh để thầy Trí Huệ cùng bạn nhìn lại.')
on conflict (ma) do update set mo_ta = excluded.mo_ta;

-- ── Kiểm ngay tại chỗ ──
do $$
declare
  thieu int;
begin
  select count(*) into thieu
  from goi_tu_van_mo_rong m
  where not exists (select 1 from goi_tu_van g where g.ma = m.ma);

  if thieu > 0 then
    raise exception 'Co % dong tro toi goi khong ton tai', thieu;
  end if;
end $$;
