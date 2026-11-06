/**
 * Lưới hai cột cho bản web trên máy tính, và cột dọc hẹp cho nội dung để đọc.
 *
 * Gom vào một chỗ vì năm màn tab đều cần đúng hai kiểu xếp này, và mỗi màn tự
 * chế một kiểu thì chúng lệch nhau vài pixel — thứ không ai nhìn ra khi sửa
 * từng màn, nhưng bấm qua lại giữa các tab là thấy ngay.
 *
 * Dưới ngưỡng máy tính, cả hai thứ ở đây đều trả về đúng bố cục cũ: `LuoiPC`
 * thành một cột có khoảng cách 16, `CotDoc` thành một `View` trơn. Web trên
 * điện thoại và hai bản app KHÔNG đổi gì.
 */

import { type ViewStyle, View } from 'react-native';

import { useManPC } from '@/constants/khung-web';

/**
 * Bề rộng một cột chữ để đọc.
 *
 * Mấy màn chỉ có một dòng chữ nối tiếp một dòng chữ — danh sách cài đặt, hồ sơ
 * một người — kéo ra 1180 thì mắt phải quét ngang cả gang tay cho một dòng tám
 * chữ. Đây là chỗ cột rộng làm hại chứ không làm lợi, nên mấy màn đó bó lại.
 */
export const RONG_DOC = 760;

/** Khoảng cách dọc giữa hai hàng trong lưới, và giữa hai thẻ khi xếp dọc. */
const KHE = 16;

/**
 * Bọc ngoài một nhóm thẻ. Máy tính xếp hai cột, còn lại xếp dọc như cũ.
 *
 * Thẻ con phải đi qua `OLuoi` để nhận bề ngang — lưới này KHÔNG tự chia cho
 * con, vì react-native-web không có `grid`, chỉ có `flexWrap`.
 */
export function LuoiPC({ children }: { children: React.ReactNode }) {
  const pc = useManPC();
  return (
    <View
      style={
        pc
          ? { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: KHE }
          : { rowGap: KHE }
      }>
      {children}
    </View>
  );
}

/**
 * Một ô trong lưới.
 *
 * 49% chứ không phải 50%: chừa 2% làm rãnh giữa hai cột. Dùng `columnGap` thay
 * thì bề rộng cộng thêm khe và ô thứ hai rớt xuống hàng dưới.
 */
export function OLuoi({ rong, children }: { rong?: boolean; children: React.ReactNode }) {
  const pc = useManPC();
  return <View style={pc ? { width: rong ? '100%' : '49%' } : undefined}>{children}</View>;
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
