/**
 * Mở Zalo để khách nhắn cho thầy.
 *
 * Tách ra khỏi component vì giờ có hai chỗ gọi: khối mời ở cuối màn kết quả, và
 * nút trong hồ sơ thầy. Hai chỗ đó dùng số Zalo khác nhau — khối mời dùng số
 * chung, hồ sơ dùng số riêng của từng thầy — nên không gộp được bằng cách để
 * nguyên trong component.
 *
 * Về đo đếm: khách bấm sang Zalo rồi thì app không theo dõi được nữa. Mỗi lần
 * bấm sinh một mã ngắn, chép sẵn vào lời nhắn. Người trực Zalo ghi mã đó lại là
 * khớp được hai đầu. Bỏ mã đi thì con số báo lên chỉ là số lượt bấm, không phải
 * số khách thật.
 */

import * as Clipboard from 'expo-clipboard';
import { Linking, Platform } from 'react-native';

import { hoi } from '@/lib/hoi-lai';
import { ghiLuotBamZalo } from '@/lib/su-kien';

/** Số dùng khi thầy chưa khai số riêng. */
export const ZALO_CHUNG = process.env.EXPO_PUBLIC_ZALO_CONG_TY ?? '';

/**
 * Giữ sẵn một tab trống TRƯỚC khi làm mấy việc chậm. Chỉ cần trên web.
 *
 * Trên web, `Linking.openURL` chính là `window.open`. Trình duyệt chỉ cho mở
 * cửa sổ mới khi lệnh chạy NGAY trong nhịp người dùng bấm — mà hàm dưới đây có
 * hai lượt chờ trước đó: ghi lượt bấm lên máy chủ, rồi chép lời nhắn. Chờ mạng
 * xong là mất quyền, cửa sổ bị chặn, và `openURL` vẫn trả về thành công nên app
 * không báo gì. Khách bấm nút Zalo và KHÔNG CÓ GÌ XẢY RA.
 *
 * Đã đo trên chính trang thật: mở ngay thì được, mở sau 400ms thì bị chặn.
 *
 * Nên giành lấy cái tab ngay từ nhịp bấm, rồi mới trỏ nó tới địa chỉ thật.
 * Trên máy thật không có chuyện này, cứ gọi `openURL` như cũ.
 */
function giuChoTab(): (duong: string) => void {
  const mo = (duong: string) => {
    Linking.openURL(duong).catch(() => {});
  };
  if (Platform.OS !== 'web' || typeof window === 'undefined') return mo;
  const tab = window.open('', '_blank');
  if (!tab) return mo; // bị chặn ngay từ đầu thì thử cách cũ, may ra còn được
  return (duong: string) => {
    tab.location.href = duong;
  };
}

export async function moZalo(soZalo: string | null | undefined, manHinh: string) {
  // Giành tab TRƯỚC mọi lệnh chờ. Xem chú thích của `giuChoTab`.
  const trangToi = giuChoTab();
  const so = soZalo?.trim() || ZALO_CHUNG;

  // Mã chỉ chép cho khách khi máy chủ đã nhận. Chép mã mà không ghi được thì
  // người trực Zalo tra không ra, còn con số phễu báo lên sếp thì hụt.
  const ma = await ghiLuotBamZalo(manHinh);
  await Clipboard.setStringAsync(ma ? `Mình đến từ app, mã ${ma}` : 'Mình đến từ app');

  if (!so) {
    trangToi('about:blank');
    hoi('Chưa có số Zalo', 'Chưa khai số Zalo cho thầy này.');
    return;
  }
  const duong = `https://zalo.me/${so}`;
  // Bỏ `canOpenURL`: trên web nó LUÔN trả về true (react-native-web viết cứng
  // `Promise.resolve(true)`), nên câu kiểm này không lọc được gì mà chỉ thêm
  // một lượt chờ nữa trước khi mở.
  trangToi(duong);
}
