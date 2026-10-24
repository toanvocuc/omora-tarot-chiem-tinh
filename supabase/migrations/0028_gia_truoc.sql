-- Giá trước khi giảm, để hiện kiểu gạch ngang như mấy sàn bán hàng.
--
-- ───────────────────────────────────────────────── GIÁ GẠCH NGANG PHẢI LÀ GIÁ THẬT
--
-- `gia_truoc` là giá cửa hàng ĐÃ TỪNG bán, không phải một con số thổi lên cho
-- phần trăm giảm nhìn đẹp. Gạch một cái giá chưa bao giờ có thật là quảng cáo
-- sai sự thật: luật giá phạt được, Apple cũng gạt được app vì nó.
--
-- Nên chỉ điền ô này khi giá cũ có thật. Để trống thì app không hiện gạch ngang
-- và không hiện nhãn phần trăm — không có gì để khoe thì thôi, đừng bịa.
--
-- Và nhớ: giá ở đây là giá cửa hàng sẽ phải báo lại khi khách nhắn Zalo. Hạ ở
-- app mà bên kia báo giá cũ thì mất lòng tin ngay, nặng hơn cả không giảm.

alter table san_pham
  add column if not exists gia_truoc integer check (gia_truoc is null or gia_truoc > 0);

comment on column san_pham.gia_truoc is
  'Giá ĐÃ TỪNG bán, chỉ điền khi có thật. Null thì không hiện gạch ngang.';

-- Giảm cho ba món đang nổi bật tuần này. Giá cũ chính là giá trong bảng giá
-- cửa hàng gửi, giá mới là giá đã hạ thật — hai con số đều có thật.
--
--   Vòng Lam Ngọc Jade      280.000 -> 266.000   (-5%)
--   Vòng hoa sen thạch anh  230.000 -> 207.000   (-10%)
--   Bát tụ bảo Phát Tài     360.000 -> 342.000   (-5%)
--
-- Hai món có bậc giá theo số lượng cố ý chỉ giảm 5%: giảm 10% thì giá lẻ gần
-- bằng giá lấy nhiều, và bậc giá mất hết ý nghĩa.

update san_pham set gia_truoc = 280000, gia = 266000 where ma = 'vong-lam-ngoc-jade-10ly';
update san_pham set gia_truoc = 230000, gia = 207000 where ma = 'vong-hoa-sen-thach-anh-toc-do';
update san_pham set gia_truoc = 360000, gia = 342000 where ma = 'bat-tu-bao-ngoc-hoang-long-phat-tai';
