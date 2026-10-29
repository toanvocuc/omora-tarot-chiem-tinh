/**
 * Logo Omora.
 *
 * ĐÃ THAY ngày 2026-10-27. Bản cũ là bàn tay huyền bí kèm trăng lưỡi liềm và
 * ngôi sao — đúng thứ hình khiến app bị từ chối hai lần theo điều 4.3(b). Lúc
 * đổi biểu tượng app hôm 24/10 tôi chỉ đổi `assets/images/`, bỏ sót ba tệp
 * trong `assets/logo/` này, nên bàn tay vẫn còn nguyên ở BA MÀN người duyệt
 * chắc chắn thấy: đăng nhập, mở đầu nhập hồ sơ, và màn hoàn tất.
 *
 * ĐỔI LẦN HAI ngày 2026-10-29: vàng ánh kim thay cho xanh lá, theo bản sếp
 * gửi. Chỉ đổi ở nhánh Android/web này, nhánh iOS giữ nguyên bản xanh.
 *
 * Ảnh gốc là nét vàng PHÁT SÁNG vẽ trên nền đen, không phải nét trên nền
 * trong suốt, nên phải khử nhân-sẵn trước khi dùng — để nguyên là 19,3% số ô
 * làm tối nền xanh của app, thành một đĩa đen sau vòng tròn. Cách dựng ở
 * assets/logo/NGUON.md.
 */

import { Image } from 'expo-image';

/**
 * Tỷ lệ thật của hai file, để đặt chiều cao theo chiều ngang mà không méo.
 *
 * Đổi theo logo mới: bản cũ cao hơn rộng (612×768), bản mới gần vuông. Quên
 * sửa hai số này là logo bị kéo dẹt.
 */
const TY_LE_DAY_DU = 600 / 510;
const TY_LE_DAU = 600 / 516;

/** Logo đủ chữ OMORA. Dùng ở màn chào mừng và thẻ chia sẻ. */
export function Logo({ rong = 150 }: { rong?: number }) {
  return (
    <Image
      source={require('@/assets/logo/omora-day-du.png')}
      style={{ width: rong, height: rong / TY_LE_DAY_DU }}
      contentFit="contain"
    />
  );
}

/** Chỉ còn hình, không có chữ. Dùng khi tên app đã nằm ngay cạnh. */
export function LogoDau({ rong = 64 }: { rong?: number }) {
  return (
    <Image
      source={require('@/assets/logo/omora-dau.png')}
      style={{ width: rong, height: rong / TY_LE_DAU }}
      contentFit="contain"
    />
  );
}
