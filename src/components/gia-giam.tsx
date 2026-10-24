/**
 * Khối giá có gạch ngang và nhãn phần trăm, kiểu mấy sàn bán hàng.
 *
 * ────────────────────────────────────────────── CHỈ HIỆN KHI GIẢM GIÁ CÓ THẬT
 *
 * `giaTruoc` phải là giá cửa hàng ĐÃ TỪNG bán. Không có thì khối này tự rút về
 * một dòng giá trơn, không gạch gì và không nhãn gì — xem migration 0028.
 *
 * Gạch một con số chưa bao giờ có thật nhìn thì bắt mắt, nhưng đó là quảng cáo
 * sai sự thật: luật giá phạt được, Apple cũng gạt app vì nó, và khách phát hiện
 * ra một lần là mất luôn niềm tin vào mọi con số còn lại.
 */

import { Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import { phanTramGiam, tien } from '@/lib/gian-hang';

export function NhanGiam({ phanTram }: { phanTram: number }) {
  if (phanTram <= 0) return null;
  return (
    <View
      style={{ backgroundColor: MAU.giam, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 }}>
      <Text style={{ fontFamily: CHU.thanDam, color: '#FFF', fontSize: 11 }}>-{phanTram}%</Text>
    </View>
  );
}

export function KhoiGia({
  gia,
  giaTruoc,
  donVi,
  co = 'vua',
}: {
  gia: number;
  giaTruoc?: number | null;
  donVi: string;
  /** 'vua' cho thẻ trong danh sách, 'to' cho trang một món. */
  co?: 'vua' | 'to';
}) {
  const giam = phanTramGiam(gia, giaTruoc);
  const coGia = co === 'to' ? 26 : 16;

  return (
    <View>
      <View className="flex-row flex-wrap items-center gap-2">
        <Text style={{ fontFamily: CHU.thanDam, color: giam > 0 ? MAU.giam : MAU.vang, fontSize: coGia }}>
          {tien(gia)}
          <Text style={{ fontFamily: CHU.than, color: MAU.chuMo, fontSize: co === 'to' ? 15 : 13 }}>
            {' / '}
            {donVi}
          </Text>
        </Text>
        <NhanGiam phanTram={giam} />
      </View>

      {giam > 0 && giaTruoc ? (
        <Text
          style={{
            fontFamily: CHU.than,
            color: MAU.chuMo,
            fontSize: co === 'to' ? 14 : 12,
            textDecorationLine: 'line-through',
          }}
          className="mt-0.5">
          {tien(giaTruoc)}
        </Text>
      ) : null}
    </View>
  );
}
