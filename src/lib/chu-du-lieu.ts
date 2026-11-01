/**
 * Ai là chủ của đống dữ liệu đang nằm dưới máy.
 *
 * Tệp này CỐ Ý không import gì, để chạy thử thẳng bằng Node — cùng khuôn với
 * `lib/tinh-thuc-hanh.ts` và `lib/gian-hang.ts`. Phần đụng ổ đĩa nằm ở
 * `lib/kho-theo-nguoi.ts`, và đầu tệp đó kể vì sao phải có cái này.
 */

/** Ba lối đi khi nghe báo mã người dùng. */
export type QuyetDinh =
  /** Buông bản nhớ tạm, GIỮ NGUYÊN dưới máy. */
  | 'quen'
  /** Người khác thật sự: xoá hẳn. */
  | 'xoa'
  /** Không làm gì. */
  | 'giu';

/**
 * @param chu mã người đang sở hữu dữ liệu dưới máy, null khi chưa đóng dấu
 * @param ma  mã người vừa được báo, null khi không còn ai đăng nhập
 */
export function quyetDinh(chu: string | null, ma: string | null): QuyetDinh {
  // Không còn ai đăng nhập. Rất có thể chỉ là thẻ hết hạn chứ không phải máy
  // sang tay — Supabase phát SIGNED_OUT ở năm tình huống, chỉ một là khách
  // thật sự bấm đăng xuất. Không đụng tới ổ đĩa.
  if (!ma) return 'quen';

  // Chưa đóng dấu chủ. Xảy ra ở máy đã dùng từ trước bản vá này; xoá đi là lấy
  // mất nhật ký của chính chủ. Nhận người đang đăng nhập làm chủ.
  if (!chu) return 'giu';

  return chu === ma ? 'giu' : 'xoa';
}
