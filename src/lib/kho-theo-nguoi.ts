/**
 * Dữ liệu cất xuống máy, buộc vào đúng một người dùng.
 *
 * ────────────────────────────────────────────────────── CHUYỆN ĐÃ HỎNG THẬT
 *
 * Ngày 2026-11-01 user báo: tưới cây xong, còn năng lượng thừa, vào lại thì
 * cây và năng lượng về không. Nhật ký thực hành và danh sách Quan tâm cũng
 * sạch trơn.
 *
 * Gốc rễ: `thuc-hanh.ts` và `quan-tam.ts` ghi danh với `khiDoiTaiKhoan`, và
 * trong việc dọn thì gọi thẳng `AsyncStorage.removeItem` — XOÁ HẲN, không lấy
 * lại được. Cách đó chỉ đúng nếu `khiDoiTaiKhoan` thật sự có nghĩa "máy đã
 * sang tay người khác". Nó không có nghĩa đó.
 *
 * `khiDoiTaiKhoan` nổ mỗi khi mã người dùng đổi, kể cả đổi thành `null`. Mà
 * Supabase phát `SIGNED_OUT` (phiên = null) ở NĂM chỗ, chỉ một chỗ là khách
 * thật sự bấm đăng xuất — đọc `_removeSession()` trong GoTrueClient:
 *
 *   • khách bấm đăng xuất
 *   • thẻ phiên trong máy không còn hợp lệ
 *   • phiên bị thu hồi phía máy chủ
 *   • khôi phục phiên ra thứ không hợp lệ
 *   • LÀM MỚI THẺ HỎNG mà thẻ cũ cũng đã hết hạn  ← đúng ca của user
 *
 * Nên chỉ cần để app lâu không mở, hoặc mở trúng lúc mạng chập chờn, là nhật
 * ký bị xoá vĩnh viễn. Đăng nhập lại cũng không cứu được vì dữ liệu đã mất
 * khỏi máy.
 *
 * ───────────────────────────────────────────────────────────────── CÁCH CHỮA
 *
 * Phân biệt hai chuyện vốn khác hẳn nhau:
 *
 *   KHÔNG CÒN AI ĐĂNG NHẬP  → chỉ buông bản nhớ tạm, GIỮ NGUYÊN dưới máy.
 *                             Người cũ đăng nhập lại là thấy đủ như trước.
 *   NGƯỜI KHÁC ĐĂNG NHẬP    → bây giờ mới xoá. Đây mới là "máy sang tay".
 *
 * Muốn phân biệt được thì phải biết đống dữ liệu đang là của ai, nên cất thêm
 * một ô ghi mã chủ. Ô đó đóng dấu ngay từ lần mở app đầu tiên (xem
 * `khiBietNguoi`), không đợi tới lúc đổi người — nếu đợi thì máy nào đã có sẵn
 * dữ liệu mà chưa từng đổi tài khoản sẽ không mang dấu nào, và người kế tiếp
 * đăng nhập vào sẽ được nhận luôn nhật ký của người trước.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { quyetDinh } from '@/lib/chu-du-lieu';
import { khiBietNguoi } from '@/lib/doi-tai-khoan';

export function giuTheoNguoi(
  khoaChu: string,
  viec: {
    /** Buông bản nhớ tạm. KHÔNG được xoá gì dưới máy. */
    quen: () => void;
    /** Người khác thật sự. Xoá hẳn. */
    xoa: () => void;
    /**
     * Nạp lại từ ổ đĩa.
     *
     * Cần vì `quen` chỉ buông bản nhớ tạm chứ không xoá gì. Người cũ đăng nhập
     * lại thì quyết định là "giữ", mà không ai gọi nạp thì màn hình đứng trống
     * cho tới khi rời đi rồi quay lại — nhìn y như vẫn mất dữ liệu.
     */
    nap: () => void;
  }
): () => void {
  return khiBietNguoi((ma) => {
    if (!ma) {
      // Không còn ai đăng nhập. Có thể là đăng xuất, mà cũng rất có thể chỉ là
      // thẻ hết hạn. Không đụng tới ổ đĩa.
      viec.quen();
      return;
    }
    void (async () => {
      try {
        const chu = await AsyncStorage.getItem(khoaChu);
        if (quyetDinh(chu, ma) === 'xoa') viec.xoa();
        else viec.nap();
        if (chu !== ma) await AsyncStorage.setItem(khoaChu, ma);
      } catch {
        // Đọc ô chủ không xong thì KHÔNG xoá gì. Thà giữ lại nhầm còn hơn xoá
        // nhầm: giữ nhầm thì người dùng thấy thừa, xoá nhầm là mất hẳn.
      }
    })();
  });
}
