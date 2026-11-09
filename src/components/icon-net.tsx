/**
 * Bộ icon nét mảnh, lấy nguyên từ bản mẫu của bên GPT.
 *
 * ─────────────────────────────────────────── VÌ SAO KHÔNG DÙNG IONICONS
 *
 * App đã có `@expo/vector-icons/Ionicons` và dùng ở thanh điều hướng. Nhưng
 * Ionicons là bộ icon của Apple/Google: nét dày, bo tròn, hiện đại. Đặt cạnh
 * khung hoa văn vàng và chữ serif của Omora thì nó lạc — giống như dán một
 * biểu tượng ứng dụng ngân hàng lên bìa một cuốn sách cổ.
 *
 * Bộ dưới đây nét 1.5, đầu nét bo tròn, vẽ thưa. Số đo lấy đúng bản mẫu:
 *
 *     stroke-width 1.5 · stroke-linecap round · stroke-linejoin round
 *     viewBox 0 0 24 24 · fill none
 *
 * Mỗi icon chỉ là MỘT đường `d`. Gọn tới mức để thẳng trong tệp này được, khỏi
 * thêm phụ thuộc nào.
 */

import Svg, { Path } from 'react-native-svg';

import { MAU } from '@/constants/giao-dien';

/** Đường vẽ của từng icon, chép nguyên từ `dist/app.js` của bản mẫu. */
const NET = {
  /** Ba luồng gió — bài thở. */
  gio: 'M2 8h13a3 3 0 1 0-3-3M2 12h18a3 3 0 1 1-3 3M2 16h7a3 3 0 1 1-3 3',
  /** Trăng khuyết — ngồi thiền. */
  trang: 'M20 15A8 8 0 0 1 9 4a8.5 8.5 0 1 0 11 11Z',
  /** Ngòi bút — viết. */
  but: 'm3 17-1 5 5-1L21 7l-5-5L3 17Zm11-13 5 5',
  /** Bảng màu — vẽ và chụp. */
  ve: 'M12 3 4 17l8 5 8-5-8-14Zm0 0v10m-8 4h16M10 15a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
  /** Mặt trời — tổng quan. */
  troi: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  /** Trái tim — tình cảm. */
  tim: 'M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-4 4 1 9 8 15 7-6 12-11 8-15Z',
  /** Cuốn sách — công việc. */
  sach: 'M12 5C8 2 3 3 2 4v16c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1Zm0 0v16',
  /** Chiếc lá — chăm sóc bản thân. */
  la: 'M20 3C8 2 2 8 5 16c5 7 16 2 15-13ZM4 21 16 8',
  /** Hai người — mời trò chuyện với chuyên gia. */
  nguoi: 'M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M2 21v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8m2 3a5 5 0 0 1 3 5',
  /** Mũi tên sang phải. */
  muiTen: 'M4 12h16m-6-6 6 6-6 6',
  /** Giọt nước — tưới cây. */
  nuoc: 'M12 2S4 10 4 15a8 8 0 0 0 16 0c0-5-8-13-8-13ZM8 15a4 4 0 0 0 4 4',
  /** Máy ảnh — đính một tấm ảnh. */
  mayAnh: 'M3 7h4l2-4h6l2 4h4v14H3V7Zm9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  /** Thùng rác — xoá một trang đã cất. */
  thungRac: 'M3 6h18M8 6V3h8v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  /** Dấu cộng — mở một trang mới. */
  them: 'M12 4v16M4 12h16',
  /** Kính lúp — tìm trong nhật ký. */
  timKiem: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',
} as const;

export type TenIcon = keyof typeof NET;

export function IconNet({
  ten,
  co = 20,
  mau = MAU.vang,
  day = 1.5,
}: {
  ten: TenIcon;
  co?: number;
  mau?: string;
  /** Bề dày nét. Bản mẫu dùng 1.5 cho cỡ 20, và dày hơn chút ở cỡ lớn. */
  day?: number;
}) {
  return (
    <Svg width={co} height={co} viewBox="0 0 24 24">
      <Path
        d={NET[ten]}
        fill="none"
        stroke={mau}
        strokeWidth={day}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
