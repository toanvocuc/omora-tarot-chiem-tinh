-- Đánh giá: thôi cho người lạ đọc dòng của người khác.
--
-- ─────────────────────────────────────────────────────────────── ĐO ĐƯỢC GÌ
--
-- Rà RLS ngày 2026-10-27 bằng một thẻ đăng nhập ẩn danh THẬT — đúng thứ bất kỳ
-- ai mở bản web cũng lấy được bằng một cú bấm. Mọi bảng dữ liệu người dùng đều
-- lọc đúng, trả về 0 dòng: `ho_so`, `yeu_cau_tu_van`, `thong_bao`, `thiet_bi`,
-- `lan_rut`, `lien_he_chuyen_gia`, `su_kien`. Mọi bảng nội dung đều chặn ghi.
--
-- Trừ MỘT chỗ: `danh_gia` trả về đủ mọi dòng, kèm cột `nguoi_dung`.
--
--   {"chuyen_gia":"luna-chiem-tinh","nguoi_dung":"d8b10cdf-…","sao":4,
--    "tao_luc":"2026-10-15T18:26:16Z"}
--
-- Nghĩa là người ngoài đọc được: tài khoản nào đã xem ai, chấm mấy sao, lúc
-- nào. Mã người dùng là chuỗi ngẫu nhiên nên không truy ra danh tính — `ho_so`
-- vẫn khoá chặt — nhưng đây vẫn là dấu vết hành vi không cần phải công khai.
--
-- Rủi ro tăng hẳn khi bản web lên tên miền thật: khoá `anon` nằm sẵn trong gói
-- web, ai cũng mở xem được.
--
-- ──────────────────────────────────────────────────────── VÌ SAO SIẾT ĐƯỢC
--
-- Chính sách cũ `using (true)` kèm chú thích "app cần chúng để tính điểm". Câu
-- đó ĐÚNG LÚC VIẾT nhưng đã lỗi thời: cùng migration 0010 thêm luôn
-- `chuyen_gia.diem_tb` và `so_danh_gia`, và từ đó app đọc điểm trung bình ở hai
-- cột ấy chứ không cộng tay nữa.
--
-- Đã kiểm CẢ HAI nhánh — `lib/danh-gia.ts` của iOS lẫn Android đều chỉ đọc đúng
-- dòng của mình:
--
--     .eq('chuyen_gia', maThay).eq('nguoi_dung', toi).maybeSingle()
--
-- Và hàm `cap_nhat_diem_thay()` khai `security definer` nên nó chạy bằng quyền
-- chủ hàm, không chịu RLS. Siết chính sách đọc KHÔNG làm gãy điểm trung bình.

drop policy if exists "ai cung doc duoc" on danh_gia;

create policy "chi doc diem cua minh" on danh_gia for select
  using (nguoi_dung = auth.uid());

comment on table danh_gia is
  'Điểm sao từng người chấm. CHỈ đọc được dòng của chính mình — điểm trung bình '
  'công khai nằm ở `chuyen_gia.diem_tb`, do trigger `cap_nhat_diem_thay()` tính, '
  'và hàm đó là security definer nên không vướng RLS.';

-- GHI CHÚ SỔ SÁCH: migration 0030 và 0031 chỉ nằm trên nhánh `phase-android`.
-- Cơ sở dữ liệu thì dùng chung với iOS, nên ai đọc nhánh `phase-thuc-hanh` sẽ
-- không thấy hai tệp này. Đổi lược đồ thì nhớ soát cả hai nhánh.
