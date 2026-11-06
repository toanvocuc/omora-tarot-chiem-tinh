/** Màn rút bài: xoè bài thành vòng cung, chạm chọn, lật lên rồi sang màn kết quả. */

import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MatSau } from '@/components/mat-sau';
import { NenKhungVan } from '@/components/nen-anh';
import { BauTroiDong } from '@/components/bau-troi-dong';
import { DangTai, Khoi, ManHinh, Nhan, Trong, VanNgan } from '@/components/nen';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { CHU, MAU } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { datPhien } from '@/lib/phien-rut';
import { rutBai, VI_TRI, type KieuTrai, type LaDaRut } from '@/lib/tarot';

import { rongKhung, useManPC } from '@/constants/khung-web';

const SO_LA = 13;
const RONG_MAN = rongKhung();
const RONG_LA = Math.min(78, RONG_MAN * 0.2);

// Xoè bài: tính theo bước ngang cố định rồi cong lên bằng một đường parabol.
// Dễ canh cho vừa màn hình hơn là tính theo bán kính vòng tròn.
const LE_HAI_BEN = 14;
const BUOC = (RONG_MAN - RONG_LA - LE_HAI_BEN * 2) / (SO_LA - 1);
const DO_CONG = 44; // lá ngoài cùng tụt xuống bao nhiêu điểm ảnh
const GOC_NGOAI = 22; // độ nghiêng của lá ngoài cùng

/**
 * Hình học bộ bài xoè trên MÁY TÍNH, đo thẳng từ mã nguồn bản mẫu.
 *
 * Bản điện thoại cong mạnh (lá ngoài tụt 44px, nghiêng 22 độ) vì phải nhét 13
 * lá vào bề ngang 390. Màn rộng không cần ép như vậy: bản mẫu chỉ nghiêng 3 độ
 * mỗi lá và nhích xuống 3px, nên cả dải gần như thẳng và đọc ra ngay là một bộ
 * bài đang xoè chứ không phải một hình quạt.
 */
const PC_RONG_LA = 104;
/** Chồng lên nhau 38px, tức mỗi lá dịch sang 66. */
const PC_BUOC = PC_RONG_LA - 38;
const PC_GOC_MOI_LA = 3;
const PC_TUT_MOI_LA = 3;
/** Lá được chọn nhấc lên bao nhiêu. */
const PC_NHAC = 36;

export default function RutBai() {
  const { kieu = 'mot-la' } = useLocalSearchParams<{ kieu: KieuTrai }>();
  const { boBai, loi, dangTai } = useBoBai();

  // Chuẩn hoá MỘT lần ở đây rồi dùng khắp nơi. Trước đây dòng tính canRut có
  // dấu `?.` phòng kiểu trải sai, mà dòng gọi rutBai ngay dưới thì không — một
  // dòng thủ, dòng kế bên hở.
  const pc = useManPC();
  const kieuHopLe: KieuTrai = kieu in VI_TRI ? (kieu as KieuTrai) : 'mot-la';
  const canRut = VI_TRI[kieuHopLe].length;
  const duLa = (boBai?.length ?? 0) >= canRut;
  const [daChon, setDaChon] = useState<number[]>([]);
  const [dangLat, setDangLat] = useState(false);
  const lat = useSharedValue(0);

  // Rút sẵn ngay khi vào màn, để bấm hai lần không ra kết quả khác nhau.
  const ketQua = useMemo<LaDaRut[] | null>(
    () => (boBai && duLa ? rutBai(boBai, kieuHopLe) : null),
    [boBai, duLa, kieuHopLe]
  );

  function chon(i: number) {
    if (dangLat || daChon.includes(i)) return;
    const moi = [...daChon, i];
    setDaChon(moi);
    if (moi.length < canRut) return;

    setDangLat(true);
    lat.value = withTiming(1, { duration: 800 }, (xong) => {
      if (xong) runOnJS(sangKetQua)();
    });
  }

  function sangKetQua() {
    if (!ketQua) return;
    datPhien(ketQua);
    router.replace('/tarot/ket-qua');
  }

  const kieuLat = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${lat.value * 180}deg` }],
    opacity: 1 - lat.value * 0.3,
  }));

  // Phải chặn lỗi TRƯỚC vòng quay. Tải hỏng thì dangTai hết true nhưng ketQua
  // vẫn null, nên để nguyên thứ tự cũ là màn quay mãi không bao giờ thoát.
  if (loi || (boBai && !duLa)) {
    return (
      <View className="flex-1 bg-nen px-5 pt-24">
        <Trong
          loi={
            loi
              ? 'Chưa tải được nội dung. Bạn thử lại nhé.'
              : boBai?.length
                ? `Kho lá bài chỉ còn ${boBai.length} lá, không đủ cho kiểu trải này.`
                : 'Kho lá bài đang trống, chưa rút được.'
          }
        />
      </View>
    );
  }

  if (dangTai || !ketQua) {
    return (
      <View className="flex-1 bg-nen">
        <DangTai />
      </View>
    );
  }

  /* ───────────────────────── BẢN MÁY TÍNH ─────────────────────────
   *
   * Dựng bằng `ManHinh` để ăn chung khung hoa văn với mọi màn khác, thay vì
   * tự vẽ nền như bản điện thoại. Bộ bài nằm trong một khối riêng có dòng
   * "BỘ BÀI RIDER–WAITE" và ô đếm, rồi tới hàng ô trống đánh số — đúng bản mẫu.
   */
  if (pc) {
    const giua = (SO_LA - 1) / 2;
    return (
      <ManHinh
        quayLai
        tieuDe="Chọn lá bài khiến bạn chú ý."
        phu="Không cần tìm một lựa chọn hoàn hảo. Cứ chậm rãi và chọn theo cảm nhận.">
        <Khoi>
          <View className="flex-row items-center justify-between">
            <Nhan>Bộ bài Rider–Waite</Nhan>
            <View
              style={{ borderColor: MAU.vien }}
              className="rounded-full border bg-nen px-3.5 py-1.5">
              <Text style={{ fontFamily: CHU.thanVua, fontSize: 12 }} className="text-chu-phu">
                Đã chọn {daChon.length}/{canRut} lá
              </Text>
            </View>
          </View>

          <View
            style={{ height: 300 }}
            className="mt-2 w-full items-center justify-center overflow-hidden">
            {Array.from({ length: SO_LA }).map((_, i) => {
              const lech = i - giua;
              const chonRoi = daChon.includes(i);
              return (
                <Pressable
                  key={i}
                  onPress={() => chon(i)}
                  disabled={dangLat}
                  accessibilityRole="button"
                  accessibilityLabel={`Chọn lá bài số ${i + 1}`}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: lech * PC_BUOC },
                      {
                        translateY: chonRoi
                          ? -PC_NHAC
                          : Math.abs(lech) * PC_TUT_MOI_LA,
                      },
                      { rotate: chonRoi ? '0deg' : `${lech * PC_GOC_MOI_LA}deg` },
                    ],
                    opacity: daChon.length > 0 && !chonRoi ? 0.5 : 1,
                    zIndex: chonRoi ? 50 : i,
                  }}>
                  <Animated.View style={chonRoi ? kieuLat : undefined}>
                    <View
                      style={
                        chonRoi
                          ? {
                              borderRadius: 9,
                              borderWidth: 2.5,
                              borderColor: MAU.vangSang,
                              shadowColor: MAU.vang,
                              shadowOpacity: 0.85,
                              shadowRadius: 16,
                              shadowOffset: { width: 0, height: 0 },
                              elevation: 14,
                            }
                          : undefined
                      }>
                      <MatSau rong={PC_RONG_LA} />
                    </View>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>

          {/* Hàng ô trống: cho thấy còn phải chọn mấy lá nữa, và lá nào đã vào
              chỗ nào. Bản điện thoại chỉ có một dòng đếm vì không đủ bề ngang. */}
          <View className="mt-4 flex-row justify-center gap-[18px]">
            {Array.from({ length: canRut }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 68,
                  height: 116,
                  borderRadius: 5,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: i < daChon.length ? MAU.vangVua : '#6B5664',
                  backgroundColor: i < daChon.length ? MAU.nenNhatHon : 'transparent',
                }}
                className="items-center justify-center">
                <Text style={{ fontFamily: CHU.hoa, fontSize: 24, color: '#7E6684' }}>
                  {i < daChon.length ? '✦' : i + 1}
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={{ fontFamily: CHU.than, fontSize: 12 }}
            className="mt-4 text-center text-chu-mo">
            {dangLat
              ? 'Đang lật bài'
              : canRut === 3
                ? 'Ba vị trí: Quá khứ · Hiện tại · Tương lai'
                : 'Chạm một lá bất kỳ để chọn.'}
          </Text>
        </Khoi>
      </ManHinh>
    );
  }

  return (
    <View className="flex-1 bg-nen">
      <NenKhungVan />
      <BauTroiDong />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="ml-8 mt-6">
          <NutQuayLai />
        </View>

        <View className="mt-6 px-8">
          <Text
            style={{ fontFamily: CHU.than, fontSize: 16 }}
            className="text-center text-chu-chinh">
            {dangLat ? 'Đang lật bài' : canRut === 1 ? 'Chạm để chọn một lá' : 'Chạm để chọn ba lá'}
          </Text>
          <VanNgan />
        </View>

        {/* Hoa văn la bàn lớn làm nền, nằm sau bộ bài */}
        <View className="flex-1 items-center justify-center pb-16">
          <View style={{ height: RONG_LA / 0.57 + 70, width: '100%' }} className="items-center justify-center">
            {Array.from({ length: SO_LA }).map((_, i) => {
              const giua = (SO_LA - 1) / 2;
              const lech = (i - giua) / giua; // -1 ở mép trái, 0 giữa, 1 ở mép phải
              const chonRoi = daChon.includes(i);
              const mo = daChon.length > 0 && !chonRoi;

              return (
                <Pressable
                  key={i}
                  onPress={() => chon(i)}
                  disabled={dangLat}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: (i - giua) * BUOC },
                      { translateY: lech * lech * DO_CONG - (chonRoi ? 36 : 0) },
                      { rotate: `${lech * GOC_NGOAI}deg` },
                    ],
                    opacity: mo ? 0.42 : 1,
                    zIndex: chonRoi ? 50 : i,
                  }}>
                  <Animated.View style={chonRoi ? kieuLat : undefined}>
                    <View
                      style={
                        chonRoi
                          ? {
                              borderRadius: 9,
                              borderWidth: 2.5,
                              borderColor: MAU.vangSang,
                              shadowColor: MAU.vang,
                              shadowOpacity: 0.85,
                              shadowRadius: 16,
                              shadowOffset: { width: 0, height: 0 },
                              elevation: 14,
                            }
                          : undefined
                      }>
                      <MatSau rong={RONG_LA} />
                    </View>
                  </Animated.View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="items-center pb-14">
          {canRut > 1 && !dangLat ? (
            <View
              style={{ borderColor: MAU.vien }}
              className="rounded-full border bg-nen-nhat px-6 py-2.5">
              <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-phu">
                Đã chọn {daChon.length} / {canRut}
              </Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}
