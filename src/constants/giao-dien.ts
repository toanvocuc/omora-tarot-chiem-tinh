/** Bộ màu, phông chữ và khoảng cách dùng chung. Đổi ở đây là đổi cả app. */

export const MAU = {
  // Nền tím đêm, đi từ đậm dưới lên nhạt trên.
  //
  // Trước là xanh hải quân (#0B1220 … #1B2740). Đổi sang tím 2026-11-03 theo
  // ảnh mẫu user gửi. Giữ nguyên từng nấc độ sáng của bộ cũ, chỉ xoay sắc —
  // nên mọi chỗ đang dựa vào "nền này đậm hơn nền kia" vẫn đúng thứ tự.
  nen: '#120E1C',
  nenGiua: '#161120',
  nenTren: '#1C1729',
  nenNhat: '#1E162F',
  nenNhatHon: '#2A2140',

  /**
   * Nền đen cho mấy khung viền vàng.
   *
   * Không dùng đen tuyệt đối: trên nền trời sao, một mảng #000 trông như lỗ
   * thủng chứ không như một tấm thẻ. Lệch xanh một chút thì nó ăn vào nền.
   */
  nenDen: '#08060C',

  vang: '#D4A84B',
  vangSang: '#E8C673',
  vangMo: 'rgba(212,168,75,0.30)',
  /** Viền vàng thấy được ở cỡ điện thoại. 30% nhìn như không có viền. */
  vangVua: 'rgba(212,168,75,0.45)',
  vangRatMo: 'rgba(212,168,75,0.10)',

  chuChinh: '#EDF1F8',
  chuPhu: '#9AA8C0',
  chuMo: '#63708A',
  vien: '#322845',
  tot: '#4FBF95',
  canh: '#E08268',
  /** Đỏ cam cho nhãn giảm giá. Đủ nóng để bật khỏi nền xanh đêm mà không chói như đỏ thuần. */
  giam: '#E0533F',
} as const;

/** Nền chuyển sắc cho toàn màn hình. */
export const NEN_CHUYEN: readonly [string, string, string] = [MAU.nenTren, MAU.nenGiua, MAU.nen];

/** Nền chuyển sắc cho khối nội dung, nhạt hơn nền một chút. */
export const KHOI_CHUYEN: readonly [string, string] = ['#241B38', '#171127'];

export const CHU = {
  /** Phông có chân, dùng cho tiêu đề và tên lá bài. Chỉ dùng ở cỡ lớn. */
  hoa: 'CormorantGaramond_600SemiBold',
  hoaDam: 'CormorantGaramond_700Bold',
  /** Phông thân, vẽ riêng cho tiếng Việt nên dấu không bị bẹp. */
  than: 'BeVietnamPro_400Regular',
  thanVua: 'BeVietnamPro_500Medium',
  thanDam: 'BeVietnamPro_600SemiBold',
} as const;

/**
 * Bo góc của thẻ lớn, dùng cho mọi `rounded-2xl`.
 *
 * Số này KHÔNG đọc từ đây mà khai trong `tailwind.config.js`; để lại đây để ai
 * đọc bảng màu còn biết chỗ mà sửa. Hai nơi phải khớp nhau.
 */
export const BO_GOC_THE = 20;

/** Tỷ lệ lá bài Rider-Waite thật: 57mm x 100mm. */
export const TY_LE_LA_BAI = 57 / 100;

/**
 * Chiều cao thanh tab dưới, chưa kể lề của thanh điều hướng máy.
 * Màn hình nằm trong tab phải chừa đệm dưới ít nhất bằng số này cộng lề,
 * không thì nội dung cuối trang chui xuống dưới thanh tab.
 *
 * 70 chứ không phải 62. Cộng từng lớp một: đệm trên 6 + biểu tượng 24 + cách
 * chữ 2 + hộp dòng của nhãn + đệm dưới 10. Hộp dòng mới là chỗ tính hụt: phông
 * Be Vietnam Pro khai winAscent 1261 trên 1000 phần em, nên ở cỡ 11 nó chiếm
 * 16,8px chứ không phải 13,2px như nhân 11 với 1,2. Cộng đúng ra 59 trên 62 —
 * còn ba pixel, và dấu tiếng Việt đội lên là mất chân chữ.
 */
export const CAO_THANH_TAB = 70;

/**
 * Chiều cao thanh điều hướng trên cùng — CHỈ bản web trên máy tính.
 *
 * Để ở đây chứ không ở `components/thanh-tren` vì chuông cũng cần con số này
 * để thả hộp thông báo xuống ngay dưới thanh, mà thanh lại dựng chuông bên
 * trong nó — để bên kia là hai tệp nhập lẫn nhau thành vòng.
 */
export const CAO_THANH_TREN = 64;
