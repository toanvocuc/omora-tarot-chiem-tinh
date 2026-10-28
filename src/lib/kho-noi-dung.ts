/** Đọc nội dung từ cơ sở dữ liệu. Nội dung viết sẵn một lần rồi dùng mãi, không gọi AI. */

import { useEffect, useState } from 'react';

import {
  MAU_CON_SO_BIEU_DO,
  MAU_CUNG,
  MAU_DO_HOP,
  MAU_LA_BAI,
  MAU_MUI_TEN_BIEU_DO,
  MAU_SO_CHU_DAO,
  MAU_SO_VAN_MENH,
  MAU_CHUYEN_GIA,
  MAU_TU_VI,
} from '@/data/noi-dung-mau';
import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';
import type { LaBai } from '@/lib/tarot';

type DongLaBai = {
  ma: string;
  bo: LaBai['bo'];
  so: number;
  ten_vi: string;
  ten_en: string;
  tu_khoa: string;
  y_nghia_xuoi: string;
  y_nghia_nguoc: string;
  tinh_cam: string;
  cong_viec: string;
  loi_khuyen: string;
};

function doiTen(d: DongLaBai): LaBai {
  return {
    ma: d.ma,
    bo: d.bo,
    so: d.so,
    tenVi: d.ten_vi,
    tenEn: d.ten_en,
    tuKhoa: d.tu_khoa,
    yNghiaXuoi: d.y_nghia_xuoi,
    yNghiaNguoc: d.y_nghia_nguoc,
    tinhCam: d.tinh_cam,
    congViec: d.cong_viec,
    loiKhuyen: d.loi_khuyen,
  };
}

export function useBoBai() {
  const [boBai, setBoBai] = useState<LaBai[] | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    if (XEM_THU) {
      setBoBai(MAU_LA_BAI);
      return;
    }
    let huy = false;
    supabase
      .from('la_bai')
      .select('*')
      .then(({ data, error }) => {
        if (huy) return;
        if (error) {
          setLoi(error.message);
          return;
        }
        setBoBai((data as DongLaBai[]).map(doiTen));
      });
    return () => {
      huy = true;
    };
  }, []);

  return { boBai, loi, dangTai: boBai === null && loi === null };
}

// ---------------------------------------------------------------- chiêm tinh và thần số

export type NoiDungCung = {
  ma: string;
  ten: string;
  ten_en: string;
  tu_ngay: string;
  den_ngay: string;
  nguyen_to: string;
  tinh_chat: string;
  tinh_cach: string;
  diem_manh: string;
  diem_yeu: string;
};

export type DongHop = {
  cung_a: string;
  cung_b: string;
  diem: number;
  loi_binh: string;
  diem_manh: string | null;
  diem_yeu: string | null;
  loi_khuyen: string | null;
};
export type DongSoChuDao = {
  so: number;
  ten: string;
  tinh_cach: string;
  diem_manh: string;
  diem_yeu: string;
  loi_khuyen: string;
};
export type DongSoVanMenh = { so: number; ten: string; y_nghia: string; loi_khuyen: string };

export type DongMuiTen = {
  ma: string;
  cac_so: string;
  loai: 'day' | 'trong';
  ten: string;
  y_nghia: string;
  loi_khuyen: string;
};
export type DongTuVi = {
  ky: 'ngay' | 'tuan';
  muc: 'tong_quan' | 'tinh_cam' | 'cong_viec' | 'suc_khoe';
  cung: string;
  thu_tu: number;
  noi_dung: string;
};
export type DongConSo = {
  so: number;
  ten: string;
  khi_thieu: string;
  khi_co: string;
  khi_nhieu: string;
};

/**
 * Hồ sơ thầy tư vấn.
 *
 * Mọi ô ngoài mã, tên và lời giới thiệu đều có thể trống: lúc mới dựng thì chưa
 * hỏi được thầy giá bao nhiêu, chưa có ảnh. Màn hình phải vẽ được cả khi thiếu
 * gần hết, chứ không chờ đủ mới hiện.
 */
export type DongChuyenGia = {
  ma: string;
  ten: string;
  anh: string | null;
  nam_kinh_nghiem: number | null;
  chuyen_sau: string | null;
  hoc_tu: string | null;
  so_nguoi_da_xem: number | null;
  gioi_thieu: string;
  gia_tu: number | null;
  gom_gi: string | null;
  thoi_gian_tra_loi: string | null;
  gio_lam_viec: string | null;
  /** Số Zalo, chỉ số. Mấy cột dưới là đường dẫn đầy đủ. */
  zalo: string | null;
  /**
   * Mấy nơi công khai của thầy. Vừa để khách tự kiểm chứng người thật, vừa là
   * chỗ khách chọn cách liên hệ sau khi đặt lịch.
   */
  tiktok: string | null;
  facebook: string | null;
  dang_nhan: boolean;
  thu_tu: number;
  /** Máy chủ tự tính lại mỗi khi có đánh giá mới. Null khi chưa ai chấm. */
  diem_tb: number | null;
  so_danh_gia: number;
  // Bản tâm linh KHÔNG nằm trong bảng này. Nó ở `chuyen_gia_mo_rong` — xem
  // `DongMoRong`. Ba cột `_mo_rong` cũ đã bị migration 0033 xoá hẳn khỏi máy
  // chủ ngày 2026-10-28, nên bảng này giờ chỉ còn bản sạch.
  //
  // Đó là chủ ý, không phải dọn cho gọn: bản iOS hỏi bằng `select('*')`, nên
  // cái gì nằm trong bảng này là đi tới máy iOS. Không còn cột nào để đặt chữ
  // tâm linh thì không còn cách nào quên.
};

/**
 * Điểm sao cho chế độ xem thử.
 *
 * `diem_tb` và `so_danh_gia` là hai cột MÁY CHỦ TỰ TÍNH từ bảng `danh_gia`.
 *
 * Trước đây file mẫu không có hai cột đó nên chỗ này gán đại 4,5 sao cho MỌI
 * chuyên gia. Khi chỉ có một người thì không ai thấy, nhưng từ lúc thêm hai
 * chuyên gia mới thì ảnh chụp nộp chợ ghi cả ba đều "4,5 · 2 đánh giá" — hai
 * người chưa từng được ai chấm. Đó là lời khai sai với người xem.
 *
 * Giờ file mẫu được đồng bộ thẳng từ máy chủ và đã mang sẵn hai cột này, nên
 * dùng nguyên số thật: ai chưa có đánh giá thì màn hình ghi "Chưa có đánh giá".
 */
const MAU_CHUYEN_GIA_CO_SAO = MAU_CHUYEN_GIA;

const MAU_BANG: Record<string, unknown[]> = {
  cung_hoang_dao: MAU_CUNG,
  do_hop_cung: MAU_DO_HOP,
  so_chu_dao: MAU_SO_CHU_DAO,
  so_van_menh: MAU_SO_VAN_MENH,
  mui_ten_bieu_do: MAU_MUI_TEN_BIEU_DO,
  con_so_bieu_do: MAU_CON_SO_BIEU_DO,
  tu_vi_mau: MAU_TU_VI,
  chuyen_gia: MAU_CHUYEN_GIA_CO_SAO,
  // Dữ liệu mẫu đã mang sẵn chữ tâm linh trong chính cột gốc, nên bảng mở rộng
  // để rỗng: đè lên cũng ra đúng thứ đang có.
  chuyen_gia_mo_rong: [],
};

function useBang<T>(bang: string) {
  const [dong, setDong] = useState<T[] | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    if (XEM_THU) {
      setDong(MAU_BANG[bang] as T[]);
      return;
    }
    let huy = false;

    /**
     * Bọc try/catch chứ không nối `.catch`.
     *
     * Thứ `supabase.from().select()` trả về không phải một lời hứa thật, chỉ là
     * một vật có hàm `then`, nên nó KHÔNG có `.catch` để nối vào — trình biên
     * dịch báo thẳng ra điều đó. Và `dangTai` tính bằng "chưa có dòng nào VÀ
     * chưa có lỗi nào", nên vật đó mà vỡ thì cả hai ô cùng ở null và vòng xoay
     * quay mãi, đúng hình dạng con bug đã sửa ở màn thông báo.
     */
    (async () => {
      try {
        const { data, error } = await supabase.from(bang).select('*');
        if (huy) return;
        if (error) setLoi(error.message);
        else setDong(data as T[]);
      } catch (e) {
        if (huy) return;
        setLoi(e instanceof Error ? e.message : String(e));
      }
    })();

    return () => {
      huy = true;
    };
  }, [bang]);

  return { dong, loi, dangTai: dong === null && loi === null };
}

export const useCung = () => useBang<NoiDungCung>('cung_hoang_dao');
export const useDoHop = () => useBang<DongHop>('do_hop_cung');
export const useSoChuDao = () => useBang<DongSoChuDao>('so_chu_dao');
export const useSoVanMenh = () => useBang<DongSoVanMenh>('so_van_menh');
export const useMuiTen = () => useBang<DongMuiTen>('mui_ten_bieu_do');
export const useConSo = () => useBang<DongConSo>('con_so_bieu_do');
export const useTuVi = () => useBang<DongTuVi>('tu_vi_mau');

/**
 * Danh sách chuyên gia, ĐÃ đè bản tâm linh lên bản sạch.
 *
 * Bản tâm linh nằm ở BẢNG RIÊNG `chuyen_gia_mo_rong`, không phải mấy cột
 * `_mo_rong` cũ trong chính bảng `chuyen_gia`.
 *
 * ───────────────────────────────────────────── VÌ SAO PHẢI LÀ BẢNG RIÊNG
 *
 * Bản iOS hỏi máy chủ bằng `select('*')`. Để ba cột đó nằm trong `chuyen_gia`
 * thì chữ "Tarot, Chiêm tinh" ĐI TỚI máy iOS trong gói mạng — đo ngày
 * 2026-10-28 bằng chính khoá anon nằm trong bản đã phát hành: 22 cột trả về,
 * 6 ô mang chữ tâm linh. Màn hình iOS không vẽ chúng ra, nhưng ai mở trình bắt
 * gói ra cũng đọc được, và đó không phải thứ muốn đem ra cãi với người duyệt
 * app khi mức phạt của điều 2.5.19 là khoá tài khoản nhà phát triển.
 *
 * Bản iOS đã phát hành thì không sửa được nữa, nên cách sửa phải hợp với một
 * khách hàng đã đóng băng: dời cột sang bảng khác thì `select('*')` của nó tự
 * nhiên trả về ít đi. Bên đó không phải đổi một dòng mã nào.
 *
 * Và từ đó trong `chuyen_gia` KHÔNG CÒN CHỖ để đặt chữ tâm linh — luật đổi từ
 * "nhớ đừng gõ vào ô này" thành "không có ô đó".
 *
 * ──────────────────────────────────────────────────────────── CÁCH ĐÈ
 *
 * Đè ngay ở đây, một lần, thay vì bắt từng màn tự nhớ: `(tabs)/chuyen-gia.tsx`,
 * `thay.tsx`, `dat-lich.tsx` và `ho-so-thay.tsx` đều đọc `chuyen_sau`, sót một
 * chỗ là hồ sơ hiện nửa nạc nửa mỡ — tên "Luna" mà chuyên sâu lại là "Tarot,
 * Chiêm tinh".
 *
 * CÓ THÌ DÙNG, KHÔNG THÌ LẤY BẢNG GỐC. Quên điền bản mở rộng thì bên này hiện
 * bản sạch, nhạt đi một chút; làm ngược lại thì iOS hiện nội dung tâm linh.
 * Hỏng về phía nhạt sửa lúc nào cũng được, hỏng về phía kia thì không.
 *
 * Chuỗi rỗng cũng coi như chưa điền — `||` chứ không phải `??` — vì ô trống
 * trong bảng quản trị lưu xuống thành '' chứ không phải null.
 *
 * Bảng mở rộng chưa về thì CHỜ, đừng hiện bản sạch trước rồi nhấp một cái đổi
 * sang bản tâm linh: hai bảng về không cùng lúc, mà nhấp đổi tên chuyên gia
 * ngay trước mắt khách thì trông như app lỗi.
 *
 * Migration 0032 và 0033 đã chạy ngày 2026-10-28. Đo lại bằng chính khoá anon
 * trong bản đã phát hành: `chuyen_gia` trả về 19 cột, 0 ô mang chữ tâm linh —
 * trước đó là 22 cột, 6 ô.
 */
/**
 * Một dòng của `chuyen_gia_mo_rong` — bản tâm linh, CHỈ nhánh này đọc.
 *
 * Ô nào để trống thì lấy cột cùng tên bên `chuyen_gia`.
 */
export type DongMoRong = {
  ma: string;
  ten: string | null;
  chuyen_sau: string | null;
  gioi_thieu: string | null;
};

export function useChuyenGia() {
  const goc = useBang<DongChuyenGia>('chuyen_gia');
  const moRong = useBang<DongMoRong>('chuyen_gia_mo_rong');

  // Bảng mở rộng hỏng — hoặc chưa tồn tại, lúc 0032 chưa chạy — thì coi như
  // không có, KHÔNG phải hỏng cả màn: thà hiện hồ sơ bản sạch còn hơn hiện một
  // màn lỗi. Lỗi của bảng gốc mới là lỗi thật, vì thiếu nó thì chẳng có gì để
  // hiện.
  const theoMa = new Map((moRong.dong ?? []).map((m) => [m.ma, m]));
  const choMoRong = moRong.dong === null && moRong.loi === null;

  const ds =
    goc.dong && !choMoRong
      ? [...goc.dong]
          .filter((t) => t.dang_nhan)
          .sort((a, b) => a.thu_tu - b.thu_tu)
          .map((t) => {
            const m = theoMa.get(t.ma);
            return {
              ...t,
              ten: m?.ten || t.ten,
              chuyen_sau: m?.chuyen_sau || t.chuyen_sau,
              gioi_thieu: m?.gioi_thieu || t.gioi_thieu,
            };
          })
      : null;

  return { dong: ds, loi: goc.loi, dangTai: ds === null && goc.loi === null };
}
