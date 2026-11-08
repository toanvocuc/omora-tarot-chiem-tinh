/**
 * Đẩy cây lên máy chủ và nhận lại số chốt.
 *
 * ─────────────────────────────────────────────────────────── CHỈ HAI CON SỐ
 *
 * Tệp này gửi đúng hai số: tổng năng lượng đã kiếm và tổng đã tưới. Nhật ký
 * viết và nét vẽ KHÔNG đi qua đây và không đi qua đâu cả — chúng ở lại dưới
 * máy, xem đầu `lib/thuc-hanh.ts` và đầu migration 0037.
 *
 * ──────────────────────────────────────────── NỐI KHÔNG ĐƯỢC THÌ TRẢ NULL
 *
 * Mọi hàm ở đây trả `null` khi không nối được máy chủ, chưa đăng nhập, hoặc
 * đang ở chế độ xem thử — và KHÔNG ném lỗi ra. Bên gọi dựa vào đó để giữ
 * nguyên bản dưới máy rồi thử lại lần sau.
 *
 * Quan trọng: `null` phải khác hẳn "máy chủ trả về 0". Nhận nhầm sẽ kéo cây
 * của khách về hạt mỗi lần mất mạng. Nên chỗ nào trả 0 thật thì trả
 * `{ kiem: 0, tuoi: 0 }`, không bao giờ trả null.
 */

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

export type SoCay = {
  /** Tổng năng lượng đã kiếm, cộng dồn qua mọi máy. */
  kiem: number;
  /** Tổng đã tưới. Đây là thứ quyết định cây lớn tới đâu. */
  tuoi: number;
};

const BANG = 'cay_thuc_hanh';
const COT = 'nang_luong_kiem, da_tuoi';

/**
 * Có ai đang đăng nhập không. Đọc phiên trong máy, KHÔNG gọi mạng.
 *
 * ──────────────────────────────────────────────── VÌ SAO BẮT BUỘC PHẢI HỎI
 *
 * Luật khoá dòng lọc theo `auth.uid()`, nên câu đọc của một máy chưa đăng nhập
 * không báo lỗi — nó trả về MẢNG RỖNG, y như một người mới chưa có cây. Hai
 * chuyện đó nhìn giống hệt nhau mà hậu quả thì trái ngược: người mới thì ghi 0
 * là đúng, còn máy mất phiên mà ghi 0 là XOÁ CÂY của khách rồi cất số 0 xuống
 * đĩa — hỏng hẳn, không lấy lại được.
 *
 * Đúng kiểu lỗi đã làm mất dữ liệu thật ngày 2026-11-01, đọc đầu
 * `lib/kho-theo-nguoi.ts`. Nên chưa đăng nhập là trả `null` và không đụng gì.
 */
async function coPhien(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

type DongCay = { nang_luong_kiem: number | null; da_tuoi: number | null };

/**
 * Đọc một dòng ra số, chặn mọi thứ không phải số hữu hạn không âm.
 *
 * Postgres trả integer nên lẽ ra luôn đúng, nhưng nếu một ngày nào đó cột đổi
 * sang `bigint` thì thư viện trả về chuỗi, và `daTuoi` thành chuỗi là cây tính
 * sai im lặng.
 */
function so(x: unknown): number {
  const n = Number(x);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/**
 * Nhận cả hai hình dạng: một đối tượng, hoặc một mảng một phần tử.
 *
 * Hàm dưới máy chủ khai `returns public.cay_thuc_hanh` — một dòng, nên
 * PostgREST trả về đối tượng. Nhưng ngày nào đó đổi sang `returns setof` thì
 * nó trả mảng, và đọc `.da_tuoi` của một mảng ra `undefined` rồi hoá 0 — tức
 * cây của khách về hạt mà không một dòng báo lỗi nào. Nhận cả hai cho chắc.
 */
function doc(x: unknown): SoCay {
  const d = (Array.isArray(x) ? x[0] : x) as DongCay | null | undefined;
  return { kiem: so(d?.nang_luong_kiem), tuoi: so(d?.da_tuoi) };
}

/**
 * Cây của mình trên máy chủ.
 *
 * Trả `{ kiem: 0, tuoi: 0 }` khi đã đăng nhập mà chưa có dòng nào — người mới,
 * hoặc người chưa từng đồng bộ. Trả `null` khi không nối được.
 *
 * Không cần lọc theo mã người dùng: luật khoá dòng ở migration 0037 chỉ cho
 * đọc dòng của chính mình, nên câu lệnh này không thể trả về cây của ai khác.
 * Lọc thêm ở máy khách chỉ là một lượt gọi `getUser()` nữa cho cùng một kết quả.
 */
export async function docCayTrenMayChu(): Promise<SoCay | null> {
  if (XEM_THU) return null;
  if (!(await coPhien())) return null;
  try {
    const { data, error } = await supabase.from(BANG).select(COT).limit(1);
    if (error) return null;
    return doc(data);
  } catch {
    return null;
  }
}

/**
 * Cộng thêm vào cây của mình, rồi nhận lại số chốt sau khi cộng.
 *
 * `dKiem` và `dTuoi` là phần CHÊNH chưa đẩy lên, không phải tổng. Gửi tổng là
 * cộng dồn hai lần mỗi lần đồng bộ, và cây phình lên theo số lần mở app.
 *
 * Số chốt trả về là của máy chủ sau khi đã cộng cả phần máy khác vừa thêm, nên
 * bên gọi phải lấy nó làm chuẩn chứ không tự cộng ở máy mình.
 */
export async function congCayTrenMayChu(dKiem: number, dTuoi: number): Promise<SoCay | null> {
  if (XEM_THU) return null;
  // Không gửi số âm hay số lẻ lên. Hàm dưới máy chủ cũng chặn, nhưng chặn ở
  // đây thì khỏi tốn một lượt gọi để nhận về lỗi.
  const k = Math.max(0, Math.floor(dKiem));
  const t = Math.max(0, Math.floor(dTuoi));
  if (k === 0 && t === 0) return docCayTrenMayChu();
  if (!(await coPhien())) return null;

  try {
    const { data, error } = await supabase.rpc('cong_cay_thuc_hanh', { d_kiem: k, d_tuoi: t });
    if (error) return null;
    return doc(data);
  } catch {
    return null;
  }
}
