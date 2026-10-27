/**
 * Cây của bạn — lớn lên theo tổng số phút đã thực hành.
 *
 * ──────────────────────────────────────── VÌ SAO LÀ CÂY, KHÔNG PHẢI CON SỐ
 *
 * Bốn mục thực hành đều là một mình với chính mình, và người dùng nói thẳng là
 * nó quẩn. Mấy app chăm sóc bản thân sống lâu nhất chữa đúng bệnh này bằng cách
 * đưa cho người ta MỘT THỨ KHÁC ĐỂ CHĂM — thở không phải vì mình nữa, mà vì con
 * vật hay cái cây đang chờ.
 *
 * Chọn cây vì nó hợp hai thứ sẵn có: lá rơi trên nền, và cái làng đang xây ở
 * Bảo Lộc.
 *
 * ──────────────────────────────────────────────── CÂY KHÔNG BAO GIỜ HÉO
 *
 * Nghỉ mấy ngày thì cây đứng yên, không tụt lại. Xem ghi chú ở `giaiDoanCay`.
 *
 * Bảy giai đoạn là bảy bức tranh trong `assets/cay/`, cắt từ một ảnh gốc giữ
 * lại ở `nguon-bay-giai-doan.png`. Trước đây chỗ này vẽ bằng `react-native-svg`
 * rồi có một thời là pixel art; cả hai đều bị bác.
 */

import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Khoi, Nhan, Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import {
  giaiDoanCay,
  giaiDoanSau,
  MOT_LAN_TUOI,
  tienToiGiaiDoanSau,
} from '@/lib/thuc-hanh';

/**
 * Bảy giai đoạn, mỗi giai đoạn một bức tranh.
 *
 * `cao` giữ ĐÚNG tỉ lệ cao thật giữa bảy bức trong ảnh gốc, nên nhìn liền
 * mạch là một cây lớn dần chứ không phải bảy cây tuỳ cỡ. `rong` tính sẵn theo
 * tỉ lệ từng bức, khỏi phải đo lúc chạy.
 */
const ANH_CAY = [
  { nguon: require('@/assets/cay/cay-0.png'), cao: 23, rong: 23 },
  { nguon: require('@/assets/cay/cay-1.png'), cao: 39, rong: 29 },
  { nguon: require('@/assets/cay/cay-2.png'), cao: 54, rong: 33 },
  { nguon: require('@/assets/cay/cay-3.png'), cao: 74, rong: 50 },
  { nguon: require('@/assets/cay/cay-4.png'), cao: 104, rong: 70 },
  { nguon: require('@/assets/cay/cay-5.png'), cao: 127, rong: 94 },
  { nguon: require('@/assets/cay/cay-6.png'), cao: 164, rong: 164 },
] as const;

/** Chừa trên ngọn và dưới gốc, để cây không chạm mép khung. */
const CHUA = 18;
/** Khung tối thiểu, kẻo lúc còn là hạt thẻ mỏng như một vạch kẻ. */
const KHUNG_TOI_THIEU = 84;

export function CayCuaBan({
  daTuoi,
  conLai,
  tuoi,
}: {
  /** Số năng lượng đã tưới vào cây. Đây là thứ quyết định cây lớn tới đâu. */
  daTuoi: number;
  /** Năng lượng còn trong tay, chưa tưới. */
  conLai: number;
  tuoi: () => void;
}) {
  const nay = giaiDoanCay(daTuoi);
  const sau = giaiDoanSau(daTuoi);
  const tien = tienToiGiaiDoanSau(daTuoi);
  const duTuoi = conLai >= MOT_LAN_TUOI;

  return (
    <Khoi vien>
      <View className="flex-row items-center justify-between">
        <Nhan>Cây của bạn</Nhan>
        <View className="flex-row items-baseline gap-1">
          <Text style={{ fontFamily: CHU.thanDam, fontSize: 18 }} className="text-vang">
            {conLai}
          </Text>
          <Text style={{ fontFamily: CHU.than, fontSize: 11 }} className="text-chu-mo">
            năng lượng
          </Text>
        </View>
      </View>

      <View className="items-center">
        <VeCay muc={nay.muc} />
      </View>

      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
        className="text-center text-chu-chinh">
        {nay.ten}
      </Text>
      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-1 text-center text-sm leading-5 text-chu-phu">
        {nay.loi}
      </Text>

      <View className="mt-4">
        <View style={{ height: 6, borderRadius: 3, backgroundColor: MAU.vien }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              width: `${Math.round(tien * 100)}%`,
              backgroundColor: MAU.vang,
            }}
          />
        </View>
        <Text style={{ fontFamily: CHU.than }} className="mt-2 text-xs text-chu-mo">
          {sau
            ? `Đã tưới ${daTuoi} · còn ${sau.tu - daTuoi} nữa thì thành ${sau.ten.toLowerCase()}`
            : `Đã tưới ${daTuoi} · cây đã lớn hết cỡ`}
        </Text>
      </View>

      <View className="mt-4">
        <Nut
          nhan={duTuoi ? `Tưới cây (${MOT_LAN_TUOI} năng lượng)` : 'Chưa đủ năng lượng'}
          onPress={tuoi}
          tat={!duTuoi}
        />
        {!duTuoi ? (
          <Text
            style={{ fontFamily: CHU.than }}
            className="mt-2 text-center text-xs leading-5 text-chu-mo">
            Làm một mục bên dưới là có thêm năng lượng.
          </Text>
        ) : null}
      </View>
    </Khoi>
  );
}

/**
 * Một bức tranh cây, đặt gốc sát đáy khung.
 *
 * Khung CO LẠI THEO CÂY chứ không cố định. Trước đây khung cao cố định 200 và
 * có một bóng mờ hình cây trưởng thành lấp chỗ trống phía trên; user bỏ bóng
 * mờ, nên để khung nguyên cỡ thì lúc còn là hạt sẽ hở một mảng trống bằng cả
 * bàn tay. Co theo cây thì thẻ cũng lớn dần lên — và đó đúng là thứ đang kể.
 */
function VeCay({ muc }: { muc: number }) {
  const anh = ANH_CAY[Math.min(Math.max(muc, 0), ANH_CAY.length - 1)];
  const cao = Math.max(KHUNG_TOI_THIEU, anh.cao + CHUA);

  return (
    <View style={{ height: cao, alignSelf: 'stretch', justifyContent: 'flex-end' }}>
      <Image
        source={anh.nguon}
        style={{ width: anh.rong, height: anh.cao, alignSelf: 'center', marginBottom: CHUA / 2 }}
        contentFit="contain"
        transition={220}
      />
    </View>
  );
}
