/**
 * Thực hành — thở, ngồi thiền, viết, vẽ — cất xuống máy.
 *
 * ─────────────────────────────────────────────────── NẰM TRÊN MÁY, KHÔNG GỬI ĐI
 *
 * Buổi thực hành và chữ khách viết KHÔNG rời khỏi máy. Không bảng nào dưới máy
 * chủ giữ chúng, chuyên gia cũng không đọc được. Đây là thứ riêng tư nhất trong
 * cả app — người ta viết ra chuyện mệt mỏi của mình — nên để nguyên trên máy là
 * ranh giới đã chọn, không phải chuyện chưa làm tới.
 *
 * Đổi máy thì mất. Đó là cái giá, và nó đáng.
 *
 * ────────────────────────────────────────────────────────── KHÔNG HỨA CHỮA GÌ
 *
 * Mọi câu chữ ở đây tả VIỆC NGƯỜI DÙNG LÀM, không tả thứ nó chữa: "bài thở 5
 * phút", không phải "bài thở giảm lo âu". Hứa kết quả sức khoẻ là lời hứa y tế,
 * và app không có ai đứng sau lời hứa đó.
 *
 * ──────────────────────────────────────────────────────── PHẦN TÍNH Ở TỆP KHÁC
 *
 * Chuỗi ngày, gom theo tháng, tìm trong chữ nằm ở `lib/tinh-thuc-hanh.ts` — tệp
 * đó cố ý không import gì để chạy thử thẳng bằng Node, cùng khuôn với
 * `lib/gian-hang.ts`. Chỗ này chỉ lo ô nhớ.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { khiDoiTaiKhoan } from '@/lib/doi-tai-khoan';
import {
  MOT_LAN_TUOI,
  nangLuongConLai,
  ngayHomNay,
  type BuoiThucHanh,
  type LoaiThucHanh,
} from '@/lib/tinh-thuc-hanh';

export {
  bayNgayQua,
  CAC_GIAI_DOAN,
  giaiDoanCay,
  MOT_LAN_TUOI,
  nangLuongConLai,
  nangLuongDaKiem,
  nangLuongMotBuoi,
  nangLuongTrongNgay,
  TRAN_NGAY,
  giaiDoanSau,
  tienToiGiaiDoanSau,
  tongPhut,
  type GiaiDoanCay,
  boDau,
  buoiTrongNgay,
  CAC_MOC,
  cachMayNgay,
  cacTrang,
  docCachNgay,
  loiChaoTheoBuoi,
  mocVuaCham,
  tongKetTuan,
  chuoiNgay,
  daLamHomNay,
  luiNgay,
  ngayHomNay,
  nhomTheoThang,
  phutTrongTuan,
  TAM_TRANG,
  timTrang,
  type BuoiThucHanh,
  type LoaiThucHanh,
} from '@/lib/tinh-thuc-hanh';

const KHOA = 'omora-thuc-hanh';
/**
 * Số năng lượng đã tưới vào cây, cất riêng.
 *
 * Để riêng chứ không gộp vào danh sách buổi: nó là MỘT con số, mà danh sách
 * buổi thì có lúc bị lọc bỏ dòng méo lúc nạp lên — gộp vào thì một dòng hỏng
 * có thể kéo cả cây về không.
 */
const KHOA_TUOI = 'omora-da-tuoi';
/** Giữ lại chừng này buổi. Đủ cho một năm thực hành mỗi ngày vài lần. */
const TOI_DA = 2000;

let ds: BuoiThucHanh[] = [];
let daTuoi = 0;
let daNap = false;
const nghe = new Set<(d: BuoiThucHanh[]) => void>();
const ngheTuoi = new Set<(n: number) => void>();

function maMoi(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function bao() {
  const ban = [...ds];
  nghe.forEach((f) => f(ban));
}

function luu() {
  AsyncStorage.setItem(KHOA, JSON.stringify(ds)).catch(() => {
    // Không ghi được thì thôi, buổi này vẫn còn trong lần chạy.
  });
}

function baoTuoi() {
  ngheTuoi.forEach((f) => f(daTuoi));
}

function luuTuoi() {
  AsyncStorage.setItem(KHOA_TUOI, String(daTuoi)).catch(() => {});
}

function hopLe(x: unknown): x is Omit<BuoiThucHanh, 'ma'> & { ma?: string } {
  if (!x || typeof x !== 'object') return false;
  const b = x as Record<string, unknown>;
  return (
    typeof b.ngay === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(b.ngay) &&
    typeof b.loai === 'string' &&
    ['tho', 'ngoi-yen', 'viet', 've'].includes(b.loai) &&
    typeof b.phut === 'number' &&
    Number.isFinite(b.phut)
  );
}

async function nap() {
  if (daNap) return;
  daNap = true;
  try {
    const soTuoi = Number(await AsyncStorage.getItem(KHOA_TUOI));
    if (Number.isFinite(soTuoi) && soTuoi > 0) {
      daTuoi = soTuoi;
      baoTuoi();
    }
    const chu = await AsyncStorage.getItem(KHOA);
    if (!chu) return;
    const doc = JSON.parse(chu);
    if (Array.isArray(doc)) {
      // Cấp mã cho dòng cũ chưa có. Xem ghi chú ở trường `ma`.
      ds = doc.filter(hopLe).map((b) => ({ ...b, ma: b.ma ?? maMoi() }));
      luu();
      bao();
    }
  } catch {
    // Hỏng thì coi như chưa có buổi nào.
  }
}

export function ghiBuoi(
  loai: LoaiThucHanh,
  giay: number,
  noiDung?: string,
  them?: { tamTrang?: number; de?: string }
) {
  // Làm tròn LÊN: ngồi 40 giây vẫn là có ngồi, ghi 0 phút thì nhìn như chưa làm.
  const phut = Math.max(1, Math.round(giay / 60));
  ds = [
    ...ds,
    {
      ma: maMoi(),
      ngay: ngayHomNay(),
      loai,
      phut,
      ...(noiDung ? { noiDung } : {}),
      ...(them?.tamTrang ? { tamTrang: them.tamTrang } : {}),
      ...(them?.de ? { de: them.de } : {}),
    },
  ].slice(-TOI_DA);
  luu();
  bao();
}

export function suaBuoi(ma: string, phan: { noiDung?: string; tamTrang?: number | null }) {
  ds = ds.map((b) => {
    if (b.ma !== ma) return b;
    const sua = { ...b };
    if (phan.noiDung !== undefined) sua.noiDung = phan.noiDung;
    // `null` là bỏ chọn tâm trạng, khác hẳn `undefined` là không động tới.
    if (phan.tamTrang === null) delete sua.tamTrang;
    else if (phan.tamTrang !== undefined) sua.tamTrang = phan.tamTrang;
    return sua;
  });
  luu();
  bao();
}

export function xoaBuoi(ma: string) {
  ds = ds.filter((b) => b.ma !== ma);
  luu();
  bao();
}

/**
 * Tưới cây một lần.
 *
 * Trả về false khi không đủ năng lượng — màn hình dựa vào đó để tắt nút, chứ
 * không tự tính lại, tránh hai chỗ tính ra hai con số khác nhau.
 */
export function tuoiCay(): boolean {
  if (nangLuongConLai(ds, daTuoi) < MOT_LAN_TUOI) return false;
  daTuoi += MOT_LAN_TUOI;
  luuTuoi();
  baoTuoi();
  return true;
}

export function useDaTuoi() {
  const [n, datN] = useState(daTuoi);
  useEffect(() => {
    ngheTuoi.add(datN);
    void nap();
    return () => {
      ngheTuoi.delete(datN);
    };
  }, []);
  return n;
}

export function useThucHanh() {
  const [dong, datDong] = useState<BuoiThucHanh[]>(() => [...ds]);

  useEffect(() => {
    nghe.add(datDong);
    void nap();
    return () => {
      nghe.delete(datDong);
    };
  }, []);

  return dong;
}

// Máy đổi sang người khác thì nhật ký của người cũ không còn là của ai cả.
khiDoiTaiKhoan(() => {
  ds = [];
  daTuoi = 0;
  daNap = true;
  AsyncStorage.removeItem(KHOA).catch(() => {});
  AsyncStorage.removeItem(KHOA_TUOI).catch(() => {});
  bao();
  baoTuoi();
});
