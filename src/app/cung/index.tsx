/** Lưới 12 cung hoàng đạo. Cung của người dùng được đánh dấu riêng. */

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { Trong } from '@/components/nen';
import { KhungPC } from '@/components/khung-pc';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { NenKhungCung } from '@/components/nen-anh';
import { BauTroiDong } from '@/components/bau-troi-dong';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN, NEN_PHANG } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung } from '@/lib/kho-noi-dung';
import { CUNG, cungTheoNgay } from '@/lib/zodiac';

export default function LuoiCung() {
  const { hoSo } = useHoSo();
  const { dong, loi } = useCung();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const le = useSafeAreaInsets();
  const pc = useManPC();

  return (
    <LinearGradient
      colors={pc ? NEN_PHANG : NEN_CHUYEN}
      locations={[0, 0.45, 1]}
      style={{ flex: 1 }}>
      {/* Máy tính KHÔNG dùng ảnh nền này. Nó là ảnh DỌC vẽ cho màn điện
          thoại, mà `contentFit="fill"` ép cả ảnh vừa khung — ở bề ngang 1920
          thì bốn góc giãn bè thành vệt. `KhungPC` thay nó bằng khung cắt
          chín ô, góc giữ nguyên hình dù khung rộng bao nhiêu. */}
      {pc ? null : <NenKhungCung />}
      <BauTroiDong />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Máy tính giấu thanh tiêu đề nhỏ: nó trải hết cửa sổ, nằm NGOÀI khung
            hoa văn, nên trông như một mẩu rời. Nút quay lại chuyển vào trong
            khung — cùng cách đã làm ở màn Cá nhân. */}
        {pc ? null : <ThanhTieuDe ten="12 cung hoàng đạo" />}

        <ScrollView
          contentContainerClassName={pc ? '' : 'px-5 pt-6'}
          contentContainerStyle={{ paddingBottom: pc ? 40 : 56 + le.bottom }}>
          <KhungPC>
          {pc ? (
            <View className="mb-6 self-start">
              <NutQuayLai />
            </View>
          ) : null}
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: pc ? 64 : 30, lineHeight: pc ? 74 : 36 }}
            className="text-chu-chinh">
            Khám phá bản thân
          </Text>
          <Text
            style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22 }}
            className="mt-1.5 text-chu-phu">
            Chọn cung của bạn hoặc của người thân để xem tính cách và độ hợp.
          </Text>

          {loi ? (
            <View className="mt-6">
              <Trong loi="Chưa tải được nội dung. Bạn thử lại nhé." />
            </View>
          ) : null}

          {/* GIỮ nguyên lưới cuốn dòng của bản điện thoại — màn này vốn đã hai
              cột, không phải một cột như mấy màn khác. Dùng `LuoiPC` ở đây là
              bản điện thoại tụt xuống một cột, đúng lỗi đã mắc ngày 06/11/2026.
              Máy tính chỉ cần đổi bề rộng ô: 4 cột như bản mẫu. Hai cột trong
              khung 1170 thì mỗi ô rộng gần 580 cho đúng một ký hiệu với hai
              dòng chữ — rỗng ruột. */}
          <View className="mt-6 flex-row flex-wrap justify-between gap-y-3">
            {CUNG.map((c) => {
              const nd = dong?.find((x) => x.ma === c.ma);
              const cuaMinh = cuaToi === c.ma;
              return (
                <Pressable
                  key={c.ma}
                  onPress={() => router.push({ pathname: '/cung/chi-tiet', params: { ma: c.ma } })}
                  style={{
                    width: pc ? '23.8%' : '48.5%',
                    borderColor: cuaMinh ? MAU.vang : MAU.vien,
                    borderWidth: cuaMinh ? 1.5 : 1,
                    ...(pc ? { borderRadius: 13, paddingVertical: 28, paddingHorizontal: 15 } : null),
                  }}
                  className={`items-center bg-nen-nhat active:opacity-75${
                    pc ? '' : ' rounded-2xl px-3 py-5'
                  }`}>
                  {cuaMinh ? (
                    <Text
                      style={{ fontFamily: CHU.thanDam, letterSpacing: 1.2 }}
                      className="absolute right-3 top-2.5 text-[9px] uppercase text-vang">
                      Của bạn
                    </Text>
                  ) : null}

                  <View
                    style={{ borderColor: cuaMinh ? MAU.vang : MAU.vien }}
                    className="h-14 w-14 items-center justify-center rounded-full border">
                    <BieuTuongCung ma={c.ma} co={28} mau={cuaMinh ? MAU.vangSang : MAU.vang} />
                  </View>

                  <Text
                    style={{ fontFamily: CHU.hoaDam, fontSize: 20, lineHeight: 26 }}
                    className="mt-2.5 text-chu-chinh">
                    {c.ten}
                  </Text>
                  <Text style={{ fontFamily: CHU.than }} className="text-[11px] text-chu-mo">
                    {nd ? `${nd.tu_ngay} – ${nd.den_ngay}` : c.nguyenTo}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/cung/do-hop')}
            style={{ borderColor: MAU.vien }}
            className="mt-5 flex-row items-center justify-between rounded-2xl border bg-nen-nhat px-5 py-4 active:opacity-75">
            <View className="flex-1 pr-3">
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.3 }}
                className="text-[10px] uppercase text-vang">
                Độ hợp
              </Text>
              <Text style={{ fontFamily: CHU.thanVua }} className="mt-1 text-base text-chu-chinh">
                So hai cung với nhau
              </Text>
            </View>
            <Text className="text-lg text-vang">›</Text>
          </Pressable>
          </KhungPC>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
