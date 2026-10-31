/**
 * Bó nội dung thành một cột trên web.
 *
 * Mọi màn của app này vẽ cho bề ngang điện thoại. Mở trên màn hình máy tính
 * thì cùng bố cục ấy bị kéo ra 1900px: nút "Đăng nhập bằng Google" dài hết
 * màn, dòng chữ trải thành một vệt mỏng, ảnh nền phình méo.
 *
 * Chữa bằng một cột rộng cố định căn giữa, phần còn lại để nền tối.
 *
 * CẠM BẪY đi kèm: `Dimensions.get('window').width` vẫn trả về bề rộng CỬA SỔ
 * chứ không phải bề rộng cột. Sáu chỗ trong app dùng nó để rải sao, rải lá
 * rơi, xoè bài và tính bề ngang thẻ Shop — để nguyên thì sao rơi hết ra ngoài
 * cột và thẻ Shop rộng 1900px trong một cột 480px. Vì vậy MỌI phép đo bề ngang
 * phải đi qua `rongKhung()` chứ không hỏi thẳng `Dimensions`.
 *
 * Chiều CAO thì vẫn hỏi thẳng được — cột cao bằng đúng cửa sổ.
 */

import { Dimensions, Platform, type ViewStyle } from 'react-native';

import { MAU } from '@/constants/giao-dien';

/**
 * Bề rộng cột trên web.
 *
 * 480 là cỡ một chiếc điện thoại lớn. Rộng hơn thì mấy màn chỉ có một cột chữ
 * bắt đầu loãng, hẹp hơn thì dải thẻ ở Shop bị cụt.
 */
export const RONG_TOI_DA = 480;

/** Bề rộng thật của khung app: web thì bó lại, máy thật thì cả màn hình. */
export function rongKhung(rongCuaSo?: number): number {
  const w = rongCuaSo ?? Dimensions.get('window').width;
  return Platform.OS === 'web' ? Math.min(w, RONG_TOI_DA) : w;
}

/**
 * Nền hai bên cột. Tối hơn nền app một bậc để cột nổi lên như một thiết bị
 * đặt trên mặt bàn, thay vì như một trang bị canh lề lệch.
 */
export const NEN_NGOAI = Platform.OS === 'web' ? MAU.nenDen : MAU.nen;

/** Cột nội dung. Trên máy thật đây chỉ là `flex: 1`, không đổi gì. */
export const KHUNG_COT: ViewStyle =
  Platform.OS === 'web'
    ? { flex: 1, width: '100%', maxWidth: RONG_TOI_DA, alignSelf: 'center', overflow: 'hidden' }
    : { flex: 1 };
