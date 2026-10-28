/**
 * Gói tư vấn của một thầy.
 *
 * Trước đây ba mức giá của thầy nằm chung trong một đoạn văn ở ô `gom_gi`:
 * khách phải tự đọc, tự so, rồi tự nhắn hỏi lại mình muốn gói nào. Đơn gửi đi
 * không mang theo thông tin đó, nên thầy mở ra cũng phải hỏi lại bằng tay.
 *
 * Giờ mỗi gói là một thứ bấm được, và đơn chụp lại tên cùng giá lúc đặt.
 * Xem migration 0023.
 */

import { useCallback, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { XEM_THU } from '@/lib/xem-thu';

export type Goi = {
  ma: string;
  chuyen_gia: string;
  ten: string;
  mo_ta: string | null;
  gia: number;
  /** Null với gói không tính theo thời lượng, ví dụ 'một câu hỏi cụ thể'. */
  phut: number | null;
  dang_nhan: boolean;
  thu_tu: number;
};

/** Chín gói thật của ba chuyên gia, chép đúng dữ liệu trên máy chủ. Dùng cho chế độ xem thử. */
const MAU: Goi[] = [
  {
    "ma": "efd9a935-4356-4cb6-be09-c8cda718d672",
    "chuyen_gia": "luna-chiem-tinh",
    "ten": "Một câu hỏi cụ thể",
    "mo_ta": "Bạn có đúng một chuyện đang vướng và muốn một câu trả lời thẳng. Luna đọc hoàn cảnh bạn viết rồi trả lời riêng cho câu đó.",
    "gia": 150000,
    "phut": null,
    "dang_nhan": true,
    "thu_tu": 1
  },
  {
    "ma": "60f2dd68-a551-46b9-874f-cc44351596fb",
    "chuyen_gia": "luna-chiem-tinh",
    "ten": "Buổi 30 phút",
    "mo_ta": "Đủ thời gian để đi hết một chuyện và hỏi lại những chỗ còn lấn cấn, thay vì chỉ nhận một câu trả lời rồi thôi.",
    "gia": 300000,
    "phut": 30,
    "dang_nhan": true,
    "thu_tu": 2
  },
  {
    "ma": "8ab31cc6-8132-4198-838c-6b8edc3330dd",
    "chuyen_gia": "luna-chiem-tinh",
    "ten": "Buổi 60 phút",
    "mo_ta": "Buổi dài nhất, kết hợp chiêm tinh và hành trình linh hồn. Dành cho lúc bạn muốn nhìn cả giai đoạn chứ không chỉ một việc trước mắt.",
    "gia": 500000,
    "phut": 60,
    "dang_nhan": true,
    "thu_tu": 3
  },
  {
    "ma": "50c9e6fe-9c10-461c-9997-caa4d37cc937",
    "chuyen_gia": "minh-chau",
    "ten": "Một câu hỏi cụ thể",
    "mo_ta": "Bạn có đúng một chuyện đang vướng và muốn một câu trả lời thẳng. Thầy đọc hoàn cảnh bạn viết rồi trả lời riêng cho câu đó.",
    "gia": 150000,
    "phut": null,
    "dang_nhan": true,
    "thu_tu": 1
  },
  {
    "ma": "446420a2-4bbf-4686-90ee-eac0e4aea77c",
    "chuyen_gia": "minh-chau",
    "ten": "Buổi 30 phút",
    "mo_ta": "Đủ thời gian để đi hết một chuyện và hỏi lại những chỗ còn lấn cấn, thay vì chỉ nhận một câu trả lời rồi thôi.",
    "gia": 300000,
    "phut": 30,
    "dang_nhan": true,
    "thu_tu": 2
  },
  {
    "ma": "c78efeaa-8c64-4e9c-a4f0-40af6bd5ee38",
    "chuyen_gia": "minh-chau",
    "ten": "Buổi 60 phút",
    "mo_ta": "Buổi dài nhất, dành cho lúc bạn muốn nhìn cả một giai đoạn chứ không chỉ một việc trước mắt.",
    "gia": 500000,
    "phut": 60,
    "dang_nhan": true,
    "thu_tu": 3
  },
  {
    "ma": "cd67eab0-afdf-4fba-8904-f208fdca1ee7",
    "chuyen_gia": "tri-hue",
    "ten": "Một câu hỏi cụ thể",
    "mo_ta": "Bạn có đúng một chuyện đang vướng và muốn một câu trả lời thẳng. Thầy đọc hoàn cảnh bạn viết rồi trả lời riêng cho câu đó.",
    "gia": 150000,
    "phut": null,
    "dang_nhan": true,
    "thu_tu": 1
  },
  {
    "ma": "7aa2be91-fe7e-4dbd-ba9a-1f5068045fc8",
    "chuyen_gia": "tri-hue",
    "ten": "Buổi 30 phút",
    "mo_ta": "Đủ thời gian để đi hết một chuyện và hỏi lại những chỗ còn lấn cấn, thay vì chỉ nhận một câu trả lời rồi thôi.",
    "gia": 300000,
    "phut": 30,
    "dang_nhan": true,
    "thu_tu": 2
  },
  {
    "ma": "c0747809-a73f-4800-aa0e-5549137c227f",
    "chuyen_gia": "tri-hue",
    "ten": "Buổi 60 phút",
    "mo_ta": "Buổi dài nhất, dành cho lúc bạn muốn nhìn cả một giai đoạn chứ không chỉ một việc trước mắt.",
    "gia": 500000,
    "phut": 60,
    "dang_nhan": true,
    "thu_tu": 3
  }
];

/** '150.000đ' */
export function tienGoi(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

/** 'Buổi 30 phút · 300.000đ' — một dòng gọn để nhét vào thẻ đơn. */
export function dongGoi(ten: string | null, gia: number | null): string | null {
  if (!ten) return null;
  return gia ? `${ten} · ${tienGoi(gia)}` : ten;
}

/**
 * Các gói của một thầy, đã lọc gói đang ngưng nhận và xếp theo thứ tự thầy đặt.
 *
 * Trả mảng rỗng khi thầy chưa khai gói nào — màn hình phải chạy được trong
 * trường hợp đó, vì thầy mới thêm vào thì chưa có gói ngay.
 */
export function useGoiTuVan(maThay: string | null | undefined) {
  const [dong, datDong] = useState<Goi[] | null>(
    XEM_THU ? MAU.filter((g) => g.chuyen_gia === maThay) : null
  );

  const doc = useCallback(() => {
    if (XEM_THU || !maThay) return;
    let huy = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('goi_tu_van')
          .select('*')
          .eq('chuyen_gia', maThay)
          .eq('dang_nhan', true)
          .order('thu_tu', { ascending: true });
        // Xét `error` trước: postgrest không ném, nó trả { data: null, error }.
        // Không xét thì mạng chập thành "thầy này không có gói nào".
        if (huy || error) return;
        const goi = (data as Goi[]) ?? [];

        /**
         * Đè bản tâm linh lên mô tả gói — CHỈ nhánh Android/web này làm.
         *
         * `goi_tu_van.mo_ta` là cột bản iOS đọc, và cả 7 gói đều `cho_ios`
         * bật, nên chữ tarot không được phép nằm ở đó. Bản tâm linh cất riêng
         * ở `goi_tu_van_mo_rong`, bảng mà bên iOS không bao giờ hỏi tới.
         *
         * Bảng chưa dựng — migration 0034 chưa chạy — thì coi như không có và
         * dùng mô tả gốc. Nhờ vậy dựng lại web trước hay chạy lệnh trước đều
         * không gãy, khỏi phải nhớ thứ tự.
         */
        const { data: moRong } = await supabase
          .from('goi_tu_van_mo_rong')
          .select('ma, mo_ta')
          .in('ma', goi.map((g) => g.ma));
        if (huy) return;

        const theoMa = new Map(
          ((moRong as { ma: string; mo_ta: string | null }[]) ?? []).map((m) => [m.ma, m.mo_ta])
        );
        // `||` chứ không `??`: ô trống trong bảng quản trị lưu xuống thành ''.
        datDong(goi.map((g) => ({ ...g, mo_ta: theoMa.get(g.ma) || g.mo_ta })));
      } catch {
        // Giữ nguyên danh sách cũ.
      }
    })();
    return () => {
      huy = true;
    };
  }, [maThay]);

  useEffect(doc, [doc]);

  return { dong: dong ?? [], dangTai: dong === null && Boolean(maThay) };
}
