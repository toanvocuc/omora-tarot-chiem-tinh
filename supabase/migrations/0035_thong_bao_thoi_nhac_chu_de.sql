-- Thông báo thôi nhúng chủ đề đơn vào chữ.
--
-- ──────────────────────────────────────────────────────────────── VÌ SAO
--
-- Ba hàm sinh thông báo đang dán thẳng `yeu_cau_tu_van.chu_de` vào tiêu đề và
-- nội dung. `chu_de` lấy từ các chip chủ đề của chuyên gia, mà bên Android/web
-- mấy chip đó mang chữ tâm linh. Kết quả, quét ngày 2026-10-29 thấy 5 ô bẩn
-- trong `thong_bao`:
--
--   "Đơn mới · Tư vấn nhân duyên"
--   "Đơn mới · Hành trình linh hồn"
--   "Chủ đề Tư vấn nhân duyên. Thầy sẽ hẹn bạn…"
--
-- Bảng `thong_bao` là bảng BẢN iOS ĐỌC. Lần này chưa lộ vì khoá dòng chặt
-- (`nguoi_nhan = auth.uid()`) và cả 5 dòng đều thuộc tài khoản khác, không
-- phải tài khoản người duyệt `tai-khoan-thu`. Nhưng đó là may, không phải
-- thiết kế: chỉ cần một đơn tâm linh rơi vào tài khoản người duyệt là lộ.
--
-- Chữ thông báo ĐÓNG BĂNG lúc sinh ra — bản cập nhật app không sửa được dòng
-- đã gửi. Nên chỗ duy nhất chặn được là ngay tại đây.
--
-- Luật từ nay: thông báo chỉ được nhúng `chuyen_gia.ten` và tên khách. KHÔNG
-- BAO GIỜ nhúng `chu_de`, `chuyen_sau`, hay tên gói.
--
-- Nhân tiện bỏ nốt chữ "thầy" — đã tẩy một lần hôm 24/10 mà vẫn còn trong mấy
-- hàm này.
--
-- `create or replace` giữ nguyên trigger đang gắn, không phải gắn lại.

-- ───────────────────────────────────────────────── đơn mới -> chuyên gia

create or replace function bao_thay_don_moi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare tai_khoan_thay uuid;
begin
  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;

  if tai_khoan_thay is null then
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    -- Tên khách thay cho chủ đề: vẫn phân biệt được đơn nào với đơn nào.
    'Đơn mới · ' || coalesce(new.ten_khach, 'Khách'),
    -- KHÔNG nhúng `cau_hoi`. Đó là chữ khách tự viết, app không kiểm soát
    -- được, mà nó rơi thẳng vào hộp chuông của chuyên gia — đúng chỗ người
    -- duyệt mở ra xem. Chạm vào thông báo là đọc được đầy đủ.
    coalesce(new.gio_hen, new.khung_gio),
    '/thay?don=' || new.ma
  );
  return null;
end $$;

-- ────────────────────────────────────────────── đơn đổi trạng thái -> khách

create or replace function bao_khach_don_doi() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ten_thay text;
  tieu text;
  noi  text;
begin
  if new.trang_thai = old.trang_thai then
    return null;
  end if;

  -- Khách tự huỷ thì không báo lại cho chính khách. Họ vừa bấm xong, biết rồi.
  if auth.uid() = new.nguoi_dung then
    return null;
  end if;

  select ten into ten_thay from public.chuyen_gia where ma = new.chuyen_gia;
  ten_thay := coalesce(ten_thay, 'Chuyên gia');

  if new.trang_thai = 'da_nhan' then
    tieu := ten_thay || ' đã nhận đơn của bạn';
    noi  := 'Bạn sẽ được hẹn qua kênh liên lạc đã để lại.';
  elsif new.trang_thai = 'da_huy' then
    tieu := ten_thay || ' chưa nhận được đơn này';
    noi  := coalesce(nullif(trim(new.ly_do), ''), 'Không có lý do kèm theo.');
  elsif new.trang_thai = 'da_xong' then
    tieu := 'Buổi tư vấn với ' || ten_thay || ' đã xong';
    noi  := 'Cảm ơn bạn. Bạn chấm sao cho chuyên gia ở trang hồ sơ nhé.';
  else
    return null;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (new.nguoi_dung, 'dat_lich', tieu, noi, '/lich-cua-toi?don=' || new.ma);

  return null;
end $$;

-- ───────────────────────────────────────────────── khách huỷ -> chuyên gia

create or replace function bao_thay_khach_huy() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  tai_khoan_thay uuid;
  ngay text;
  gio  text;
begin
  if new.trang_thai <> 'da_huy' or old.trang_thai = 'da_huy' then
    return null;
  end if;

  if auth.uid() is null or auth.uid() <> new.nguoi_dung then
    return null;
  end if;

  select tai_khoan into tai_khoan_thay
    from public.lien_he_chuyen_gia where chuyen_gia = new.chuyen_gia;
  if tai_khoan_thay is null then
    return null;
  end if;

  ngay := coalesce(to_char(new.ngay_hen, 'DD/MM'), 'chưa chọn ngày');
  gio  := coalesce(new.gio_hen, new.khung_gio);

  insert into public.thong_bao (nguoi_nhan, loai, tieu_de, noi_dung, duong_dan)
  values (
    tai_khoan_thay,
    'dat_lich',
    'Khách đã huỷ một đơn',
    coalesce(new.ten_khach, 'Khách') || ' huỷ buổi hẹn ngày ' || ngay
      || ' · ' || gio || '. Bạn không cần giữ chỗ nữa.',
    '/thay?don=' || new.ma
  );
  return null;
end $$;

-- ───────────────────────── dọn mấy dòng đã sinh ra trước khi vá
--
-- BẮT THEO TỪ CẤM, không bắt theo hình dạng câu.
--
-- Bản đầu tôi viết thêm điều kiện loại trừ `tieu_de !~ '^Đơn mới · <chữ hoa>'`,
-- định chừa lại mấy dòng "Đơn mới · <tên khách>". Nhưng CHỦ ĐỀ CŨNG VIẾT HOA —
-- "Tư vấn nhân duyên", "Hành trình linh hồn" — nên điều kiện đó loại sạch cả 8
-- dòng, kể cả 3 dòng cần dọn. Phép kiểm cuối bắt được và cuộn lại toàn bộ.

update thong_bao
   set tieu_de = 'Đơn mới'
 where tieu_de ~* 'tarot|chiêm tinh|tử vi|thần số|cung hoàng|tâm linh|linh hồn|nhân duyên|vận mệnh|lá bài|trải bài';

update thong_bao
   set noi_dung = 'Bạn sẽ được hẹn qua kênh liên lạc đã để lại.'
 where noi_dung like 'Chủ đề %'
   and noi_dung ~* 'tarot|chiêm tinh|tử vi|thần số|cung hoàng|tâm linh|linh hồn|nhân duyên|vận mệnh|lá bài|trải bài';

-- Quét lại ngay tại chỗ, và IN RA ĐÚNG DÒNG nào còn bẩn. Lần trước phép kiểm
-- chỉ báo "còn 3 dòng" nên phải tra tay mới biết hỏng ở đâu.
do $$
declare
  r record;
  con int := 0;
  ds text := '';
  CAM constant text := 'tarot|chiêm tinh|tử vi|thần số|cung hoàng|tâm linh|linh hồn|nhân duyên|vận mệnh|lá bài|trải bài';
begin
  for r in
    select ma, tieu_de, noi_dung from thong_bao
     where tieu_de ~* CAM or noi_dung ~* CAM
  loop
    con := con + 1;
    ds := ds || ' | ' || left(coalesce(r.tieu_de, ''), 46) || ' >> ' || left(coalesce(r.noi_dung, ''), 46);
  end loop;

  if con > 0 then
    raise exception 'Con % dong thong_bao mang chu tam linh:%', con, ds;
  end if;
end $$;
