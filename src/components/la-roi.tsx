/**
 * Lá rơi: vài chiếc lá xanh và lá vàng trôi chậm từ trên xuống, khẽ đung đưa.
 *
 * Thay cho bầu trời sao cũ (`bau-troi-dong.tsx`). Sao hợp với bộ mặt chiêm tinh
 * trước kia; tông xanh lá và trắng bây giờ thì lá hợp hơn, và nó cũng đúng với
 * nơi chốn — một làng giữa đồi ở Bảo Lộc.
 *
 * Giữ nguyên ba nguyên tắc của tệp cũ, vì chúng vẫn đúng:
 *
 *  1. **Ngủ khi không ai nhìn.** Màn mất tiêu điểm là dừng hẳn, không đốt pin
 *     cho một màn đang ở sau lưng.
 *  2. **Tôn trọng cài đặt giảm chuyển động.** Người bị say chuyển động bật mục
 *     đó trong cài đặt máy; lúc ấy lá vẫn nằm đó nhưng đứng yên.
 *  3. **Ít lá.** Chín chiếc là đủ thấy, nhiều hơn thì máy yếu bắt đầu khựng mà
 *     mắt cũng không nhận ra khác biệt.
 *
 * Chuyển động chạy bằng reanimated nên nằm ở luồng giao diện, không đụng luồng
 * JavaScript — app vẫn mượt khi đang tải dữ liệu.
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const { width: RONG, height: CAO } = Dimensions.get('window');

const SO_LA = 12;

/**
 * Hình chiếc lá, kèm gân giữa.
 *
 * Một hình thôi, đổi màu và xoay là ra đủ kiểu. Vẽ nhiều hình lá khác nhau thì
 * tốn công mà ở cỡ mười mấy pixel không ai phân biệt được.
 */
const DUONG_LA = 'M12 2C6 7.5 4.5 13 12 22C19.5 13 18 7.5 12 2Z';
const DUONG_GAN = 'M12 4V20';

/** Xanh non, xanh đậm, vàng úa, vàng cam — trộn lẫn như lá thật. */
const MAU_LA = ['#4E9E73', '#2E7D53', '#C9972A', '#D9A441', '#6FB58C', '#B8862B'];

type ViLa = {
  /** Chỗ bắt đầu theo bề ngang, tính bằng phần trăm để đổi máy vẫn hợp. */
  x: number;
  co: number;
  mau: string;
  /** Một vòng rơi hết bao lâu. */
  roi: number;
  /** Chờ bao lâu rồi mới thả. */
  tre: number;
  /** Đung đưa ngang bao nhiêu pixel. */
  dua: number;
  /** Xoay bao nhiêu độ trong một vòng. */
  xoay: number;
  mo: number;
};

function raiLa(): ViLa[] {
  const ngau = (tu: number, den: number) => tu + Math.random() * (den - tu);
  return Array.from({ length: SO_LA }, () => ({
    x: ngau(0.02, 0.92) * RONG,
    co: ngau(20, 38),
    mau: MAU_LA[Math.floor(Math.random() * MAU_LA.length)],
    // Chậm: lá rơi nhanh trông như mưa, mà màn này cần tĩnh.
    roi: ngau(16_000, 30_000),
    tre: ngau(0, 8_000),
    dua: ngau(18, 52),
    xoay: ngau(120, 400) * (Math.random() < 0.5 ? -1 : 1),
    mo: ngau(0.5, 0.85),
  }));
}

export function LaRoi() {
  // Dùng useFocusEffect của expo-router chứ không kéo thêm @react-navigation vào
  // làm phụ thuộc trực tiếp — thư viện đó đã nằm sẵn bên dưới expo-router rồi.
  const [hienRa, datHienRa] = useState(false);
  useFocusEffect(
    useCallback(() => {
      datHienRa(true);
      return () => datHienRa(false);
    }, [])
  );

  const giamChuyenDong = useReducedMotion();
  const la = useMemo(() => raiLa(), []);
  const dong = hienRa && !giamChuyenDong;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {la.map((l, i) => (
        <MotLa key={i} {...l} dong={dong} />
      ))}
    </View>
  );
}

function MotLa({ x, co, mau, roi, tre, dua, xoay, mo, dong }: ViLa & { dong: boolean }) {
  const tien = useSharedValue(0);
  const nga = useSharedValue(0);

  useEffect(() => {
    if (!dong) {
      cancelAnimation(tien);
      cancelAnimation(nga);
      return;
    }
    // Rơi đều một mạch: lá thật rơi chậm dần rồi nhanh lên tuỳ gió, nhưng ở cỡ
    // này mắt không đọc ra, mà tuyến tính thì không bị khựng ở hai đầu vòng lặp.
    tien.value = withDelay(tre, withRepeat(withTiming(1, { duration: roi, easing: Easing.linear }), -1, false));
    // Đung đưa ngang theo nhịp RIÊNG, không chia hết cho nhịp rơi — trùng nhịp
    // thì mọi chiếc lá đều lượn giống hệt nhau, nhìn ra ngay là máy làm.
    nga.value = withDelay(
      tre,
      withRepeat(
        withSequence(
          withTiming(1, { duration: roi / 3.3, easing: Easing.inOut(Easing.quad) }),
          withTiming(-1, { duration: roi / 3.3, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      )
    );
    return () => {
      cancelAnimation(tien);
      cancelAnimation(nga);
    };
  }, [dong, roi, tre, tien, nga]);

  const kieu = useAnimatedStyle(() => ({
    // Bắt đầu trên mép màn một đoạn để không ai thấy lá hiện ra giữa không khí.
    transform: [
      { translateY: -40 + tien.value * (CAO + 80) },
      { translateX: nga.value * dua },
      { rotate: `${tien.value * xoay}deg` },
    ],
    opacity: mo,
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: x, top: 0 }, kieu]}>
      <Svg width={co} height={co} viewBox="0 0 24 24">
        <Path d={DUONG_LA} fill={mau} />
        <Path d={DUONG_GAN} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={1.1} fill="none" />
      </Svg>
    </Animated.View>
  );
}
