import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CAO_THANH_TAB, CHU, MAU } from '@/constants/giao-dien';

/**
 * Năm thẻ tab. Thứ tự ở đây chính là thứ tự khách — và người duyệt app của
 * Apple — nhìn thấy, nên nó không phải chuyện bày biện.
 *
 * ĐÂY LÀ NHÁNH ANDROID VÀ WEB, không phải iOS. Hai cây mã tách hẳn nhau và
 * phải giữ như vậy: nhánh iOS `phase-thuc-hanh` KHÔNG có một tệp tarot nào.
 * Đem tarot về bên đó là điều 2.5.19 — tính năng ẩn — và mức phạt của nó là
 * khoá tài khoản nhà phát triển. Sửa phần thực hành thì chép TỪ bên này SANG,
 * không bao giờ trộn nhánh.
 *
 * Bên này giữ đủ cả hai: Khám phá (tarot, cung hoàng đạo, thần số) và Thực
 * hành (thở, ngồi yên, viết, vẽ). Thẻ đầu vẫn là CHUYÊN GIA vì bản này không
 * chịu sức ép 4.3(b) như bản iOS.
 *
 * `index` là danh sách chuyên gia chứ không phải một màn riêng tên
 * /chuyen-gia: nhờ vậy "/" mở ra đúng thứ muốn khoe, và mấy chỗ gọi
 * router.replace("/") sau khi đăng nhập vẫn chạy nguyên.
 *
 * `lich-cua-toi` KHÔNG còn trên thanh tab — nó nằm trong mục Cá nhân. Nhưng
 * TUYẾN thì giữ nguyên tên, vì cột `thong_bao.duong_dan` dưới máy chủ đang
 * chứa sẵn "/lich-cua-toi?don=<uuid>" ở những dòng đã sinh từ trước, và mấy
 * dòng đó đóng băng — bản cập nhật không sửa được. Đổi tên tuyến là mọi thông
 * báo cũ rơi vào "Unmatched Route".
 */
export default function TabsLayout() {
  // Android vẽ tràn xuống dưới thanh điều hướng của máy. Đặt height cố định là
  // bỏ qua lề này, nên ba nút điều hướng của hệ thống đè lên đúng chỗ bấm của
  // bốn mục. Phải cộng le.bottom vào cả chiều cao lẫn đệm dưới.
  const le = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: MAU.vang,
        tabBarInactiveTintColor: MAU.chuMo,
        tabBarStyle: {
          backgroundColor: MAU.nenNhat,
          borderTopColor: MAU.vien,
          height: CAO_THANH_TAB + le.bottom,
          paddingBottom: 10 + le.bottom,
          paddingTop: 6,
        },
        // lineHeight đặt thẳng tay: để trống thì mỗi nền một kiểu suy ra từ
        // thước phông, và thước của Be Vietnam Pro cao hơn hẳn mức thường gặp.
        tabBarLabelStyle: { fontFamily: CHU.thanVua, fontSize: 11, lineHeight: 15, marginTop: 2 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chuyên gia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="thuc-hanh"
        options={{
          title: 'Thực hành',
          tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="trung-bay"
        options={{
          title: 'Trưng bày',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="kham-pha"
        options={{
          title: 'Khám phá',
          tabBarIcon: ({ color, size }) => <Ionicons name="planet-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="ca-nhan"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
      {/* Không hiện trên thanh tab, nhưng tuyến vẫn sống: thông báo đã sinh từ
          trước trỏ thẳng vào "/lich-cua-toi?don=<uuid>". Lối vào cho người dùng
          nằm trong mục Cá nhân. */}
      <Tabs.Screen name="lich-cua-toi" options={{ href: null }} />
    </Tabs>
  );
}
