/**
 * Mấy nơi khách liên hệ được với thầy.
 *
 * VÌ SAO KHÔNG TỰ MỞ ZALO NỮA
 *
 * Trước đây đặt lịch xong là app tự mở Zalo. Hai chỗ sai:
 *
 *   1. Chọn hộ khách một kênh. Khách không dùng Zalo thì bị đẩy sang một ứng
 *      dụng họ không có, còn thầy thì có mặt ở mấy chỗ khác mà khách không biết.
 *   2. Đẩy khách ra khỏi app đúng lúc vừa đặt xong, chưa kịp nhìn thấy đơn của
 *      mình nằm ở đâu và trạng thái ra sao.
 *
 * Giờ bày hết ra, khách tự chọn.
 *
 * Nơi nào thầy chưa khai thì không hiện — thà thiếu một nút còn hơn một nút bấm
 * vào không ra gì.
 */

import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import type { DongChuyenGia } from '@/lib/kho-noi-dung';

type Noi = {
  ten: string;
  bieu: keyof typeof Ionicons.glyphMap;
  duong: string;
};

/**
 * Zalo lưu dạng số, mấy nơi kia lưu đường dẫn đầy đủ.
 *
 * Chỉ đọc đúng cột `zalo` của từng người, KHÔNG rơi về số chung nữa. Trước
 * đây ai bỏ trống cũng hiện nút Zalo trỏ về số công ty, nên hai chuyên gia không
 * dùng Zalo vẫn mọc ra một nút Zalo — khách bấm vào là nhắn nhầm chỗ.
 *
 * Giờ bảng dữ liệu quyết định: ai có số thì hiện nút, ai không thì thôi. Ai
 * muốn dùng số chung thì điền hẳn số chung vào cột của mình.
 *
 * Nút "Mở Zalo" của gian hàng không đi qua đây, nó vẫn dùng số công ty như cũ.
 */
export function cacNoiLienHe(thay: DongChuyenGia): Noi[] {
  const so = thay.zalo?.trim();
  const ds: Noi[] = [];
  if (so) ds.push({ ten: 'Zalo', bieu: 'chatbubble-ellipses-outline', duong: `https://zalo.me/${so}` });
  if (thay.facebook?.trim()) ds.push({ ten: 'Facebook', bieu: 'logo-facebook', duong: thay.facebook.trim() });
  if (thay.tiktok?.trim()) ds.push({ ten: 'TikTok', bieu: 'musical-notes-outline', duong: thay.tiktok.trim() });
  return ds;
}

export function NoiLienHe({ thay, gon }: { thay: DongChuyenGia; gon?: boolean }) {
  const ds = cacNoiLienHe(thay);
  if (ds.length === 0) return null;

  return (
    <View className={gon ? 'flex-row flex-wrap gap-2' : 'gap-2.5'}>
      {ds.map((n) => (
        <Pressable
          key={n.ten}
          onPress={() => Linking.openURL(n.duong).catch(() => {})}
          style={{ borderColor: MAU.vang }}
          className={`flex-row items-center gap-2.5 rounded-xl border px-4 py-2.5 active:opacity-70 ${
            gon ? '' : 'justify-center'
          }`}>
          <Ionicons name={n.bieu} size={16} color={MAU.vang} />
          <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-vang">
            {n.ten}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
