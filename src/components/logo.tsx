/**
 * Logo Omora.
 *
 * ĐÃ THAY ngày 2026-10-27. Bản cũ là bàn tay huyền bí kèm trăng lưỡi liềm và
 * ngôi sao — đúng thứ hình khiến app bị từ chối hai lần theo điều 4.3(b). Lúc
 * đổi biểu tượng app hôm 24/10 tôi chỉ đổi `assets/images/`, bỏ sót ba tệp
 * trong `assets/logo/` này, nên bàn tay vẫn còn nguyên ở BA MÀN người duyệt
 * chắc chắn thấy: đăng nhập, mở đầu nhập hồ sơ, và màn hoàn tất.
 *
 * Bản mới cắt từ `assets/images/logo-goc.png` — vòng tròn xanh lá, gương mặt
 * nhìn nghiêng bằng khoảng âm. Xem cách dựng ở assets/logo/NGUON.md.
 */

import { Image } from 'expo-image';

/**
 * Tỷ lệ thật của hai file, để đặt chiều cao theo chiều ngang mà không méo.
 *
 * Đổi theo logo mới: bản cũ cao hơn rộng (612×768), bản mới gần vuông. Quên
 * sửa hai số này là logo bị kéo dẹt.
 */
const TY_LE_DAY_DU = 600 / 585;
const TY_LE_DAU = 600 / 553;

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
