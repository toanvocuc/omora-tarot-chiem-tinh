/**
 * Hồ sơ của BẢN XEM THỬ, cất ngay trên máy người xem.
 *
 * Trước đây chế độ xem thử trả về một hồ sơ mẫu đóng cứng, nên ai mở trang web
 * cũng thành "Nguyễn Thị Ánh Đào". Với một app bói toán thì đó là hỏng đúng
 * phần quan trọng nhất: lá số, cung hoàng đạo và thần số đều tính từ ngày sinh,
 * nên người xem chỉ thấy kết quả của một người lạ chứ không phải của mình.
 *
 * Giờ bản xem thử để người xem tự khai, rồi cất xuống máy họ. Vẫn KHÔNG gọi
 * máy chủ lần nào — hồ sơ nằm trong bộ nhớ trình duyệt của riêng họ, không ai
 * khác thấy, và xoá dữ liệu trang là mất.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HoSo } from '@/lib/ho-so';

const KHOA_HO_SO = 'omora-xem-thu-ho-so';
/**
 * Cờ "đã bấm vào app".
 *
 * Tách khỏi hồ sơ vì hai thứ khác nhau: bấm "Dùng ngay" là đã có phiên, còn
 * khai xong hồ sơ là chuyện sau đó. Gộp làm một thì người bấm Bỏ qua ở giữa
 * luồng khai sẽ bị ném ngược về màn đăng nhập.
 */
const KHOA_DA_VAO = 'omora-xem-thu-da-vao';

/** Khung hồ sơ rỗng, đủ mọi cột để chỗ gọi khỏi phải tự chắp. */
const RONG: HoSo = {
  nguoi_dung: 'xem-thu',
  ho_ten: '',
  ngay_sinh: null,
  gio_sinh: null,
  noi_sinh: null,
  gioi_tinh: null,
  lien_he: null,
  gio_nhac: '07:00',
  nhac_la_bai: false,
  nhac_tin_tuc: false,
};

export async function daVaoXemThu(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KHOA_DA_VAO)) === '1';
  } catch {
    return false;
  }
}

export async function danhDauDaVao() {
  try {
    await AsyncStorage.setItem(KHOA_DA_VAO, '1');
  } catch {
    // Trình duyệt chặn bộ nhớ thì thôi, lần sau hỏi lại. Không đáng để chết app.
  }
}

export async function docHoSoXemThu(): Promise<HoSo | null> {
  try {
    const s = await AsyncStorage.getItem(KHOA_HO_SO);
    if (!s) return null;
    return { ...RONG, ...(JSON.parse(s) as Partial<HoSo>) };
  } catch {
    // Dữ liệu méo thì coi như chưa có, đừng để một chuỗi hỏng chặn cả app.
    return null;
  }
}

export async function luuHoSoXemThu(phan: Partial<HoSo>): Promise<HoSo> {
  const cu = (await docHoSoXemThu()) ?? RONG;
  const moi: HoSo = { ...cu, ...phan };
  try {
    await AsyncStorage.setItem(KHOA_HO_SO, JSON.stringify(moi));
  } catch {
    // Lưu không được thì vẫn trả hồ sơ mới, để màn hoàn tất không báo lỗi oan.
  }
  return moi;
}

/** Xoá sạch, đưa bản xem thử về đúng trạng thái người lạ vừa mở lần đầu. */
export async function xoaHoSoXemThu() {
  try {
    await AsyncStorage.multiRemove([KHOA_HO_SO, KHOA_DA_VAO]);
  } catch {
    // Không xoá được cũng không sao: đây là bản xem thử, không có gì để mất.
  }
}
