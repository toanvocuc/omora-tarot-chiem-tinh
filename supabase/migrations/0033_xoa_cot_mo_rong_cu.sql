-- Xoá ba cột `_mo_rong` khỏi `chuyen_gia`. CHẠY SAU CÙNG.
--
-- ──────────────────────────────────────────────────────── CHỈ CHẠY KHI NÀO
--
-- Chỉ chạy lệnh này SAU KHI bản web và bản Android mới đã lên và đang đọc bảng
-- `chuyen_gia_mo_rong`. Chạy sớm là bản đang chạy ngoài kia mất phần tâm linh
-- ngay lập tức — hồ sơ hiện "Luna" thay vì "Luna Chiêm Tinh".
--
-- Bản iOS thì chạy lúc nào cũng được, nó chưa bao giờ đọc ba cột này.
--
-- Sau khi chạy xong, `select('*')` trên `chuyen_gia` trả về 19 cột sạch thay
-- vì 22 cột có 6 ô tâm linh. Từ đó trong bảng không còn chỗ nào đặt được chữ
-- tâm linh nữa — đó mới là chỗ đáng giá của việc này, chứ không phải ba cột.

-- Chặn trường hợp xoá nhầm lúc chưa chép: thà dừng còn hơn mất chữ.
do $$
declare
  chua_chep int;
begin
  if not exists (select 1 from information_schema.tables
                 where table_name = 'chuyen_gia_mo_rong') then
    raise exception 'Chua co bang chuyen_gia_mo_rong — chay 0032 truoc';
  end if;

  select count(*) into chua_chep
  from chuyen_gia c
  where (coalesce(c.ten_mo_rong, '')        <> ''
      or coalesce(c.chuyen_sau_mo_rong, '') <> ''
      or coalesce(c.gioi_thieu_mo_rong, '') <> '')
    and not exists (select 1 from chuyen_gia_mo_rong m where m.ma = c.ma);

  if chua_chep > 0 then
    raise exception 'Con % dong chua chep sang bang moi — chay lai 0032', chua_chep;
  end if;
end $$;

alter table chuyen_gia
  drop column if exists ten_mo_rong,
  drop column if exists chuyen_sau_mo_rong,
  drop column if exists gioi_thieu_mo_rong;

comment on column chuyen_gia.ten is
  'Tên bản SẠCH, hiện trên MỌI nền tảng kể cả iOS. Bản tâm linh nằm ở bảng '
  '`chuyen_gia_mo_rong`, bảng đó iOS không đọc.';

comment on column chuyen_gia.chuyen_sau is
  'Mảng chuyên sâu bản SẠCH, hiện trên MỌI nền tảng kể cả iOS. Không ghi tarot '
  '/ chiêm tinh / tử vi / thần số vào đây — xem `chuyen_gia_mo_rong.chuyen_sau`.';

comment on column chuyen_gia.gioi_thieu is
  'Lời giới thiệu bản SẠCH, hiện trên MỌI nền tảng kể cả iOS — xem '
  '`chuyen_gia_mo_rong.gioi_thieu`.';
