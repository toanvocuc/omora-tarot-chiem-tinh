import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import { dongHoi, ngheHoi, type NoiDungHoi, type NutHoi } from '@/lib/hoi-lai';

/**
 * Nơi vẽ hộp thoại hỏi lại. Gắn MỘT lần ở `app/_layout.tsx`, không gắn ở màn.
 *
 * Vì sao phải có nó thay cho `Alert.alert`: xem chú thích đầu `lib/hoi-lai.ts`.
 * Tóm tắt là `Alert.alert` của react-native-web là một hàm rỗng.
 *
 * Dùng `Modal` của React Native chứ không tự dựng lớp phủ: react-native-web có
 * bản cài đặt thật cho `Modal` (gần 500 dòng, kèm portal và bẫy tiêu điểm), nên
 * phím Tab không lọt ra sau lớp phủ và trình đọc màn hình hiểu đúng. Tự dựng
 * bằng `View` tuyệt đối thì mất hết mấy thứ đó.
 */
export function HopThoai() {
  const [noiDung, datNoiDung] = useState<NoiDungHoi | null>(null);

  useEffect(() => ngheHoi(datNoiDung), []);

  if (!noiDung) return null;

  const bam = (nut: NutHoi) => {
    // Đóng TRƯỚC rồi mới chạy việc. Nhiều nút gọi `router.push`, mà đẩy màn
    // trong lúc hộp thoại còn mở thì trên iOS nó treo lại phía trên màn mới.
    dongHoi();
    nut.onPress?.();
  };

  const mauChu = (kieu: NutHoi['kieu']) =>
    kieu === 'manh' ? MAU.giam : kieu === 'bo' ? MAU.chuPhu : MAU.vang;

  return (
    <Modal
      transparent
      animationType="fade"
      visible
      // Nút Back của Android và phím Esc trên web đều rơi vào đây. Không khai
      // thì Android đóng cả màn phía sau thay vì đóng hộp thoại.
      onRequestClose={dongHoi}>
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: 'rgba(6,8,13,0.72)' }}>
        <View
          style={{ backgroundColor: MAU.nenNhat, borderColor: MAU.vien, maxWidth: 420 }}
          className="w-full rounded-2xl border px-6 pb-2 pt-6">
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 24, lineHeight: 32, color: MAU.chuChinh }}
            className="text-center">
            {noiDung.tieuDe}
          </Text>

          {noiDung.than ? (
            <Text
              style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22, color: MAU.chuPhu }}
              className="mt-2.5 text-center">
              {noiDung.than}
            </Text>
          ) : null}

          <View className="mt-5">
            {noiDung.nut.map((nut, i) => (
              <View key={`${nut.nhan}-${i}`}>
                {/* Kẻ giữa các nút, không kẻ trên nút đầu. */}
                <View style={{ backgroundColor: MAU.vien }} className="h-px" />
                <Pressable onPress={() => bam(nut)} className="active:opacity-60">
                  <View className="min-h-[52px] items-center justify-center px-4">
                    <Text
                      style={{
                        fontFamily: nut.kieu === 'bo' ? CHU.than : CHU.thanDam,
                        fontSize: 16,
                        lineHeight: 22,
                        color: mauChu(nut.kieu),
                      }}>
                      {nut.nhan}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
