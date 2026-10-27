/**
 * Bảy cột, mỗi cột một ngày, cao theo số phút đã thực hành.
 *
 * Dùng `react-native-svg` vốn đã có sẵn trong dự án, nên không kéo theo gói nào
 * mới — bản cài đang sống vẫn nhận được qua OTA.
 *
 * Ngày chưa làm vẽ một gạch mảnh ở đáy chứ không bỏ trống: hàng cột đứt quãng
 * khó đọc hơn hàng cột có chỗ thấp chỗ cao.
 */

import { Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { CHU, MAU } from '@/constants/giao-dien';

const CAO = 76;
const DAY_COT = 22;
const CACH = 10;
/** Gạch mảnh cho ngày không làm gì. */
const CAO_TOI_THIEU = 3;

const TEN_THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function BieuDoTuan({ ngay }: { ngay: { ngay: string; phut: number }[] }) {
  const cao = Math.max(...ngay.map((n) => n.phut), 10);
  const rong = ngay.length * DAY_COT + (ngay.length - 1) * CACH;

  return (
    <View>
      <Svg width={rong} height={CAO}>
        {ngay.map((n, i) => {
          const h = n.phut > 0 ? Math.max(6, (n.phut / cao) * CAO) : CAO_TOI_THIEU;
          const cuoi = i === ngay.length - 1;
          return (
            <Rect
              key={n.ngay}
              x={i * (DAY_COT + CACH)}
              y={CAO - h}
              width={DAY_COT}
              height={h}
              rx={4}
              fill={n.phut > 0 ? (cuoi ? MAU.vang : MAU.vangSang) : MAU.vien}
            />
          );
        })}
      </Svg>

      <View style={{ width: rong }} className="mt-2 flex-row">
        {ngay.map((n, i) => (
          <Text
            key={n.ngay}
            style={{
              fontFamily: CHU.than,
              width: DAY_COT,
              marginRight: i === ngay.length - 1 ? 0 : CACH,
              textAlign: 'center',
              fontSize: 10,
            }}
            className={i === ngay.length - 1 ? 'text-vang' : 'text-chu-mo'}>
            {TEN_THU[thuTrongTuan(n.ngay)]}
          </Text>
        ))}
      </View>
    </View>
  );
}

/**
 * Thứ trong tuần từ chuỗi 'YYYY-MM-DD'.
 *
 * Dựng `new Date(n, t - 1, g)` theo giờ địa phương chứ không `new Date(chuoi)`:
 * cách sau đọc chuỗi ngày như giờ UTC, nên ở Việt Nam mọi ngày lùi lại một thứ.
 */
function thuTrongTuan(ngay: string): number {
  const [n, t, g] = ngay.split('-').map(Number);
  return new Date(n, t - 1, g).getDay();
}
