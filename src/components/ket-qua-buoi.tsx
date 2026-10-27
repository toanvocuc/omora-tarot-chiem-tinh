/**
 * Màn kết quả sau một buổi thực hành.
 *
 * ───────────────────────────────────────── CHỈ KỂ VIỆC ĐÃ LÀM, KHÔNG HỨA GÌ
 *
 * Chỗ này RẤT dễ viết thành lời hứa y tế: "thở năm phút giúp giảm lo âu", "nhịp
 * tim chậm lại". Ba lý do không viết vậy:
 *
 *   1. Điều khoản 1.4.1 của Apple bắt soi kỹ app nào có thể đưa thông tin sai
 *      về sức khoẻ, và dặn phải nhắc người dùng hỏi bác sĩ.
 *   2. Luật Việt Nam quản quảng cáo dịch vụ sức khoẻ.
 *   3. Nặng hơn cả hai: không ai trong đội có chuyên môn để đứng sau lời hứa đó.
 *
 * Nên màn này chỉ nói ba thứ, và cả ba đều là SỰ VIỆC đo được:
 *   · bạn vừa làm gì, trong bao lâu
 *   · so với chính bạn lần trước, và trong tuần này
 *   · chuỗi ngày sau buổi này
 *
 * Mô tả kỹ thuật thì được — "nhịp 4–7–8 có thở ra dài gấp đôi hít vào" là tả
 * CÁCH LÀM, không phải tả thứ nó chữa.
 */

import { Text, View } from 'react-native';

import { Khoi, Nhan, Nut } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';

export type DongKetQua = { nhan: string; gia: string };

export function KetQuaBuoi({
  tieuDe,
  dong,
  moTa,
  chuoi,
  xong,
}: {
  tieuDe: string;
  dong: DongKetQua[];
  /** Một câu tả CÁCH LÀM của bài vừa xong. Không phải tác dụng. */
  moTa?: string;
  chuoi: number;
  xong: () => void;
}) {
  return (
    <View className="gap-5 pt-4">
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 38 }}
        className="text-center text-chu-chinh">
        {tieuDe}
      </Text>

      <Khoi vien>
        {dong.map((d, i) => (
          <View
            key={d.nhan}
            className={`flex-row items-center justify-between ${i ? 'mt-3' : ''}`}>
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
              {d.nhan}
            </Text>
            <Text style={{ fontFamily: CHU.thanDam }} className="text-base text-chu-chinh">
              {d.gia}
            </Text>
          </View>
        ))}
      </Khoi>

      <Khoi vang={chuoi > 0}>
        <Nhan>Chuỗi ngày</Nhan>
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 32, lineHeight: 40 }}
          className="text-chu-chinh">
          {chuoi <= 1 ? 'Ngày đầu tiên' : `${chuoi} ngày liền`}
        </Text>
      </Khoi>

      {moTa ? (
        <Text
          style={{ fontFamily: CHU.than }}
          className="px-1 text-sm leading-6 text-chu-phu">
          {moTa}
        </Text>
      ) : null}

      <Nut nhan="Xong" onPress={xong} />
    </View>
  );
}
