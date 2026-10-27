/**
 * Phần tính toán của mục Thực hành: chuỗi ngày, gom theo tháng, tìm trong chữ.
 *
 * ─────────────────────────────────────────── CỐ Ý KHÔNG IMPORT GÌ
 *
 * Tệp này không `import` một dòng nào, để chạy thử thẳng bằng Node mà không phải
 * dựng cả app. Cùng khuôn với `lib/gian-hang.ts`. Phần đụng tới ô nhớ nằm ở
 * `lib/thuc-hanh.ts`, chỗ này chỉ nhận mảng vào và trả kết quả ra.
 */

export type LoaiThucHanh = 'tho' | 'ngoi-yen' | 'viet' | 've';

/**
 * Tâm trạng tự chấm, từ 1 tới 5.
 *
 * App GHI LẠI và HIỆN RA, tuyệt đối không diễn giải. Không bao giờ có câu kiểu
 * "bạn đang trầm cảm" hay "tuần này bạn căng thẳng" — ghi lại là tự theo dõi,
 * diễn giải là chẩn đoán, mà không ai trong đội có chuyên môn để chẩn đoán.
 */
export const TAM_TRANG = ['Nặng nề', 'Mệt', 'Bình thường', 'Dễ chịu', 'Nhẹ nhõm'] as const;

export type BuoiThucHanh = {
  /**
   * Mã riêng của buổi, để sửa và xoá đúng dòng.
   *
   * Bản đầu không có mã, nên lúc nạp lên phải cấp mã cho dòng cũ — không thì
   * người đã viết bằng bản trước không sửa được trang nào của mình.
   */
  ma: string;
  /** Ngày địa phương dạng 'YYYY-MM-DD'. Một ngày có thể có nhiều buổi. */
  ngay: string;
  loai: LoaiThucHanh;
  /** Số phút đã làm, làm tròn lên 1 với buổi ngắn hơn một phút. */
  phut: number;
  /** Chữ khách viết, hoặc nét vẽ dạng JSON. Chỉ có ở 'viet' và 've'. */
  noiDung?: string;
  /** 1 tới 5 theo `TAM_TRANG`. Khách bỏ qua thì không có. */
  tamTrang?: number;
  /** Đề của ngày hôm đó, cất theo để đọc lại vẫn biết đang trả lời gì. */
  de?: string;
};

/**
 * Ngày địa phương, KHÔNG dùng toISOString.
 *
 * `toISOString()` trả giờ UTC, nên ở Việt Nam (UTC+7) mọi buổi trước 7 giờ sáng
 * bị tính sang ngày hôm trước — chuỗi ngày của người dậy sớm đứt oan.
 */
export function ngayHomNay(d = new Date()): string {
  const h = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${h(d.getMonth() + 1)}-${h(d.getDate())}`;
}

export function luiNgay(ngay: string, soNgay: number): string {
  const [n, t, g] = ngay.split('-').map(Number);
  // Tháng 0-based, và new Date(y, m, d) dùng giờ địa phương — khớp với ngayHomNay.
  return ngayHomNay(new Date(n, t - 1, g - soNgay));
}

/**
 * Chuỗi ngày liên tiếp tính tới hôm nay.
 *
 * Chưa làm gì HÔM NAY mà hôm qua có làm thì chuỗi vẫn còn — nó chỉ đứt khi lỡ
 * trọn một ngày. Tính khác đi là 7 giờ sáng mở app ra thấy chuỗi về 0 dù tối
 * qua vừa ngồi, và người ta bỏ app vì tưởng mình mất hết.
 */
export function chuoiNgay(buoi: BuoiThucHanh[], homNay = ngayHomNay()): number {
  const co = new Set(buoi.map((b) => b.ngay));
  if (co.size === 0) return 0;

  let moc = co.has(homNay) ? homNay : luiNgay(homNay, 1);
  if (!co.has(moc)) return 0;

  let dem = 0;
  while (co.has(moc)) {
    dem += 1;
    moc = luiNgay(moc, 1);
  }
  return dem;
}

/** Tổng số phút trong bảy ngày gần nhất, tính cả hôm nay. */
export function phutTrongTuan(buoi: BuoiThucHanh[], homNay = ngayHomNay()): number {
  const tu = luiNgay(homNay, 6);
  return buoi.filter((b) => b.ngay >= tu && b.ngay <= homNay).reduce((t, b) => t + b.phut, 0);
}

/** Đã làm gì hôm nay chưa — dùng để đổi lời chào trên đầu màn. */
export function daLamHomNay(buoi: BuoiThucHanh[], homNay = ngayHomNay()): boolean {
  return buoi.some((b) => b.ngay === homNay);
}

/** Mấy trang viết và vẽ gần nhất, mới nhất lên đầu. */
export function cacTrang(buoi: BuoiThucHanh[]): BuoiThucHanh[] {
  return buoi.filter((b) => b.noiDung && (b.loai === 'viet' || b.loai === 've')).reverse();
}

/** Gom trang theo tháng, mới nhất lên đầu. */
export function nhomTheoThang(trang: BuoiThucHanh[]): { thang: string; dong: BuoiThucHanh[] }[] {
  const gom = new Map<string, BuoiThucHanh[]>();
  for (const t of trang) {
    const k = t.ngay.slice(0, 7);
    gom.set(k, [...(gom.get(k) ?? []), t]);
  }
  return [...gom.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([thang, dong]) => ({ thang, dong }));
}

/**
 * Bỏ dấu tiếng Việt để so sánh.
 *
 * Người ta gõ "met" mà chữ trong nhật ký là "mệt" thì vẫn phải ra. Đây là tìm
 * trong nhật ký của chính mình — tìm hụt khó chịu hơn tìm thừa.
 */
export function boDau(c: string): string {
  return c
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function timTrang(trang: BuoiThucHanh[], tu: string): BuoiThucHanh[] {
  const k = boDau(tu.trim());
  if (!k) return trang;
  return trang.filter((t) => boDau(`${t.noiDung ?? ''} ${t.de ?? ''}`).includes(k));
}

/** Bảy ngày gần nhất, cũ trước mới sau, kèm tổng phút từng ngày. */
export function bayNgayQua(
  buoi: BuoiThucHanh[],
  homNay = ngayHomNay()
): { ngay: string; phut: number }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const ngay = luiNgay(homNay, 6 - i);
    return { ngay, phut: buoi.filter((b) => b.ngay === ngay).reduce((t, b) => t + b.phut, 0) };
  });
}

/** Lần gần nhất làm một loại, trả về số ngày trước. Null là chưa làm bao giờ. */
export function cachMayNgay(
  buoi: BuoiThucHanh[],
  loai: LoaiThucHanh,
  homNay = ngayHomNay()
): number | null {
  const ngay = buoi.filter((b) => b.loai === loai).map((b) => b.ngay).sort().at(-1);
  if (!ngay) return null;
  // Đếm lùi thay vì trừ mốc thời gian: tránh hẳn chuyện lệch múi giờ và giờ
  // mùa hè, mà khoảng cần đọc cũng chỉ vài chục ngày.
  for (let i = 0; i <= 400; i += 1) if (luiNgay(homNay, i) === ngay) return i;
  return null;
}

/** 'hôm nay' · 'hôm qua' · 'ba ngày trước'. */
export function docCachNgay(so: number | null): string | null {
  if (so === null) return null;
  if (so === 0) return 'hôm nay';
  if (so === 1) return 'hôm qua';
  if (so < 7) return `${so} ngày trước`;
  if (so < 30) return `${Math.floor(so / 7)} tuần trước`;
  return 'đã lâu';
}

/**
 * Mốc chuỗi ngày vừa chạm tới, hoặc null.
 *
 * Chỉ báo ĐÚNG ngày chạm mốc. Báo cả mấy ngày sau thì mốc mất thiêng, mà người
 * ta cũng chóng chán.
 */
export const CAC_MOC = [3, 7, 14, 30, 60, 100, 365];

export function mocVuaCham(chuoi: number): number | null {
  return CAC_MOC.includes(chuoi) ? chuoi : null;
}

/**
 * Buổi nào trong ngày, dùng để đổi sắc nền.
 *
 * Mốc giờ chọn theo nhịp sống chứ không chia đều: sáng tới 11h, trưa tới 14h,
 * chiều tới 18h, còn lại là tối.
 */
export type BuoiTrongNgay = 'sang' | 'trua' | 'chieu' | 'toi';

export function buoiTrongNgay(gio = new Date().getHours()): BuoiTrongNgay {
  if (gio < 11) return 'sang';
  if (gio < 14) return 'trua';
  if (gio < 18) return 'chieu';
  return 'toi';
}

export function loiChaoTheoBuoi(b: BuoiTrongNgay): string {
  if (b === 'sang') return 'Chào buổi sáng.';
  if (b === 'trua') return 'Giữa trưa rồi.';
  if (b === 'chieu') return 'Chiều xuống rồi.';
  return 'Tối rồi.';
}

/** Tổng kết một tuần, dùng cho thẻ nhìn lại vào chủ nhật. */
export function tongKetTuan(
  buoi: BuoiThucHanh[],
  homNay = ngayHomNay()
): { phut: number; soBuoi: number; soTrangViet: number; soBucVe: number; soNgay: number } {
  const tu = luiNgay(homNay, 6);
  const trong = buoi.filter((b) => b.ngay >= tu && b.ngay <= homNay);
  return {
    phut: trong.reduce((t, b) => t + b.phut, 0),
    soBuoi: trong.length,
    soTrangViet: trong.filter((b) => b.loai === 'viet').length,
    soBucVe: trong.filter((b) => b.loai === 've').length,
    soNgay: new Set(trong.map((b) => b.ngay)).size,
  };
}


/**
 * Cây của bạn — lớn lên theo số năng lượng đã tưới vào nó.
 *
 * ──────────────────────────────────────────────── CÂY KHÔNG BAO GIỜ HÉO
 *
 * Nghỉ mấy ngày thì cây đứng yên, KHÔNG tụt lại và không chết. Đây là lựa chọn
 * có chủ ý, không phải quên làm: mấy app chăm sóc bản thân sống lâu nhất đều bỏ
 * hẳn hình phạt, vì phạt thì đẩy người ta làm được vài hôm rồi bỏ app luôn —
 * còn tha thứ thì giữ được người.
 *
 * Nên số đã tưới chỉ có tăng. Bỏ một tháng rồi quay lại, cây vẫn y nguyên chỗ cũ.
 */
export type GiaiDoanCay = {
  muc: number;
  ten: string;
  /** Số năng lượng tối thiểu đã tưới để tới giai đoạn này. */
  tu: number;
  /** Lời một câu, tả cây chứ không khen người. */
  loi: string;
};

/**
 * Bảy giai đoạn, mỗi giai đoạn khớp ĐÚNG một bức trong bộ tranh ở
 * `assets/cay/`. Sửa chữ ở đây thì phải nhìn lại tranh, kẻo lời tả một đằng
 * hình một nẻo — đã từng sai như vậy: mức 1 ghi "hai lá đầu tiên mở ra" trong
 * khi tranh mới chỉ là hạt nứt vỏ, lá phải tới mức 2 mới có.
 */
export const CAC_GIAI_DOAN: GiaiDoanCay[] = [
  { muc: 0, ten: 'Hạt', tu: 0, loi: 'Hạt chưa nảy, chờ lần tưới đầu tiên.' },
  { muc: 1, ten: 'Mầm', tu: 5, loi: 'Vỏ hạt nứt ra, rễ đầu tiên tìm xuống đất.' },
  { muc: 2, ten: 'Cây mầm', tu: 30, loi: 'Hai lá đầu tiên mở ra, thân còn mềm.' },
  { muc: 3, ten: 'Cây non', tu: 90, loi: 'Thân đã cứng lại, cành vươn ra hai bên.' },
  { muc: 4, ten: 'Đã có tán', tu: 200, loi: 'Tán lá khép lại, hoa đầu tiên chớm nở.' },
  { muc: 5, ten: 'Ra hoa', tu: 400, loi: 'Hoa trắng nở khắp tán, cây đã đứng vững.' },
  { muc: 6, ten: 'Cổ thụ', tu: 800, loi: 'Gốc xoắn lại, rễ bám rộng, bóng phủ kín chỗ ngồi.' },
];

export function tongPhut(buoi: BuoiThucHanh[]): number {
  return buoi.reduce((t, b) => t + b.phut, 0);
}

/**
 * Năng lượng — kiếm bằng việc thực hành, tiêu vào việc tưới cây.
 *
 * ────────────────────────────────────── KHÔNG BÁN, KHÔNG ĐỔI RA TIỀN
 *
 * Năng lượng CHỈ kiếm được bằng cách ngồi xuống làm một việc. Không mua được
 * bằng tiền thật, không quy ra giảm giá trong gian hàng.
 *
 * Đây là ranh giới cố ý. Bán tiền ảo thì điều khoản 3.1.1 bắt phải qua thanh
 * toán của Apple và họ lấy 30%. Cho nó đổi ra hàng thật thì nó thành một thứ
 * giống công cụ thanh toán — kéo theo chuyện thuế và luật khuyến mại. Giữ nó
 * nằm trong app là giữ cho mọi thứ đơn giản.
 *
 * ──────────────────────────────────────────────── CÓ TRẦN MỖI NGÀY
 *
 * Trần ngày chặn chuyện cày: không ai bật đồng hồ rồi bỏ đó cả buổi chiều để
 * gom năng lượng. Mục này vốn để người ta ngồi xuống, không phải để kiếm điểm.
 */
export const TRAN_NGAY = 25;

/** Một buổi cho bao nhiêu năng lượng. */
export function nangLuongMotBuoi(b: BuoiThucHanh): number {
  if (b.loai === 'viet' || b.loai === 've') return 5;
  // Thở và ngồi thiền tính theo thời lượng, nhưng chặn hai đầu: ngồi 1 phút
  // vẫn được 2, ngồi 2 tiếng cũng chỉ tới 10.
  return Math.min(10, Math.max(2, Math.round(b.phut / 2)));
}

/** Năng lượng kiếm được trong một ngày, đã chặn trần. */
export function nangLuongTrongNgay(buoi: BuoiThucHanh[], ngay: string): number {
  const tong = buoi.filter((b) => b.ngay === ngay).reduce((t, b) => t + nangLuongMotBuoi(b), 0);
  return Math.min(TRAN_NGAY, tong);
}

/** Tổng năng lượng đã kiếm từ trước tới giờ, cộng theo từng ngày để trần có tác dụng. */
export function nangLuongDaKiem(buoi: BuoiThucHanh[]): number {
  const cacNgay = [...new Set(buoi.map((b) => b.ngay))];
  return cacNgay.reduce((t, n) => t + nangLuongTrongNgay(buoi, n), 0);
}

/** Năng lượng còn lại để tiêu. */
export function nangLuongConLai(buoi: BuoiThucHanh[], daTuoi: number): number {
  return Math.max(0, nangLuongDaKiem(buoi) - daTuoi);
}

/** Mỗi lần tưới tốn chừng này, và cho cây đúng chừng đó điểm lớn. */
export const MOT_LAN_TUOI = 10;

export function giaiDoanCay(phut: number): GiaiDoanCay {
  // Duyệt ngược: lấy giai đoạn CAO NHẤT mà số phút đã vượt qua.
  for (let i = CAC_GIAI_DOAN.length - 1; i >= 0; i -= 1) {
    if (phut >= CAC_GIAI_DOAN[i].tu) return CAC_GIAI_DOAN[i];
  }
  return CAC_GIAI_DOAN[0];
}

/** Giai đoạn kế tiếp, hoặc null khi đã tới cổ thụ. */
export function giaiDoanSau(phut: number): GiaiDoanCay | null {
  return CAC_GIAI_DOAN.find((g) => g.tu > phut) ?? null;
}

/** Phần đã đi được tới giai đoạn sau, từ 0 tới 1. Tới cổ thụ thì luôn là 1. */
export function tienToiGiaiDoanSau(phut: number): number {
  const nay = giaiDoanCay(phut);
  const sau = giaiDoanSau(phut);
  if (!sau) return 1;
  return Math.min(1, Math.max(0, (phut - nay.tu) / (sau.tu - nay.tu)));
}
