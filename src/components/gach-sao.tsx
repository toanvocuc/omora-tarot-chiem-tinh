/**
 * Gạch trang trí đặt dưới logo: một nét vàng mảnh mờ dần về hai đầu, ngôi sao
 * bốn cánh ở giữa.
 *
 * Để RIÊNG, không nhét vào <Logo>, vì logo còn dùng ở thẻ chia sẻ xuất ra ảnh
 * 1080×1350 — chỗ đó bố cục đã đo sát từng pixel (chữ hết ở 1032, logo chạm
 * đúng mép 1278), thêm gạch vào là tràn khung.
 *
 * Hai đầu dùng `rgba(212,168,75,0)` chứ KHÔNG dùng chữ 'transparent': trên
 * Android, 'transparent' trong dải màu bị nội suy qua đen nên nét vàng xuất
 * hiện một vệt xám bẩn ở hai đầu thay vì mờ dần.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';

/** Vàng của app ở mức trong suốt hoàn toàn, để dải màu mờ đúng tông. */
const VANG_TRONG = 'rgba(212,168,75,0)';

export function GachSao({ rong = 150 }: { rong?: number }) {
  return (
    <View
      style={{ width: rong }}
      className="mt-3 flex-row items-center justify-center gap-2">
      <LinearGradient
        colors={[VANG_TRONG, MAU.vang]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, height: 1 }}
      />
      <Text
        style={{ fontFamily: CHU.than, color: MAU.vang, fontSize: 10, lineHeight: 14 }}>
        ✦
      </Text>
      <LinearGradient
        colors={[MAU.vang, VANG_TRONG]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ flex: 1, height: 1 }}
      />
    </View>
  );
}
