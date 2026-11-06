/**
 * Bề rộng và khung của bản web, chia hai đường hẳn: điện thoại và máy tính.
 *
 * ─────────────────────────────────────────────── BẢN ĐIỆN THOẠI (giữ nguyên)
 *
 * Mọi màn của app này vẽ cho bề ngang điện thoại. Mở trên màn hình máy tính
 * thì cùng bố cục ấy bị kéo ra 1900px: nút "Đăng nhập bằng Google" dài hết
 * màn, dòng chữ trải thành một vệt mỏng, ảnh nền phình méo. Chữa bằng một cột
 * rộng cố định căn giữa, phần còn lại để nền tối.
 *
 * ─────────────────────────────────────────────────────────── BẢN MÁY TÍNH
 *
 * Lần đầu tôi chỉ nới cột lên 1180 rồi để nguyên cỡ chữ. Sếp bác thẳng ngày
 * 06/11/2026: trên màn 1920 nó vẫn là một hộp hẹp giữa hai mảng đen, chữ bé
 * tí. Số đo dưới đây ĐO THẲNG TỪ BẢN MẪU, không phải tôi tự chọn:
 *
 *   thanh điều hướng   trải hết cửa sổ, cao 77, lòng trong tối đa 1512
 *   khung nội dung     cửa sổ trừ hai bên, tối đa 1420
 *   lòng khung         1420 trừ đệm hai bên 125 = 1170 ở màn 1920
 *   tiêu đề màn        64 (riêng màn Khám phá 77)
 *
 * ────────────────────────────────────────────────────────── CẠM BẪY CÒN LẠI
 *
 * `Dimensions.get('window').width` trả về bề ngang CỬA SỔ chứ không phải bề
 * ngang lòng khung. Sáu chỗ trong app dùng nó để rải sao, rải lá rơi, xoè bài
 * và tính bề ngang thẻ Shop — để nguyên thì sao rơi hết ra ngoài khung. Vì vậy
 * MỌI phép đo bề ngang phải đi qua `rongKhung()` chứ không hỏi thẳng
 * `Dimensions`.
 *
 * Và bốn chỗ gọi `rongKhung()` ở CẤP MODULE (`tarot/rut`, `bau-troi-dong`,
 * `la-roi`) chốt cứng con số lúc nạp trang. Kéo cửa sổ qua ngưỡng 1024 thì
 * chúng còn dùng số cũ cho tới khi tải lại trang.
 *
 * Chiều CAO thì vẫn hỏi thẳng được.
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

/** Bề rộng tối đa của khung hoa văn trên máy tính. */
export const RONG_PC = 1420;

/** Bề rộng tối đa của lòng trong thanh điều hướng. */
export const RONG_THANH = 1512;

/** Bề ngang này có phải là máy tính không. Máy thật thì luôn luôn không. */
export function laManPC(rongCuaSo: number): boolean {
  return Platform.OS === 'web' && rongCuaSo >= NGUONG_PC;
}

/** Kẹp một giá trị theo bề ngang cửa sổ, đúng cách `clamp()` của CSS. */
function kep(it: number, theoManHinh: number, nhieu: number, rongCuaSo: number): number {
  return Math.round(Math.min(nhieu, Math.max(it, rongCuaSo * theoManHinh)));
}

/**
 * Số đo của khung hoa văn ứng với một bề ngang cửa sổ.
 *
 * Để ở đây chứ không ở `components/khung-pc` vì `rongKhung()` ngay dưới cũng
 * cần con số lòng khung — để bên kia là hai tệp nhập lẫn nhau thành vòng.
 */
export function soDoKhung(rongCuaSo: number) {
  const rong = Math.min(RONG_PC, rongCuaSo - kep(28, 0.05, 88, rongCuaSo));
  const demNgang = kep(50, 0.074, 125, rongCuaSo);
  return {
    rong,
    demNgang,
    demTren: kep(62, 0.052, 82, rongCuaSo),
    demDuoi: kep(56, 0.054, 82, rongCuaSo),
    /**
     * Bề dày dải hoa văn: cạnh trên dưới, rồi cạnh trái phải.
     *
     * Lần đầu tôi lấy nhầm con số: `clamp(100,10.9vw,167)` và
     * `clamp(73,8.2vw,126)` là luật ĐẦU TIÊN trong `discovery.css`, nhưng
     * cuối tệp bản mẫu còn một luật ghi đè nữa, kèm ghi chú của chính họ:
     * "giữ góc trăng và ngôi sao giữa đúng tỷ lệ trên màn rộng".
     *
     *     --frame-side: clamp(96px, 10.7vw, 163px)
     *     --frame-cap:  var(--frame-side) * 1.3333
     *
     * Ở màn 1920 ra 163 và 217, chứ không phải 126 và 167. Thiếu nó thì dải
     * hoa văn bị nén dọc hơn ba lần trong khi kéo ngang — thành một vệt nhoè,
     * đúng chỗ sếp chê ngày 07/11/2026.
     */
    vienNgang: kep(96, 0.107, 163, rongCuaSo),
    vienDoc: Math.round(kep(96, 0.107, 163, rongCuaSo) * 1.3333),
    /** Lòng khung — chỗ nội dung thật sự nằm. 1170 ở màn 1920. */
    long: Math.max(320, rong - demNgang * 2),
  };
}

/**
 * Bề rộng thật của chỗ nội dung nằm.
 *
 * Máy thật: cả màn hình. Web hẹp: cột 480. Web rộng: LÒNG khung hoa văn, chứ
 * không phải cả cửa sổ và cũng không phải cả khung — sao rải ra ngoài lòng là
 * chui xuống dưới dải hoa văn.
 */
export function rongKhung(rongCuaSo?: number): number {
  const w = rongCuaSo ?? Dimensions.get('window').width;
  if (Platform.OS !== 'web') return w;
  if (laManPC(w)) return soDoKhung(w).long;
  return Math.min(w, RONG_TOI_DA);
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
 * Nền ngoài khung.
 *
 * Bản điện thoại: tối hơn nền app một bậc để cột nổi lên như một thiết bị đặt
 * trên mặt bàn. Bản máy tính dùng cùng màu đó làm nền cả trang.
 */
export const NEN_NGOAI = Platform.OS === 'web' ? MAU.nenDen : MAU.nen;

/**
 * Khung ngoài cùng của app.
 *
 * Máy thật luôn là `flex: 1`. Trên máy tính, màn nào có thanh điều hướng thì
 * cũng `flex: 1` — việc bó bề ngang giao cho `components/khung-pc`, và thanh
 * điều hướng thì PHẢI trải hết cửa sổ nên không được bó ở đây.
 *
 * `rongHet = false` cho mấy màn KHÔNG có thanh trên: đăng nhập và luồng nhập
 * hồ sơ. Chúng tự dựng nền riêng, không đi qua `ManHinh`, nên không có khung
 * hoa văn nào bó lại — thả `flex: 1` là nút "Đăng nhập bằng Google" dài hết
 * 1920 và chữ trải thành một vệt mỏng, đúng cảnh cột 480 sinh ra để chữa.
 */
export function useKhungCot(rongHet = true): ViewStyle {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'web' || (laManPC(width) && rongHet)) return { flex: 1 };
  return {
    flex: 1,
    width: '100%',
    maxWidth: RONG_TOI_DA,
    alignSelf: 'center',
    overflow: 'hidden',
  };
}
