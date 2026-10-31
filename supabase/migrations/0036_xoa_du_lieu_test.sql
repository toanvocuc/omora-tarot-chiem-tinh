-- 0036 — Xoá dữ liệu test trước khi nộp bản iOS
--
-- Người duyệt của Apple đăng nhập vào màn chuyên gia và thấy hàng đợi đơn.
-- Hàng đợi đó đang lẫn 5 đơn user tự tạo khi thử app ("meow meow meow meow",
-- "Đi ngoài ra nước thì đi", khách tên "a", "Uchihameowmeow qíe"), trong đó
-- 3 đơn mang chủ đề tâm linh: "Hành trình linh hồn" và "Tư vấn nhân duyên" ×2.
--
-- Bản iOS KHÔNG hiện mấy chủ đề đó — src/app/thay.tsx chỉ hiện chu_de nếu nó
-- nằm trong chuyen_sau gốc của chính chuyên gia đang đăng nhập, không khớp thì
-- hiện nhãn trung tính "Tư vấn". Nhưng để chữ tâm linh nằm trong DB là giữ một
-- quả mìn: bất kỳ bề mặt mới nào đọc chu_de thô sau này đều làm nó nổ.
--
-- GIỮ NGUYÊN 3 đơn mẫu của `tai-khoan-thu` (tạo 2026-10-20) — đó là đơn dựng
-- CÓ Ý cho người duyệt bấm thử Nhận / Từ chối / Đánh dấu đã xong, kèm lời dặn
-- trong cau_hoi. Xoá chúng là làm người duyệt không có gì để thử.
--
-- GIỮ NGUYÊN 2 dòng danh_gia của Luna. Ghi chú gửi Apple có câu "Only Luna has
-- been rated so far"; xoá là làm câu khai đó thành sai.
--
-- Liệt kê từng mã một, không dùng bộ lọc đại trà, để phạm vi xoá đọc được
-- bằng mắt. Chạy trong một giao dịch: sai một dòng là lùi sạch.

begin;

-- Thông báo. 8 dòng gắn với 5 đơn test, cộng 1 dòng mồ côi từ 2026-10-17 trỏ
-- `/lich-cua-toi` không kèm mã đơn (có từ trước khi thêm tham số don).
delete from thong_bao where ma in (
  '67616266-024b-4bfb-860b-8778d3e433a6',  -- Luna đã nhận đơn của bạn (mồ côi)
  '7e71223c-5c39-4da1-b692-9539a963d6cd',  -- Đơn mới · Chuyển việc
  '5b80d99f-8677-492c-a9d9-634502e4b348',  -- Đơn mới · Định hướng sự nghiệp
  'a97c6170-7b58-4832-a1f8-92bc76ff748f',  -- Luna chưa nhận được đơn này
  '4ae256c0-9164-4282-a29f-d011a34a7aae',  -- Đơn mới (Bamo)
  '553fb30a-f452-4f4d-a4bc-9d600d0c8457',  -- Đơn mới (Chika)
  'e320eff4-d266-44e4-a0bf-3a9458131211',  -- Trí Huệ đã nhận đơn của bạn
  '11c778b3-50d3-4c1f-8040-0fba50b0d553',  -- Đơn mới (a)
  '6af08d11-6d4f-4fe5-a7d2-bd31798d559b'   -- Trí Huệ đã nhận đơn của bạn
);

-- Đơn. Xoá sau thông báo để không còn gì trỏ tới chúng.
delete from yeu_cau_tu_van where ma in (
  '87a48ce3-3849-4cc5-8bcb-5808d77788ae',  -- luna    | cho_nhan | Chuyển việc
  '55638c2f-28fb-4bbe-81ab-0f21c373f5f0',  -- luna    | da_huy   | Định hướng sự nghiệp
  '30f7dd5e-a500-457b-9a3a-98adccfa7ca0',  -- luna    | cho_nhan | Hành trình linh hồn
  '80a9964b-93b4-4a28-a646-58ddbd5fbe19',  -- tri-hue | da_nhan  | Tư vấn nhân duyên
  'aa4eb8db-3f14-4aa4-b30f-2fcda7c84f72'   -- tri-hue | da_nhan  | Tư vấn nhân duyên
);

-- Tự kiểm. Đếm theo mã và theo chữ cấm, không tin vào việc lệnh trên "chạy xong".
do $$
declare
  so_don    int;
  so_tb     int;
  so_mau    int;
  con_cam   text;
begin
  select count(*) into so_don from yeu_cau_tu_van;
  select count(*) into so_tb  from thong_bao;
  select count(*) into so_mau from yeu_cau_tu_van where chuyen_gia = 'tai-khoan-thu';

  select string_agg(format('%s / %s', chuyen_gia, chu_de), ' | ')
    into con_cam
    from yeu_cau_tu_van
   where chu_de ~* 'linh hồn|nhân duyên|tâm linh|tarot|chiêm tinh|tử vi|thần số|hoàng đạo|vận mệnh|bói';

  raise notice 'con % don, % thong bao, trong do % don mau cho nguoi duyet', so_don, so_tb, so_mau;

  if so_mau <> 3 then
    raise exception 'Phai con dung 3 don mau cua tai-khoan-thu, dang co %', so_mau;
  end if;
  if con_cam is not null then
    raise exception 'Van con chu_de tam linh: %', con_cam;
  end if;
  raise notice 'OK — khong con chu_de tam linh, 3 don mau con nguyen';
end $$;

commit;
