/**
 * Khung vẽ bằng ngón tay.
 *
 * ──────────────────────────────────────── LƯU THÀNH NÉT, KHÔNG THÀNH ẢNH
 *
 * Mỗi nét là một chuỗi toạ độ, cất xuống dạng chữ. Ba cái lợi so với lưu ảnh:
 *
 *   · Không cần `expo-image-picker` hay quyền truy cập ảnh. Thêm gói gốc là ĐỔI
 *     DẤU VÂN TAY, bản cài đang sống mất đường nhận OTA.
 *   · Một trang vẽ nặng vài kilobyte thay vì vài megabyte.
 *   · Vẽ lại được ở mọi cỡ màn, và sau này muốn thêm nút hoàn tác từng nét hay
 *     đổi màu cả bức thì vẫn còn dữ liệu để làm.
 *
 * `react-native-svg` và `react-native-gesture-handler` đã có sẵn trong dự án
 * nên khung này không kéo theo gói nào mới.
 */

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { runOnJS } from 'react-native-reanimated';

import { Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';

/** Một nét: chuỗi toạ độ đã làm tròn về số nguyên cho gọn. */
export type Net = { d: string; day: number };

/** Ba cỡ nét. Đủ để vẽ đậm nhạt mà không phải bày ra một bảng chọn. */
const CO_NET = [2, 5, 10];

export function KhungVe({
  net,
  datNet,
  datCo,
  cao = 320,
}: {
  net: Net[];
  datNet: (n: Net[]) => void;
  /**
   * Báo ra bề ngang thật của khung.
   *
   * Nét cất theo toạ độ tuyệt đối của khung này. Vẽ lại trong một ô nhỏ hơn mà
   * không biết khung gốc rộng bao nhiêu thì không thu lại được, và bức vẽ bị
   * cắt — đã dính đúng lỗi đó một lần.
   */
  datCo?: (c: { w: number; h: number }) => void;
  cao?: number;
}) {
  const [day, datDay] = useState(CO_NET[1]);
  const [dangVe, datDangVe] = useState<string | null>(null);

  function batDau(x: number, y: number) {
    datDangVe(`M${Math.round(x)} ${Math.round(y)}`);
  }

  function keo(x: number, y: number) {
    datDangVe((d) => (d ? `${d} L${Math.round(x)} ${Math.round(y)}` : d));
  }

  function nhac() {
    datDangVe((d) => {
      // Chạm một cái rồi nhấc tay ra ngay thì `d` chỉ có mỗi điểm bắt đầu, vẽ ra
      // không thấy gì. Nối thêm chính nó để thành một chấm tròn.
      if (d) datNet([...net, { d: d.includes('L') ? d : `${d} L${d.slice(1)}`, day }]);
      return null;
    });
  }

  const cu_chi = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => runOnJS(batDau)(e.x, e.y))
    .onUpdate((e) => runOnJS(keo)(e.x, e.y))
    .onEnd(() => runOnJS(nhac)())
    .onFinalize(() => runOnJS(nhac)());

  return (
    <View className="gap-3">
      <GestureDetector gesture={cu_chi}>
        <View
          onLayout={(e) => datCo?.({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
          style={{ height: cao, borderColor: MAU.vien, backgroundColor: '#FFFFFF' }}
          className="overflow-hidden rounded-2xl border">
          <Svg width="100%" height="100%">
            {net.map((n, i) => (
              <Path
                key={i}
                d={n.d}
                stroke={MAU.chuChinh}
                strokeWidth={n.day}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {dangVe ? (
              <Path
                d={dangVe}
                stroke={MAU.chuChinh}
                strokeWidth={day}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}
          </Svg>

          {net.length === 0 && !dangVe ? (
            <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
              <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo">
                Vẽ bằng ngón tay
              </Text>
            </View>
          ) : null}
        </View>
      </GestureDetector>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {CO_NET.map((c) => (
            <View
              key={c}
              onTouchEnd={() => datDay(c)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                borderWidth: day === c ? 2 : 1,
                borderColor: day === c ? MAU.vang : MAU.vien,
              }}
              className="items-center justify-center">
              <View
                style={{
                  width: c + 4,
                  height: c + 4,
                  borderRadius: (c + 4) / 2,
                  backgroundColor: MAU.chuChinh,
                }}
              />
            </View>
          ))}
        </View>

        <View className="flex-row gap-2">
          <Nho nhan="Hoàn tác" onPress={() => datNet(net.slice(0, -1))} tat={net.length === 0} />
          <Nho nhan="Xoá hết" onPress={() => datNet([])} tat={net.length === 0} />
        </View>
      </View>
    </View>
  );
}

function Nho({ nhan, onPress, tat }: { nhan: string; onPress: () => void; tat?: boolean }) {
  return (
    <View style={{ opacity: tat ? 0.4 : 1 }}>
      <Nut nhan={nhan} kieu="nhe" onPress={() => !tat && onPress()} />
    </View>
  );
}

/**
 * Vẽ lại một trang đã cất, ở cỡ nhỏ để xem trong nhật ký.
 *
 * `viewBox` là thứ thu cả bức về vừa ô. Thiếu nó thì nét giữ nguyên toạ độ cũ và
 * bức vẽ bị cắt mất phần dưới.
 */
export function XemLaiNet({ net, co, cao = 160 }: { net: Net[]; co?: { w: number; h: number }; cao?: number }) {
  const khung = co && co.w > 0 && co.h > 0 ? co : { w: 400, h: 320 };
  return (
    <View
      style={{ height: cao, borderColor: MAU.vien, backgroundColor: '#FFFFFF' }}
      className="overflow-hidden rounded-xl border">
      <Svg width="100%" height="100%" viewBox={`0 0 ${khung.w} ${khung.h}`} preserveAspectRatio="xMidYMid meet">
        {net.map((n, i) => (
          <Path
            key={i}
            d={n.d}
            stroke={MAU.chuChinh}
            strokeWidth={n.day}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}
