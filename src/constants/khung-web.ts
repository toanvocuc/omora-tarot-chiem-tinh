/**
 * Bó nội dung thành một cột trên web, và nới cột đó ra khi màn đủ rộng.
 *
 * Mọi màn của app này vẽ cho bề ngang điện thoại. Mở trên màn hình máy tính
 * thì cùng bố cục ấy bị kéo ra 1900px: nút "Đăng nhập bằng Google" dài hết
 * màn, dòng chữ trải thành một vệt mỏng, ảnh nền phình méo.
 *
 * Chữa bằng một cột rộng cố định căn giữa, phần còn lại để nền tối.
 *
 * ───────────────────────────────────────────────────────── BẢN PC
 *
 * Cột 480 chữa được chuyện méo, nhưng trên màn 1600 thì 70% màn hình là nền
 * đen trống — user nói thẳng ngày 06/11/2026 là nhìn xấu hơn hẳn bản điện
 * thoại. Nên từ `NGUONG_PC` trở lên, cột nới ra `RONG_PC` và các màn tự xếp
 * lại thành lưới.
 *
 * ĐIỀU KIỆN KHÔNG ĐƯỢC PHÁ: dưới ngưỡng đó mọi thứ phải giống hệt như trước.
 * Web trên điện thoại và hai bản app đều KHÔNG được đổi một pixel nào —
 * user chốt vậy. Vì thế nhánh `Platform.OS !== 'web'` và nhánh hẹp giữ y
 * nguyên công thức cũ `Math.min(w, 480)`.
 *
 * CẠM BẪY đi kèm: `Dimensions.get('window').width` vẫn trả về bề rộng CỬA SỔ
 * chứ không phải bề rộng cột. Sáu chỗ trong app dùng nó để rải sao, rải lá
 * rơi, xoè bài và tính bề ngang thẻ Shop — để nguyên thì sao rơi hết ra ngoài
 * cột và thẻ Shop rộng 1900px trong một cột 480px. Vì vậy MỌI phép đo bề ngang
 * phải đi qua `rongKhung()` chứ không hỏi thẳng `Dimensions`.
 *
 * CẠM BẪY THỨ HAI, do bản PC sinh ra: bốn chỗ gọi `rongKhung()` ở cấp module
 * (`tarot/rut`, `bau-troi-dong`, `la-roi`, và trước đây `nen-sao`) chốt cứng
 * con số lúc NẠP TRANG. Trước đây vô hại vì câu trả lời luôn là 480. Giờ nó
 * đổi theo bề ngang, nên ai kéo cửa sổ qua ngưỡng 1024 sẽ thấy sao rải theo
 * khung cũ cho tới khi tải lại trang. Chấp nhận tạm; chỗ nào sửa được bằng
 * một dòng thì đã sửa (`nen-sao` nay dùng '100%').
 *
 * Chiều CAO thì vẫn hỏi thẳng được — cột cao bằng đúng cửa sổ.
 */

import { Dimensions, Platform, useWindowDimensions, type ViewStyle } from 'react-native';

import { MAU } from '@/constants/giao-dien';

/**
 * Bề rộng cột trên web khi màn hẹp.
 *
 * 480 là cỡ một chiếc điện thoại lớn. Rộng hơn thì mấy màn chỉ có một cột chữ
 * bắt đầu loãng, hẹp hơn thì dải thẻ ở Shop bị cụt.
 */
export const RONG_TOI_DA = 480;

/**
 * Từ bề ngang này trở lên thì coi là máy tính.
 *
 * 1024 chứ không phải 900: máy tính bảng dựng đứng rộng 834–860, và ở cỡ đó
 * lưới hai cột làm mỗi thẻ hẹp hơn cả bản điện thoại. Để tablet đi đường cũ.
 */
export const NGUONG_PC = 1024;

/**
 * Bề rộng cột trên máy tính.
 *
 * 1180 đủ cho lưới hai cột mà mỗi thẻ vẫn khoảng 570 — gần bằng một màn điện
 * thoại, nên chữ trong thẻ không phải xuống dòng kiểu khác. Rộng hơn nữa thì
 * phải nghĩ lại cỡ chữ của cả app chứ không chỉ xếp lại thẻ.
 */
export const RONG_PC = 1180;

/** Bề ngang này có phải là máy tính không. Máy thật thì luôn luôn không. */
export function laManPC(rongCuaSo: number): boolean {
  return Platform.OS === 'web' && rongCuaSo >= NGUONG_PC;
}

/** Trần bề rộng của cột ứng với một bề ngang cửa sổ. */
function tranCot(rongCuaSo: number): number {
  return laManPC(rongCuaSo) ? RONG_PC : RONG_TOI_DA;
}

/** Bề rộng thật của khung app: web thì bó lại, máy thật thì cả màn hình. */
export function rongKhung(rongCuaSo?: number): number {
  const w = rongCuaSo ?? Dimensions.get('window').width;
  return Platform.OS === 'web' ? Math.min(w, tranCot(w)) : w;
}

/**
 * Đang ở bản PC hay không, đọc sống — đổi ngay khi người ta kéo cửa sổ.
 *
 * Màn nào muốn xếp lại bố cục cho máy tính thì hỏi hàm này, đừng tự so
 * `Dimensions` với một con số gõ tay.
 */
export function useManPC(): boolean {
  const { width } = useWindowDimensions();
  return laManPC(width);
}

/**
 * Nền hai bên cột. Tối hơn nền app một bậc để cột nổi lên như một thiết bị
 * đặt trên mặt bàn, thay vì như một trang bị canh lề lệch.
 */
export const NEN_NGOAI = Platform.OS === 'web' ? MAU.nenDen : MAU.nen;

/**
 * Cột nội dung, đọc sống. Trên máy thật đây chỉ là `flex: 1`, không đổi gì.
 *
 * Là hook chứ không phải hằng số vì trần cột nay đổi theo bề ngang cửa sổ.
 */
export function useKhungCot(): ViewStyle {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web') return { flex: 1 };
  return {
    flex: 1,
    width: '100%',
    maxWidth: tranCot(width),
    alignSelf: 'center',
    overflow: 'hidden',
  };
}
