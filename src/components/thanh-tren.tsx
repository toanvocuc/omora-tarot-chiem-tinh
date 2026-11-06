/**
 * Thanh điều hướng trên cùng, CHỈ cho bản web trên máy tính.
 *
 * Thanh tab dưới đáy là lối đi của điện thoại: ngón cái với tới được, và màn
 * cao hơn rộng nên một dải ngang dưới chân không lấy mất chỗ nào. Trên máy
 * tính thì ngược hẳn — chuột đang ở giữa màn, màn rộng hơn cao, và một dải
 * điều hướng dán dưới đáy cửa sổ 1600px trông như thanh tác vụ của hệ điều
 * hành chứ không như một trang web.
 *
 * Nên đây KHÔNG phải thanh tab co giãn, mà là một thứ khác hẳn thay chỗ nó.
 * Dưới ngưỡng `NGUONG_PC` thanh này không được dựng, và thanh tab dưới chạy
 * nguyên như cũ — web trên điện thoại cùng hai bản app không đổi gì hết.
 *
 * Thứ tự mục giữ ĐÚNG thứ tự thanh tab dưới: Khám phá, Thực hành, Chuyên gia,
 * Shop, Cá nhân. Lệch một chỗ là cùng một app mà hai nền tảng dạy người dùng
 * hai thói quen khác nhau.
 */

import Ionicons from '@expo/vector-icons/Ionicons';
import { router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Chuong } from '@/components/chuong';
import { LogoDau } from '@/components/logo';
import { CAO_THANH_TREN, CHU, MAU } from '@/constants/giao-dien';

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

  return (
    <View
      style={{
        height: CAO_THANH_TREN,
        backgroundColor: MAU.nenDen,
        borderBottomColor: MAU.vien,
        borderBottomWidth: 1,
      }}
      className="w-full flex-row items-center px-8">
      <Pressable
        onPress={() => router.navigate('/')}
        accessibilityRole="link"
        accessibilityLabel="Về trang Khám phá"
        className="mr-10 flex-row items-center active:opacity-70">
        <LogoDau rong={30} />
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 22, letterSpacing: 3, color: MAU.vangSang }}
          className="ml-2.5">
          OMORA
        </Text>
      </Pressable>

      <View className="flex-1 flex-row items-center">
        {MUC.map((m) => (
          <Muc key={m.duong} {...m} mo={dangMo(duongHienTai, m.duong)} />
        ))}
      </View>

      {/* Chuông ở đây chứ không thả nổi giữa trang: xem `NutTren` trong
          `components/chuong`. Hộp thông báo vẫn do chính `Chuong` dựng, nên
          hai nền tảng dùng chung một danh sách và một luồng đánh dấu đã đọc. */}
      <Chuong tren />
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
      className="mr-1 flex-row items-center px-4 active:opacity-70">
      <Ionicons name={icon as never} size={17} color={mo ? MAU.vang : MAU.chuPhu} />
      <Text
        style={{ fontFamily: mo ? CHU.thanDam : CHU.thanVua, color: mo ? MAU.vang : MAU.chuPhu }}
        className="ml-2 text-sm">
        {ten}
      </Text>
    </Pressable>
  );
}
