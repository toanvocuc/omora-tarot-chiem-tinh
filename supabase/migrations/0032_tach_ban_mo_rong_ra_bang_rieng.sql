-- Dời bản tâm linh của hồ sơ chuyên gia sang MỘT BẢNG RIÊNG.
--
-- ─────────────────────────────────────────────────────────── LỖ ĐÃ ĐO ĐƯỢC
--
-- Migration 0029 và 0030 cất phần tâm linh vào ba cột `_mo_rong` ngay trong
-- bảng `chuyen_gia`, và luật là "iOS chỉ đọc cột gốc". Luật đó đúng ở chỗ MÀN
-- HÌNH: bản iOS không vẽ ba cột kia ra.
--
-- Nhưng bản iOS hỏi máy chủ bằng `select('*')`. Đo ngày 2026-10-28 bằng chính
-- khoá anon nằm trong bản đã phát hành:
--
--   GET /rest/v1/chuyen_gia?select=*   ->  22 cột, 6 ô mang chữ tâm linh
--     luna-chiem-tinh.ten_mo_rong        = "Luna Chiêm Tinh"
--     luna-chiem-tinh.chuyen_sau_mo_rong = "Tarot, Chiêm tinh, Hành trình linh hồn"
--     ... và ba ô nữa
--
-- Nghĩa là chữ tarot ĐI TỚI máy iOS trong gói mạng, chỉ là không được vẽ ra.
-- Ai mở trình bắt gói ra cũng thấy. Đó không phải thứ muốn đem ra cãi với người
-- duyệt app, khi mức phạt của điều 2.5.19 là khoá tài khoản nhà phát triển.
--
-- ───────────────────────────────────────────────────── VÌ SAO LÀ BẢNG RIÊNG
--
-- Bản iOS đã phát hành thì KHÔNG sửa được nữa — câu truy vấn `select('*')` nằm
-- trong gói app trên máy người dùng. Nên cách sửa phải là cách hợp với một
-- khách hàng đã đóng băng.
--
-- Dời ba cột sang bảng khác thì `select('*')` trên `chuyen_gia` tự nhiên trả về
-- ít cột đi. Bản iOS không phải đổi một dòng mã nào, không phải nộp lại, không
-- phải đẩy OTA — nó hỏi y như cũ và nhận về bản sạch.
--
-- Và quan trọng hơn: từ nay trong `chuyen_gia` KHÔNG CÒN CHỖ để đặt chữ tâm
-- linh. Luật đổi từ "nhớ đừng gõ vào ô này" thành "không có ô đó". Thứ không
-- quên được thì mới giữ được lâu.
--
-- ──────────────────────────────────────────────────────────── THỨ TỰ CHẠY
--
--   1. migration NÀY            — dựng bảng mới, chép dữ liệu sang, GIỮ cột cũ
--   2. dựng lại bản web + Android — mã mới đọc bảng mới
--   3. migration 0033           — lúc đó mới xoá ba cột cũ
--
-- Giữa bước 1 và 3 cả hai bản đều chạy được, vì dữ liệu nằm ở cả hai nơi.
-- Gộp 0033 vào đây là bản web đang chạy ngoài kia mất sạch phần tâm linh ngay
-- giây chạy lệnh, trước khi bản mới kịp lên.

create table if not exists chuyen_gia_mo_rong (
  ma          text primary key references chuyen_gia (ma) on delete cascade,
  ten         text,
  chuyen_sau  text,
  gioi_thieu  text
);

comment on table chuyen_gia_mo_rong is
  'Bản tâm linh của hồ sơ chuyên gia — CHỈ bản Android và web đọc bảng này. '
  'Bản iOS không bao giờ hỏi tới nó, nên nội dung ở đây không đi tới máy iOS. '
  'Ô nào để trống thì bên Android/web lấy cột cùng tên trong `chuyen_gia`.';

alter table chuyen_gia_mo_rong enable row level security;

-- Đọc thì ai cũng đọc được, y như mấy bảng nội dung khác: bản web là trang
-- công khai, không đăng nhập vẫn phải xem được hồ sơ chuyên gia.
create policy "ai cung doc duoc" on chuyen_gia_mo_rong for select using (true);

-- Ghi thì không ai ghi được bằng khoá công khai. Sửa nội dung đi qua bảng quản
-- trị bằng khoá service role, giống `chuyen_gia`.

-- ── Chép ba cột cũ sang, chỉ chép ô có chữ ──
insert into chuyen_gia_mo_rong (ma, ten, chuyen_sau, gioi_thieu)
select ma,
       nullif(ten_mo_rong, ''),
       nullif(chuyen_sau_mo_rong, ''),
       nullif(gioi_thieu_mo_rong, '')
from chuyen_gia
where coalesce(ten_mo_rong, '')        <> ''
   or coalesce(chuyen_sau_mo_rong, '') <> ''
   or coalesce(gioi_thieu_mo_rong, '') <> ''
on conflict (ma) do update set
  ten        = excluded.ten,
  chuyen_sau = excluded.chuyen_sau,
  gioi_thieu = excluded.gioi_thieu;

-- ── Kiểm ngay tại chỗ: chép thiếu thì dừng, đừng để phát hiện ở bước 3 ──
do $$
declare
  con_lai int;
begin
  select count(*) into con_lai
  from chuyen_gia c
  where (coalesce(c.ten_mo_rong, '')        <> ''
      or coalesce(c.chuyen_sau_mo_rong, '') <> ''
      or coalesce(c.gioi_thieu_mo_rong, '') <> '')
    and not exists (select 1 from chuyen_gia_mo_rong m where m.ma = c.ma);

  if con_lai > 0 then
    raise exception 'Con % dong chua chep sang chuyen_gia_mo_rong', con_lai;
  end if;
end $$;
