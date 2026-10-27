/**
 * Hộp thoại hỏi lại — thay cho `Alert.alert` của React Native.
 *
 * ─────────────────────────────────────────────────────────── VÌ SAO PHẢI TỰ VIẾT
 *
 * `Alert.alert` KHÔNG CHẠY trên web. Không phải chạy sai, mà là hàm rỗng. Mở
 * `node_modules/react-native-web/dist/exports/Alert/index.js` ra đọc, toàn bộ
 * nội dung của nó là:
 *
 *     class Alert { static alert() {} }
 *
 * Nghĩa là trên bản web, mọi câu hỏi lại đều im lặng tuyệt đối: khách bấm
 * "Huỷ đơn" thì không có gì hiện ra và đơn không bao giờ bị huỷ; bấm "Đăng
 * xuất" thì không đăng xuất được; mạng hỏng thì nút trông như chết vì dòng
 * "Chưa đổi được" cũng không hiện. Không có lỗi nào trong bảng điều khiển để
 * lần ra.
 *
 * Chỗ này từng có 27 lời gọi `Alert.alert`, trong đó 17 cái là hỏi-lại-có-nút.
 * Trên máy thật chúng chạy bình thường, nên lỗi chỉ lộ ra ở bản web.
 *
 * ──────────────────────────────────────────────────────────────── CÁCH DÙNG
 *
 * Giữ nguyên chữ ký của `Alert.alert` để chỗ gọi khỏi phải viết lại:
 *
 *     hoi('Huỷ yêu cầu này?', 'Không lấy lại được.', [
 *       { nhan: 'Thôi', kieu: 'bo' },
 *       { nhan: 'Huỷ đơn', kieu: 'manh', onPress: () => huy() },
 *     ]);
 *
 * Không truyền nút thì mặc định hiện một nút "Đã hiểu".
 *
 * Trạng thái sống ở CẤP MODULE chứ không trong một hook, để gọi được từ bất kỳ
 * đâu — kể cả ngoài thân thành phần, y như `Alert.alert` trước đây. Thành phần
 * `<HopThoai />` gắn một lần duy nhất ở `app/_layout.tsx` sẽ vẽ nó ra.
 */

export type KieuNut = 'thuong' | 'bo' | 'manh';

export type NutHoi = {
  nhan: string;
  onPress?: () => void;
  /** `bo` = nút thoát, `manh` = việc không lấy lại được (xoá, huỷ). */
  kieu?: KieuNut;
};

export type NoiDungHoi = {
  tieuDe: string;
  than?: string;
  nut: NutHoi[];
};

type NguoiNghe = (noiDung: NoiDungHoi | null) => void;

let dangHien: NoiDungHoi | null = null;
const nguoiNghe = new Set<NguoiNghe>();

function bao() {
  for (const f of nguoiNghe) f(dangHien);
}

/**
 * Mở hộp thoại. Thay thẳng cho `Alert.alert`.
 *
 * Lời gọi sau đè lên lời gọi trước. Đây là hành vi CỐ Ý và giống `Alert`: hai
 * câu hỏi chồng nhau thì khách không biết mình đang trả lời câu nào.
 */
export function hoi(tieuDe: string, than?: string, nut?: NutHoi[]) {
  dangHien = {
    tieuDe,
    than,
    nut: nut && nut.length > 0 ? nut : [{ nhan: 'Đã hiểu' }],
  };
  bao();
}

/** Đóng hộp thoại mà không chạy nút nào. */
export function dongHoi() {
  if (dangHien === null) return;
  dangHien = null;
  bao();
}

export function ngheHoi(f: NguoiNghe): () => void {
  nguoiNghe.add(f);
  // Báo ngay trạng thái hiện tại: thành phần gắn vào sau lúc `hoi()` được gọi
  // thì không có lần báo nào nữa để mà nghe.
  f(dangHien);
  return () => {
    nguoiNghe.delete(f);
  };
}
