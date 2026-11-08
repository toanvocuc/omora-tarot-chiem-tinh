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
 * Đổi máy thì mấy trang đã viết mất. Đó là cái giá, và nó đáng.
 *
 * ────────────────────────────────────────── TRỪ ĐÚNG HAI CON SỐ CỦA CÂY
 *
 * Ngày 2026-11-08 user báo: cùng một tài khoản mà trên web cây đã là "Cây non",
 * mở app ra vẫn còn "Cây mầm". Đúng vậy, vì hồi đó cây cũng chỉ nằm dưới máy,
 * nên trình duyệt và app là hai kho tách biệt — và đổi điện thoại là cây về số
 * không, dù đăng nhập đúng tài khoản.
 *
 * Cây là thứ níu người ta quay lại mỗi ngày, nên từ nay HAI con số của nó —
 * tổng đã kiếm và tổng đã tưới — có đi lên máy chủ. Hai số đó không nói được
 * khách đã viết gì, cũng không nói được khách làm bài nào. Danh sách buổi và
 * chữ viết vẫn ở lại máy, y như trước.
 *
 * Phần đẩy đi nằm ở `lib/dong-bo-cay.ts`, bảng ở migration 0037.
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

import { congCayTrenMayChu, docCayTrenMayChu, type SoCay } from '@/lib/dong-bo-cay';
import { giuTheoNguoi } from '@/lib/kho-theo-nguoi';
import {
  MOT_LAN_TUOI,
  nangLuongConLaiCoMayChu,
  nangLuongDaKiem,
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
/** Mã người đang sở hữu nhật ký dưới máy này. */
const KHOA_CHU = 'omora-thuc-hanh-chu';
/**
 * Phần máy NÀY đã đẩy lên máy chủ rồi. Xem `dongBo`.
 *
 * Cất xuống đĩa chứ không giữ trong bộ nhớ: mở app lần sau mà quên mất đã đẩy
 * bao nhiêu thì lại đẩy trọn một lượt nữa, và cây lớn lên theo số lần mở app.
 */
const KHOA_KIEM_GUI = 'omora-kiem-da-gui';
const KHOA_TUOI_GUI = 'omora-tuoi-da-gui';
/** Giữ lại chừng này buổi. Đủ cho một năm thực hành mỗi ngày vài lần. */
const TOI_DA = 2000;

let ds: BuoiThucHanh[] = [];
let daTuoi = 0;
let daNap = false;
const nghe = new Set<(d: BuoiThucHanh[]) => void>();
/**
 * Bên nghe cây KHÔNG nhận tham số.
 *
 * Trước đây nó nhận thẳng `daTuoi`. Giờ cây có hai con số phải đọc cùng nhau —
 * đã tưới và còn lại — nên đẩy một số qua tham số là mời gọi chỗ gọi dùng số
 * cũ cho số kia. Bên nghe tự đọc lại cả hai qua `useCay`.
 */
const ngheTuoi = new Set<() => void>();

function maMoi(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function bao() {
  const ban = [...ds];
  nghe.forEach((f) => f(ban));
  // Danh sách buổi đổi là năng lượng đổi. Gộp vào đây để không phải nhớ gọi
  // thêm một lần ở mỗi chỗ sửa danh sách — quên một chỗ là số năng lượng đứng
  // yên trong khi buổi đã được ghi.
  baoTuoi();
}

function luu() {
  AsyncStorage.setItem(KHOA, JSON.stringify(ds)).catch(() => {
    // Không ghi được thì thôi, buổi này vẫn còn trong lần chạy.
  });
}

function baoTuoi() {
  ngheTuoi.forEach((f) => f());
}

function luuTuoi() {
  AsyncStorage.setItem(KHOA_TUOI, String(daTuoi)).catch(() => {});
}

// ══════════════════════════════════════════════════ đồng bộ cây với máy chủ

/** Tổng đã kiếm theo máy chủ, tính cả phần máy khác góp vào. */
let kiemMay = 0;
/** Phần đã đẩy lên, đọc từ `KHOA_KIEM_GUI` và `KHOA_TUOI_GUI`. */
let kiemDaGui = 0;
let tuoiDaGui = 0;
/**
 * Hai mốc trên đã đọc xong từ đĩa chưa.
 *
 * Phải tách khỏi `daNap`. `daNap` bật lên NGAY đầu `nap()` để chặn hai lượt
 * nạp cùng lúc, tức lúc nó bật thì hai mốc vẫn còn là 0 trong khi dưới đĩa đã
 * có số. Đồng bộ ngay lúc đó là đẩy lại trọn phần đã đẩy, và cây phình lên.
 */
let mocDaNap = false;

let dangDongBo = false;
let canDongBoLai = false;

function soKhongAm(x: string | null): number {
  const n = Number(x);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

async function napMoc() {
  try {
    const o = await AsyncStorage.multiGet([KHOA_KIEM_GUI, KHOA_TUOI_GUI]);
    kiemDaGui = soKhongAm(o[0]?.[1] ?? null);
    tuoiDaGui = soKhongAm(o[1]?.[1] ?? null);
  } catch {
    // Không đọc được thì coi như chưa đẩy gì: đẩy lại một lượt, cây nhảy lên.
    // Sai về phía có lợi cho khách, chấp nhận được.
  } finally {
    mocDaNap = true;
  }
}

function luuMoc() {
  AsyncStorage.multiSet([
    [KHOA_KIEM_GUI, String(kiemDaGui)],
    [KHOA_TUOI_GUI, String(tuoiDaGui)],
  ]).catch(() => {
    // Ghi mốc hỏng thì lần sau đẩy lại phần đã đẩy. Xem ghi chú thứ tự ở
    // `dongBo` để biết vì sao thà vậy.
  });
}

/** Năng lượng còn tiêu được: phần máy chủ đã biết, cộng phần chưa đẩy. */
function nangLuongDangCo(): number {
  return nangLuongConLaiCoMayChu(kiemMay, kiemDaGui, ds, daTuoi);
}

/**
 * Nhận số chốt của máy chủ.
 *
 * ──────────────────────────────── MỐC TƯỚI ĐẶT BẰNG, KHÔNG CỘNG THÊM
 *
 * `tuoiDaGui` phải đặt BẰNG tổng máy chủ vừa chốt, chứ không cộng thêm phần
 * máy này vừa đẩy. Khác với mốc kiếm: `daTuoi` bị THAY bằng tổng của máy chủ —
 * tổng đó gồm cả phần máy khác đã tưới — nên nếu chỉ cộng thêm thì khoảng
 * chênh giữa `daTuoi` và `tuoiDaGui` còn nguyên, và lượt đồng bộ sau đẩy lại
 * đúng khoảng đó một lần nữa. Cây phình lên theo số lần mở app.
 *
 * Mốc kiếm thì cộng thêm mới đúng, vì danh sách buổi KHÔNG đồng bộ nên tổng
 * kiếm dưới máy không bị thay bởi số của máy chủ.
 *
 * ──────────────────────────────── TƯỚI THÊM TRONG LÚC ĐANG ĐẨY
 *
 * Khách có thể bấm tưới đúng lúc lượt đẩy đang bay. Phần đó chưa nằm trong
 * `so`, nên phải cộng trở lại để lượt sau còn đẩy đi. Thiếu nó thì lượt tưới
 * ấy biến mất không dấu vết.
 *
 * ──────────────────────────────── VÀ KHÔNG BAO GIỜ HẠ XUỐNG
 *
 * `Math.max` là lớp chặn cuối: một con số nhỏ hơn số đang cầm chỉ có thể nghĩa
 * là máy chủ chưa nhận được lượt đẩy, hoặc dòng dưới đó vừa bị dọn. Hạ theo nó
 * là lấy mất của khách phần họ đã làm — đúng kiểu mất dữ liệu ngày 2026-11-01,
 * đọc đầu `lib/kho-theo-nguoi.ts`.
 */
function nhanSo(so: SoCay, tuoiThemTrongLuc: number) {
  kiemMay = Math.max(kiemMay, so.kiem);
  const tuoiMoi = Math.max(daTuoi, so.tuoi + Math.max(0, tuoiThemTrongLuc));
  tuoiDaGui = so.tuoi;
  if (tuoiMoi !== daTuoi) {
    daTuoi = tuoiMoi;
    luuTuoi();
  }
  baoTuoi();
}

/**
 * Đẩy phần chênh lên máy chủ rồi nhận số chốt về.
 *
 * ──────────────────────────────────── CHỈ ĐẨY PHẦN CHÊNH, KHÔNG ĐẨY TỔNG
 *
 * Hàm dưới máy chủ chỉ biết CỘNG THÊM, vì ghi đè là sai ngay từ gốc: hai máy
 * cùng thực hành thì máy nào ghi sau sẽ đè mất phần máy kia vừa thêm. Nên mỗi
 * máy tự nhớ đã đẩy bao nhiêu, lần sau chỉ đẩy phần chênh. Gửi tổng là cộng
 * dồn lại một lần nữa mỗi lượt đồng bộ.
 *
 * Lần đầu sau khi cập nhật, hai mốc còn là 0 nên máy đẩy trọn phần nó đã có từ
 * trước. Cây trên web và cây trong app vì vậy CỘNG lại thành một, và cây sẽ
 * nhảy lên một bậc hoặc hơn. Đó là đúng: công thực hành của cả hai bên đều thật.
 *
 * ────────────────────────────────────── THỨ TỰ: ĐẨY TRƯỚC, GHI MỐC SAU
 *
 * Ghi mốc trước mà lượt đẩy hỏng thì phần năng lượng đó mất hẳn, không đường
 * nào lấy lại. Đẩy trước rồi ghi mốc thì cái hỏng duy nhất là app tắt đúng
 * giữa hai bước, và lần sau đẩy lại một lượt — cây lớn hơn thực. Sai về phía
 * có lợi cho khách thì chấp nhận được; sai về phía lấy mất công của họ thì không.
 */
async function dongBo(): Promise<void> {
  if (!daNap || !mocDaNap) return;
  if (dangDongBo) {
    // Gộp thành một lượt chạy sau. Đẩy song song là hai lượt cùng đọc ra một
    // phần chênh rồi cùng gửi, tức cộng dồn hai lần.
    canDongBoLai = true;
    return;
  }
  dangDongBo = true;
  try {
    const dKiem = Math.max(0, nangLuongDaKiem(ds) - kiemDaGui);
    const dTuoi = Math.max(0, daTuoi - tuoiDaGui);
    const coGiDeDay = dKiem > 0 || dTuoi > 0;
    const so = coGiDeDay ? await congCayTrenMayChu(dKiem, dTuoi) : await docCayTrenMayChu();
    // `null` = chưa đăng nhập, mất mạng, hoặc chế độ xem thử. KHÔNG được coi
    // là "máy chủ bảo 0": giữ nguyên bản dưới máy và thử lại lần sau.
    if (!so) return;
    // Đọc TRƯỚC khi `nhanSo` ghi đè `tuoiDaGui`: đây là phần khách bấm tưới
    // trong lúc lượt đẩy đang bay, chưa có trong `so`.
    const tuoiThem = daTuoi - tuoiDaGui - dTuoi;
    if (coGiDeDay) kiemDaGui += dKiem;
    nhanSo(so, tuoiThem);
    // Ghi mốc cả khi chỉ đọc: lượt đọc cũng kéo `daTuoi` lên theo máy chủ, nên
    // mốc phải đi theo. Không thì máy vừa cài lại app sẽ đẩy lại trọn cái cây
    // nó vừa nhận về.
    luuMoc();
  } finally {
    dangDongBo = false;
    if (canDongBoLai) {
      canDongBoLai = false;
      void dongBo();
    }
  }
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
    await napMoc();
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
  } finally {
    // `finally` chứ không đặt ở cuối thân `try`: trên kia có hai đường về sớm
    // (chưa có buổi nào, và dữ liệu hỏng). Đặt ở cuối thân thì máy của người
    // chưa thực hành buổi nào sẽ không bao giờ kéo cây trên máy chủ về — mà
    // đó đúng là máy vừa cài lại app, tức ca cần kéo về nhất.
    void dongBo();
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
  // Đẩy ngay chứ không đợi lần mở app sau: thực hành trên máy này rồi mở web
  // ra thấy túi năng lượng chưa nhích là đúng cái lệch user báo 2026-11-08.
  void dongBo();
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
  if (nangLuongDangCo() < MOT_LAN_TUOI) return false;
  daTuoi += MOT_LAN_TUOI;
  luuTuoi();
  baoTuoi();
  // Cây lớn lên là thứ khách vừa nhìn thấy, nên đẩy ngay. Không đợi được: họ
  // có thể mở web ra ngay sau đó để xem lại.
  void dongBo();
  return true;
}

export type SoCuaCay = {
  /** Đã tưới bao nhiêu. Đây là thứ quyết định cây lớn tới đâu. */
  daTuoi: number;
  /** Năng lượng còn trong tay, chưa tưới. */
  conLai: number;
};

/**
 * Cây và năng lượng, đọc sống.
 *
 * Trả CẢ HAI trong một hook chứ không tách làm hai: `conLai` phụ thuộc vào con
 * số lấy từ máy chủ, mà số đó về muộn — xong một lượt đồng bộ mới có. Tách ra
 * hai hook thì chỗ gọi phải tự nhớ dựng lại cái nào khi nào, và lúc nó quên thì
 * cây đã lớn trong khi túi năng lượng còn hiện số cũ.
 */
export function useCay(): SoCuaCay {
  const [so, datSo] = useState<SoCuaCay>(() => ({ daTuoi, conLai: nangLuongDangCo() }));
  useEffect(() => {
    // Trả lại ĐÚNG đối tượng cũ khi hai số không đổi, để React bỏ qua lượt vẽ.
    // Cần vì `bao()` gọi kèm `baoTuoi()`, nên một lượt nạp danh sách buổi báo
    // tới đây nhiều lần liền trong khi cây chưa nhích.
    const doc = () =>
      datSo((cu) => {
        const moi = { daTuoi, conLai: nangLuongDangCo() };
        return cu.daTuoi === moi.daTuoi && cu.conLai === moi.conLai ? cu : moi;
      });
    ngheTuoi.add(doc);
    void nap();
    // Đọc lại một lượt ngay sau khi gắn. `nap()` có thể đã chạy xong từ trước
    // khi màn này dựng — lúc đó không còn ai báo cho hook này nữa, và nó đứng
    // mãi ở số của lần dựng đầu.
    doc();
    return () => {
      ngheTuoi.delete(doc);
    };
  }, []);
  return so;
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

/**
 * Nhật ký và cây buộc vào đúng một người.
 *
 * Trước đây chỗ này dùng `khiDoiTaiKhoan` và xoá hẳn hai ô nhớ. Hậu quả: thẻ
 * phiên hết hạn cũng bị hiểu là đổi người, và cả nhật ký lẫn cây bay sạch.
 * Đọc đầu `lib/kho-theo-nguoi.ts` để biết đầy đủ.
 */
giuTheoNguoi(KHOA_CHU, {
  quen: () => {
    // Không còn ai đăng nhập. Buông bản nhớ tạm để màn hình không còn bày đồ
    // của người cũ, nhưng để nguyên dưới máy. Đặt lại `daNap` và `mocDaNap` để
    // lần sau còn nạp lên được.
    ds = [];
    daTuoi = 0;
    kiemMay = 0;
    kiemDaGui = 0;
    tuoiDaGui = 0;
    daNap = false;
    mocDaNap = false;
    bao();
    baoTuoi();
  },
  nap: () => {
    void nap();
    // Gọi thêm một lượt đồng bộ cho ca `nap()` về sớm vì `daNap` đã bật từ
    // trước — ví dụ khách gắn tài khoản Google vào hồ sơ ẩn danh đang dùng.
    // Không có dòng này thì máy chỉ kéo cây về đúng một lần mỗi lượt mở app.
    void dongBo();
  },
  xoa: () => {
    ds = [];
    daTuoi = 0;
    kiemMay = 0;
    kiemDaGui = 0;
    tuoiDaGui = 0;
    daNap = true;
    mocDaNap = true;
    bao();
    baoTuoi();
    // Xoá sạch dưới đĩa TRƯỚC, rồi mới kéo cây của người mới về. Làm ngược thì
    // lượt ghi mốc của người mới có thể bị lượt xoá của người cũ đè mất, và
    // người mới đẩy lại trọn phần đã đẩy.
    //
    // Hai mốc BẮT BUỘC phải xoá cùng. Để lại là máy tưởng đã đẩy phần của người
    // cũ rồi, nên phần người mới thực hành được sẽ bị trừ đi đúng chừng đó.
    void (async () => {
      try {
        await AsyncStorage.multiRemove([KHOA, KHOA_TUOI, KHOA_KIEM_GUI, KHOA_TUOI_GUI]);
      } catch {
        // Xoá không xong thì vẫn đồng bộ: bản nhớ tạm đã rỗng nên không bày
        // nhầm đồ của người cũ ra màn hình.
      }
      await dongBo();
    })();
  },
});
