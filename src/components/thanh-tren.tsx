/**
 * Thanh điều hướng trên cùng, CHỈ cho bản web trên máy tính.
 *
 * Thanh tab dưới đáy là lối đi của điện thoại: ngón cái với tới được, và màn
 * cao hơn rộng nên một dải ngang dưới chân không lấy mất chỗ nào. Trên máy
 * tính thì ngược hẳn — chuột đang ở giữa màn, màn rộng hơn cao, và một dải
 * điều hướng dán dưới đáy cửa sổ 1920px trông như thanh tác vụ của hệ điều
 * hành chứ không như một trang web.
 *
 * Nên đây KHÔNG phải thanh tab co giãn, mà là một thứ khác hẳn thay chỗ nó.
 * Dưới ngưỡng `NGUONG_PC` thanh này không được dựng, và thanh tab dưới chạy
 * nguyên như cũ — web trên điện thoại và hai bản app không đổi gì hết.
 *
 * Thanh TRẢI HẾT cửa sổ, chỉ phần lòng trong mới bó lại 1512 — đo từ bản mẫu.
 * Bó cả thanh lại thì nó thành một cái hộp trôi giữa trang, không ra thanh.
 *
 * Thứ tự mục giữ ĐÚNG thứ tự thanh tab dưới: Khám phá, Thực hành, Chuyên gia,
 * Shop, Cá nhân. Lệch một chỗ là cùng một app mà hai nền tảng dạy người dùng
 * hai thói quen khác nhau.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { Chuong } from '@/components/chuong';
import { LogoDau } from '@/components/logo';
import { CAO_THANH_TREN, CHU, MAU } from '@/constants/giao-dien';
import { RONG_THANH } from '@/constants/khung-web';

const MUC = [
  { duong: '/', ten: 'Khám phá', icon: 'planet-outline' },
  { duong: '/thuc-hanh', ten: 'Thực hành', icon: 'leaf-outline' },
  { duong: '/chuyen-gia', ten: 'Chuyên gia', icon: 'people-outline' },
  { duong: '/trung-bay', ten: 'Shop', icon: 'storefront-outline' },
  { duong: '/ca-nhan', ten: 'Cá nhân', icon: 'person-outline' },
] as const;

/**
 * Mục nào đang mở.
 *
 * Khám phá phải so BẰNG chứ không so đầu chuỗi: tuyến của nó là "/", mà mọi
 * tuyến khác cũng bắt đầu bằng "/" — so đầu chuỗi là cả năm mục cùng sáng.
 */
function dangMo(duongHienTai: string, duong: string): boolean {
  return duong === '/' ? duongHienTai === '/' : duongHienTai.startsWith(duong);
}

export function ThanhTren() {
  const duongHienTai = usePathname();
  const { width } = useWindowDimensions();
  // Đệm hai bên lòng thanh, đúng `clamp(26px, 4.3vw, 72px)` của bản mẫu.
  const dem = Math.round(Math.min(72, Math.max(26, width * 0.043)));

  return (
    <View
      style={{
        backgroundColor: MAU.nen,
        borderBottomColor: MAU.vien,
        borderBottomWidth: 1,
      }}
      className="w-full">
      <View
        style={{
          height: CAO_THANH_TREN,
          width: '100%',
          maxWidth: RONG_THANH,
          alignSelf: 'center',
          paddingHorizontal: dem,
        }}
        className="flex-row items-center">
        <Pressable
          onPress={() => router.navigate('/')}
          accessibilityRole="link"
          accessibilityLabel="Về trang Khám phá"
          className="flex-row items-center active:opacity-70">
          <LogoDau rong={34} />
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 28, letterSpacing: 4, color: MAU.vangSang }}
            className="ml-3">
            OMORA
          </Text>
        </Pressable>

        {/* Năm mục nằm GIỮA thanh chứ không dính vào logo: bản mẫu xếp ba cột
            logo — menu — nút, và menu ở cột giữa. */}
        <View className="flex-1 flex-row items-center justify-center">
          {MUC.map((m) => (
            <Muc key={m.duong} {...m} mo={dangMo(duongHienTai, m.duong)} />
          ))}
        </View>

        {/* Chuông ở đây chứ không thả nổi giữa trang: xem `NutTren` trong
            `components/chuong`. Hộp thông báo vẫn do chính `Chuong` dựng, nên
            hai nền tảng dùng chung một danh sách và một luồng đánh dấu đã đọc. */}
        <Chuong tren />
      </View>
    </View>
  );
}

function Muc({
  duong,
  ten,
  icon,
  mo,
}: {
  duong: (typeof MUC)[number]['duong'];
  ten: string;
  icon: string;
  mo: boolean;
}) {
  return (
    <Pressable
      onPress={() => router.navigate(duong)}
      accessibilityRole="link"
      accessibilityState={{ selected: mo }}
      style={{
        // Gạch chân thay cho nền sáng: năm mục mà mục nào cũng có khối nền thì
        // thanh trông như năm cái nút, mất cảm giác đây là một dải điều hướng.
        borderBottomColor: mo ? MAU.vang : 'transparent',
        borderBottomWidth: 2,
        height: CAO_THANH_TREN,
      }}
      className="flex-row items-center px-5 active:opacity-70">
      <Ionicons name={icon as never} size={18} color={mo ? MAU.vang : MAU.chuPhu} />
      <Text
        style={{
          fontFamily: mo ? CHU.thanDam : CHU.thanVua,
          color: mo ? MAU.vang : MAU.chuPhu,
          fontSize: 15,
        }}
        className="ml-2">
        {ten}
      </Text>
    </Pressable>
  );
}
