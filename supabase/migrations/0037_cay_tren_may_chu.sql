-- Cây thực hành: hai con số đi theo người, để web và app cùng một cây.
--
-- ───────────────────────────────────────────────────────── CHUYỆN ĐÃ HỎNG THẬT
--
-- Ngày 2026-11-08 user báo: cùng tài khoản bamo, trên bản web cây đã là "Cây
-- non" mà mở app Android ra vẫn còn "Cây mầm". Dò ra thì không phải lỗi bản
-- APK: số lần tưới nằm ở `AsyncStorage` dưới máy, không bảng nào dưới máy chủ
-- giữ nó. Trình duyệt và app là HAI kho tách biệt, nên cùng một tài khoản vẫn
-- đếm ra hai con số — và đổi điện thoại hay cài lại app là cây về số không.
--
-- Cây là thứ níu người ta quay lại mỗi ngày. Mất nó khi đổi máy là mất đúng
-- cái lý do họ ở lại.
--
-- ───────────────────────────────────────────── CHỈ HAI CON SỐ, KHÔNG CÓ NHẬT KÝ
--
-- Bảng này KHÔNG giữ nhật ký. Chữ khách viết ra và nét khách vẽ vẫn nằm nguyên
-- dưới máy họ, không rời đi đâu — xem đầu `src/lib/thuc-hanh.ts`. Đó là thứ
-- riêng tư nhất trong cả app, người ta viết ra chuyện mệt mỏi của mình, và
-- ranh giới đó giữ nguyên sau lần sửa này.
--
-- Nhờ vậy mục khai dữ liệu với Google Play cũng không phải khai thêm gì: hai
-- con số dưới đây không nói được khách đã viết gì, cũng không nói được khách
-- làm bài nào — chỉ nói cây lớn tới đâu.
--
-- Cái giá: đổi máy thì cây còn, nhưng mấy trang đã viết vẫn mất. Đó là lựa
-- chọn đã cân, không phải chuyện bỏ sót.
--
-- ─────────────────────────────────────────────── VÌ SAO LÀ HAI SỐ CHỨ KHÔNG MỘT
--
-- Cây lớn theo `da_tuoi`. Nhưng muốn tưới thì phải có năng lượng, mà năng lượng
-- kiếm được từ danh sách buổi — thứ KHÔNG đồng bộ. Nên nếu chỉ đẩy `da_tuoi`
-- lên thì máy mới nhận được một cây to đúng, cạnh một túi năng lượng rỗng, và
-- người dùng hiểu là app vừa ăn mất năng lượng của họ.
--
-- Vậy giữ cả tổng đã kiếm. Năng lượng còn tiêu được là `nang_luong_kiem` trừ
-- `da_tuoi`, tính ở đây nên mọi máy ra cùng một số.
--
-- ──────────────────────────────────────────────── CHỈ CỘNG THÊM, KHÔNG GHI ĐÈ
--
-- Máy khách KHÔNG được ghi thẳng giá trị mới. Ghi đè là sai ngay từ gốc: hai
-- máy cùng thực hành thì máy nào ghi sau sẽ đè mất phần máy kia vừa thêm.
--
-- Nên mọi thay đổi đi qua `cong_cay_thuc_hanh`, và nó chỉ nhận số CỘNG THÊM,
-- không âm. Mỗi máy tự nhớ mình đã đẩy lên bao nhiêu rồi, lần sau chỉ đẩy phần
-- chênh. Lần đồng bộ đầu tiên của một máy đẩy trọn phần nó đã có từ trước, nên
-- web và app cộng lại thành một cây — cây sẽ NHẢY LÊN một bậc hoặc hơn ở lần
-- mở đầu sau khi cập nhật. Đó là đúng: công thực hành của cả hai bên đều thật.

create table cay_thuc_hanh (
  -- Khoá chính là người, không phải thiết bị: cả điểm của bảng này là để mọi
  -- máy của cùng một người cùng đọc một dòng. Khác hẳn `thiet_bi` ở 0006, bảng
  -- đó cố ý lấy máy làm khoá.
  nguoi_dung      uuid primary key references auth.users(id) on delete cascade,

  -- Tổng năng lượng đã kiếm được từ trước tới giờ, cộng dồn qua mọi máy.
  nang_luong_kiem integer not null default 0 check (nang_luong_kiem >= 0),

  -- Tổng năng lượng đã tưới vào cây. ĐÂY là con số quyết định cây lớn tới đâu;
  -- các bậc nằm ở `CAC_GIAI_DOAN` trong `src/lib/tinh-thuc-hanh.ts`.
  da_tuoi         integer not null default 0 check (da_tuoi >= 0),

  cap_nhat_luc    timestamptz not null default now(),

  -- Không tiêu được nhiều hơn số đã kiếm. Hàm bên dưới tự giữ điều này, nên
  -- ràng buộc ở đây là lớp chặn thứ hai cho trường hợp có ai ghi bằng khoá
  -- quản trị.
  constraint tuoi_khong_qua_kiem check (da_tuoi <= nang_luong_kiem)
);

drop trigger if exists cay_thuc_hanh_doi_thi_cham_gio on cay_thuc_hanh;
create trigger cay_thuc_hanh_doi_thi_cham_gio
before update on cay_thuc_hanh
for each row execute function cham_cap_nhat_luc();

alter table cay_thuc_hanh enable row level security;

-- Đọc: chỉ cây của chính mình.
create policy "doc cay cua minh" on cay_thuc_hanh for select
  using (auth.uid() = nguoi_dung);

-- Cố ý KHÔNG có luật insert, update hay delete nào.
--
-- Mở luật update là mở luôn đường cho bất cứ ai cầm khoá công khai đặt
-- `da_tuoi = 800` để có ngay cây cổ thụ. Năng lượng không mua được bằng tiền
-- (xem ghi chú ở `nangLuongConLai`), nên nó cũng không được đặt bằng một lượt
-- gọi thẳng vào bảng. Mọi thay đổi đi qua hàm dưới đây.

-- ────────────────────────────────────────────────────────── cộng thêm vào cây
--
-- `security definer` để hàm ghi được dù bảng không có luật ghi nào. An toàn vì
-- hàm KHÔNG nhận mã người dùng từ máy khách — nó tự lấy `auth.uid()`, nên
-- không ai gọi hộ ai được.
--
-- `search_path = ''` nên mọi tên phải ghi đủ cả lược đồ. Cùng lý do với
-- `cham_cap_nhat_luc` ở migration 0022.
create or replace function cong_cay_thuc_hanh(d_kiem integer, d_tuoi integer)
returns public.cay_thuc_hanh
language plpgsql
security definer
set search_path = ''
as $$
declare
  nguoi uuid := auth.uid();
  dong  public.cay_thuc_hanh;
begin
  if nguoi is null then
    raise exception 'Chua dang nhap';
  end if;

  -- Chặn số âm ngay tại đây. Cho phép trừ là cho phép một máy khách bị sửa
  -- kéo cây của người khác... không, của chính họ, về không — mà cây là thứ
  -- họ bỏ hàng tháng vào. Chỉ cộng.
  if d_kiem is null or d_tuoi is null or d_kiem < 0 or d_tuoi < 0 then
    raise exception 'Chi duoc cong them, khong duoc tru';
  end if;

  insert into public.cay_thuc_hanh as c (nguoi_dung, nang_luong_kiem, da_tuoi)
  -- `greatest` cho cả lối chèn mới: một máy đã tưới nhiều hơn số nó còn đếm
  -- được là chuyện có thật, xem ghi chú ở nhánh cập nhật.
  values (nguoi, greatest(d_kiem, d_tuoi), d_tuoi)
  on conflict (nguoi_dung) do update set
    /**
     * Vì sao `greatest` chứ không cộng thẳng.
     *
     * Danh sách buổi dưới máy bị cắt còn 2000 dòng gần nhất (`TOI_DA` trong
     * `src/lib/thuc-hanh.ts`). Người thực hành vài năm thì mấy buổi đầu rụng
     * khỏi danh sách, nên tổng ĐÃ KIẾM đếm lại được tụt xuống dưới tổng ĐÃ
     * TƯỚI. Cộng thẳng là vi phạm ràng buộc `tuoi_khong_qua_kiem`, và lượt
     * tưới của khách bị báo lỗi.
     *
     * Cây đã lớn chính là bằng chứng năng lượng từng được kiếm, nên nâng tổng
     * đã kiếm lên cho khớp là đúng, chứ không phải chặn lượt tưới lại.
     */
    nang_luong_kiem = greatest(c.nang_luong_kiem + d_kiem, c.da_tuoi + d_tuoi),
    da_tuoi         = c.da_tuoi + d_tuoi,
    cap_nhat_luc    = now()
  returning * into dong;

  return dong;
end $$;

-- Chỉ người đã đăng nhập gọi được. `anon` cũng cần, vì khách dùng hồ sơ ẩn
-- danh vẫn là một người dùng thật trong `auth.users` và vẫn có cây riêng.
revoke all on function public.cong_cay_thuc_hanh(integer, integer) from public;
grant execute on function public.cong_cay_thuc_hanh(integer, integer) to authenticated, anon;

comment on function public.cong_cay_thuc_hanh(integer, integer) is
  'Cong them vao cay cua chinh minh. Chi nhan so khong am; khong co duong ghi de.';
