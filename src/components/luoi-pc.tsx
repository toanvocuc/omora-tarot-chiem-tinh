/**
 * Lưới nhiều cột cho bản web trên máy tính, và cột dọc hẹp cho nội dung để đọc.
 *
 * Gom vào một chỗ vì năm màn tab đều cần đúng hai kiểu xếp này, và mỗi màn tự
 * chế một kiểu thì chúng lệch nhau vài pixel — thứ không ai nhìn ra khi sửa
 * từng màn, nhưng bấm qua lại giữa các tab là thấy ngay.
 *
 * Số cột đo từ bản mẫu: thẻ Khám phá và Thực hành 2 cột, chuyên gia 3 cột,
 * hàng trong Shop 4 cột.
 *
 * Dưới ngưỡng máy tính, cả hai thứ ở đây đều trả về đúng bố cục cũ: `LuoiPC`
 * thành một cột có khoảng cách 16, `CotDoc` thành một `View` trơn. Web trên
 * điện thoại và hai bản app KHÔNG đổi gì.
 */

import { createContext, useContext } from 'react';
import { type ViewStyle, View } from 'react-native';

import { useManPC } from '@/constants/khung-web';

/**
 * Bề rộng một cột chữ để đọc.
 *
 * Mấy màn chỉ có một dòng chữ nối tiếp một dòng chữ — danh sách cài đặt, hồ sơ
 * một người — kéo ra hết khung thì mắt phải quét ngang cả gang tay cho một
 * dòng tám chữ. Đây là chỗ cột rộng làm hại chứ không làm lợi.
 */
export const RONG_DOC = 760;

/** Khoảng cách dọc giữa hai hàng, và giữa hai thẻ khi xếp dọc trên điện thoại. */
const KHE = 16;

/**
 * Bề rộng một ô theo số cột, tính bằng phần trăm.
 *
 * Chừa một rãnh nhỏ giữa các cột rồi để `space-between` chia đều. KHÔNG dùng
 * `columnGap`: bề rộng cộng thêm khe và ô cuối hàng rớt xuống hàng dưới.
 */
const RONG_O: Record<number, `${number}%`> = { 2: '49%', 3: '32%', 4: '23.8%' };

const SoCot = createContext(2);

/** Bọc ngoài một nhóm thẻ. Máy tính xếp thành `cot` cột, còn lại xếp dọc. */
export function LuoiPC({ cot = 2, children }: { cot?: number; children: React.ReactNode }) {
  const pc = useManPC();
  return (
    <SoCot.Provider value={cot}>
      <View
        style={
          pc
            ? {
                flexDirection: 'row',
                flexWrap: 'wrap',
                // `space-between` chia phần dư thành rãnh giữa các cột. Hàng
                // cuối thiếu ô thì mấy ô còn lại giãn ra hai đầu — chấp nhận,
                // vì `columnGap` số cố định cộng vào bề rộng phần trăm sẽ đẩy
                // ô cuối hàng rớt xuống dòng dưới.
                justifyContent: 'space-between',
                rowGap: KHE + 4,
              }
            : { rowGap: KHE }
        }>
        {children}
      </View>
    </SoCot.Provider>
  );
}

/** Một ô trong lưới. Bề rộng lấy theo số cột mà `LuoiPC` bao ngoài đã khai. */
export function OLuoi({ rong, children }: { rong?: boolean; children: React.ReactNode }) {
  const pc = useManPC();
  const cot = useContext(SoCot);
  if (!pc) return <View>{children}</View>;
  return <View style={{ width: rong ? '100%' : (RONG_O[cot] ?? '49%') }}>{children}</View>;
}

/** Bó nội dung thành một cột hẹp căn giữa, chỉ trên máy tính. */
export function CotDoc({ children }: { children: React.ReactNode }) {
  const pc = useManPC();
  return <View style={pc ? KIEU_COT_DOC : undefined}>{children}</View>;
}

export const KIEU_COT_DOC: ViewStyle = {
  width: '100%',
  maxWidth: RONG_DOC,
  alignSelf: 'center',
};
