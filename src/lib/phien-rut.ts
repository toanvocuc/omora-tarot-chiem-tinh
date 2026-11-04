/**
 * Giữ lần rút vừa xong để màn kết quả và màn chia sẻ đọc.
 *
 * ─────────────────────────────────────────────── VÌ SAO PHẢI CẤT XUỐNG MÁY
 *
 * Trước đây chỗ này chỉ là một biến trong bộ nhớ. Nạp lại trang là mất, nên
 * bấm F5 ở màn kết quả thì hiện "Chưa có lần rút nào" — trong khi dòng ghi
 * xuống bảng `lan_rut` vẫn còn, tức là lượt rút đã bị trừ thật. Người dùng
 * thấy một màn trống và mất một lượt (người kiểm thử báo 2026-11-04).
 *
 * Nay cất xuống máy, nạp lại thì thấy đúng mấy lá vừa rút.
 *
 * Cất kèm cờ `daGhi`. Bỏ cờ ra khỏi phần cất là hỏng nặng hơn lỗi ban đầu:
 * màn kết quả ghi `lan_rut` lúc dựng, nạp lại trang mà cờ về false thì mỗi
 * lần F5 lại ăn thêm một lượt.
 *
 * Cất kèm cả `ngay`. Phiên chỉ sống trong ngày rút: số lượt đặt lại theo ngày,
 * nên mở app hôm sau mà màn kết quả còn bày lá của hôm qua thì vừa khó hiểu
 * vừa dễ tưởng là lượt hôm nay.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { MAU_LA_BAI } from '@/data/noi-dung-mau';
import { giuTheoNguoi } from '@/lib/kho-theo-nguoi';
import { VI_TRI, type LaDaRut } from '@/lib/tarot';
import { XEM_THU } from '@/lib/xem-thu';

const KHOA = 'omora-phien-rut';
const KHOA_CHU = 'omora-phien-rut-chu';

type Phien = { cacLa: LaDaRut[]; daGhi: boolean; ngay: string };

let phien: Phien | null = null;
let daNap = false;
let dangNapHua: Promise<void> | null = null;
const nghe = new Set<() => void>();

/**
 * Bản chụp cho `useSyncExternalStore`.
 *
 * Phải là MỘT vật giữ nguyên danh tính giữa hai lần báo. Dựng vật mới mỗi lần
 * React hỏi là nó thấy "đổi rồi" ở mọi lần dựng và quay vòng vô tận.
 */
let anh: { phien: Phien | null; dangNap: boolean } = { phien: null, dangNap: true };

function homNay(): string {
  const d = new Date();
  const hai = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${hai(d.getMonth() + 1)}-${hai(d.getDate())}`;
}

function bao() {
  anh = { phien, dangNap: !daNap };
  nghe.forEach((f) => f());
}

function luu() {
  const viec = phien
    ? AsyncStorage.setItem(KHOA, JSON.stringify(phien))
    : AsyncStorage.removeItem(KHOA);
  viec.catch(() => {
    // Không ghi được thì thôi, phiên vẫn còn trong lần chạy này.
  });
}

/**
 * Chỉ nhận lại thứ đúng hình dạng.
 *
 * Dữ liệu dưới máy có thể là của bản app đời trước, hoặc bị sửa tay trên web.
 * Dựng màn kết quả bằng một vật thiếu trường là màn trắng kèm lỗi, khó lần ra
 * hơn nhiều so với việc coi như chưa rút.
 */
function hopLe(x: unknown): x is Phien {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  if (typeof p.ngay !== 'string' || !Array.isArray(p.cacLa) || !p.cacLa.length) return false;
  return p.cacLa.every((l) => {
    if (!l || typeof l !== 'object') return false;
    const m = l as Record<string, unknown>;
    const la = m.la as Record<string, unknown> | undefined;
    return (
      typeof m.viTri === 'string' &&
      typeof m.nguoc === 'boolean' &&
      !!la &&
      typeof la.ma === 'string' &&
      typeof la.tenEn === 'string'
    );
  });
}

function doNap(): Promise<void> {
  return (async () => {
    try {
      const chu = await AsyncStorage.getItem(KHOA);
      if (!chu) return;
      const doc: unknown = JSON.parse(chu);
      if (!hopLe(doc)) return;
      // Phiên của hôm qua thì bỏ, và dọn luôn ô nhớ cho khỏi đọc lại mỗi lần.
      if (doc.ngay !== homNay()) {
        await AsyncStorage.removeItem(KHOA);
        return;
      }
      phien = doc;
      bao();
    } catch {
      // Hỏng thì coi như chưa rút lần nào.
    } finally {
      daNap = true;
      // Báo lần nữa kể cả khi không nạp được gì: `dangNap` vừa tắt, màn hình
      // đang chờ đúng tín hiệu này để thôi hiện vòng xoay.
      bao();
    }
  })();
}

function nap(): Promise<void> {
  if (!dangNapHua) dangNapHua = doNap();
  return dangNapHua;
}

/**
 * Đặt lần rút vừa xong.
 *
 * `cat` là có cất xuống máy hay không. Nút "Lưu ảnh để chia sẻ" ở khối lá bài
 * hôm nay cũng mượn chỗ này để đẩy một lá sang màn chia sẻ — đó không phải
 * một lần rút, nên không được đè lên lần rút thật đang nằm dưới máy.
 */
export function datPhien(cacLa: LaDaRut[], cat = true) {
  phien = { cacLa, daGhi: false, ngay: homNay() };
  daNap = true;
  if (cat) luu();
  bao();
}

/**
 * Đánh dấu lần rút này đã ghi xuống máy chủ.
 *
 * Màn kết quả ghi vào bảng lan_rut lúc dựng. Quay lại màn đó, ví dụ từ màn chia
 * sẻ, là nó dựng lại và ghi thêm một dòng nữa. Mà số dòng trong ngày chính là số
 * lượt rút còn lại, nên khách mất một lượt mình không hề dùng.
 *
 * Sửa tại chỗ chứ không dựng vật mới: không màn nào bày cờ này ra, mà đổi danh
 * tính của vật là mọi màn đang giữ nó phải dựng lại một lượt không vì lý do gì.
 */
export function danhDauDaGhi(da = true) {
  if (!phien) return;
  phien.daGhi = da;
  luu();
}

/**
 * Chế độ xem thử dựng sẵn một lần rút ba lá, để vào thẳng màn kết quả vẫn xem
 * được mà không phải bấm qua màn rút. Bản chạy thật trả null như cũ, nên khách
 * vào thẳng đường dẫn đó vẫn thấy câu nhắc quay lại rút bài.
 */
export function layPhien() {
  if (!phien && XEM_THU) {
    const viTri = VI_TRI['ba-la'];
    phien = {
      cacLa: viTri.map((v, i) => ({
        la: MAU_LA_BAI[i * 7 + 3],
        nguoc: i === 1,
        viTri: v,
      })),
      // Chế độ xem thử không ghi gì xuống máy chủ, nên coi như đã ghi rồi.
      daGhi: true,
      ngay: homNay(),
    };
  }
  return phien;
}

/**
 * Phiên rút kèm trạng thái "còn đang đọc ổ đĩa".
 *
 * Màn hình PHẢI chờ `dangNap` tắt rồi mới được kết luận là chưa rút lần nào.
 * Đọc ổ đĩa là việc không đồng bộ, nên lần dựng đầu tiên sau khi nạp lại trang
 * bao giờ cũng thấy phiên rỗng — kết luận ngay ở đó là lại hiện đúng cái màn
 * "Chưa có lần rút nào" mà ta đang đi chữa.
 *
 * ──────────────────────── ĐỪNG ĐỌC BIẾN CỦA MODULE NGAY TRONG HÀM DỰNG
 *
 * Dự án bật `reactCompiler` (xem `experiments` trong app.json). Bản vá đầu tiên
 * của tôi viết `return { phien: layPhien(), dangNap }`, và trình biên dịch coi
 * `layPhien()` là lời gọi thuần không phụ thuộc gì nên TÍNH MỘT LẦN rồi nhớ
 * cứng vào ô nhớ của hàm dựng:
 *
 *     n[3] === Symbol.for("react.memo_cache_sentinel") ? (f = S(), n[3] = f) : f = n[3]
 *
 * Hậu quả: đọc ổ đĩa xong, biến trong module đã có phiên, mà hook vẫn trả null
 * mãi mãi — màn hình trắng y như trước khi sửa. Mất một vòng dò mới ra, vì mọi
 * đầu đo đặt trong module đều báo "đã nạp xong" cả.
 *
 * `useSyncExternalStore` là đúng công cụ cho chuyện này: React tự đăng ký nghe
 * và tự hỏi lại bản chụp, nên không có gì để trình biên dịch gộp đi.
 */
export function usePhien(): { phien: Phien | null; dangNap: boolean } {
  return useSyncExternalStore(dangKy, docAnh, docAnh);
}

function dangKy(f: () => void): () => void {
  nghe.add(f);
  void nap();
  return () => {
    nghe.delete(f);
  };
}

function docAnh() {
  return anh;
}

/**
 * Lần rút buộc vào đúng một người.
 *
 * Dùng `giuTheoNguoi` chứ không dùng thẳng `khiDoiTaiKhoan`: thẻ phiên hết hạn
 * cũng phát ra tín hiệu đổi tài khoản, mà xoá dữ liệu vì cớ đó thì đã làm mất
 * nhật ký của người dùng một lần rồi — đọc `lib/kho-theo-nguoi.ts`.
 */
// Chế độ xem thử dựng sẵn một phiên ngay lúc nạp module, nên bản chụp đầu
// tiên phải lấy theo nó, không thì màn kết quả chớp một nhịp trống.
anh = { phien: layPhien(), dangNap: !daNap };

giuTheoNguoi(KHOA_CHU, {
  quen: () => {
    phien = null;
    bao();
  },
  xoa: () => {
    phien = null;
    AsyncStorage.removeItem(KHOA).catch(() => {});
    bao();
  },
  nap: () => {
    daNap = false;
    dangNapHua = null;
    void nap();
  },
});
