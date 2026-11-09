import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';

import { Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { hoanTatOAuthWeb } from '@/lib/dang-nhap';
import { datCoHoSo, docHoSo } from '@/lib/ho-so';

/**
 * Chỗ hứng địa chỉ trình duyệt trả về sau một vòng đăng nhập.
 *
 * Màn này gần như không ai thấy — nó chỉ chớp qua. Nhưng phải có, và phải cư xử
 * đúng, vì đã sập ba lần ở đây:
 *
 *   Lần 1 — KHÔNG có màn này: hệ điều hành đẩy đường dẫn vào app, expo-router
 *   không biết nó là gì nên hiện trang "không tìm thấy". Khách đăng nhập xong
 *   thấy màn lỗi, tưởng hỏng.
 *
 *   Lần 2 — có màn này nhưng đá thẳng về màn chủ: khách đang ở mục Cá nhân, bấm
 *   đăng nhập, xong bị quăng ra trang Hôm nay. Mất dấu chỗ mình đang đứng.
 *
 *   Lần 3 (2026-11-09, khách báo từ Brave trên điện thoại) — trên WEB màn này
 *   chẳng làm gì cả, vì nó tin rằng `lib/dang-nhap.ts` đang nghe song song và
 *   sẽ tự đổi mã. Điều đó chỉ đúng khi vòng đăng nhập chạy trong một cửa sổ
 *   bật lên, tức khi tiến trình gọi còn sống. Trên trình duyệt điện thoại thì
 *   không còn ai sống cả — xem ghi chú dài ở `chayOAuth`.
 *
 * ──────────────────────────────────────────────────────────── HAI ĐƯỜNG ĐI
 *
 * MÁY THẬT: `lib/dang-nhap.ts` vẫn đang đợi trong cùng một tiến trình và tự lo
 * hết. Màn này chỉ việc lùi về đúng chỗ vừa rời đi.
 *
 * WEB: cả trang đã bị thay, không còn ai đợi. Màn này phải tự đổi mã lấy thẻ,
 * rồi tự đưa khách đi tiếp — đúng những bước mà `app/dang-nhap.tsx` làm sau
 * khi `dangNhapGoogle()` trả về.
 */
export default function DangNhapXong() {
  const [loi, datLoi] = useState<string | null>(null);

  useEffect(() => {
    // ───────────────────────────────────────────── máy thật: y như cũ
    if (Platform.OS !== 'web') {
      // Chờ một nhịp cho chồng màn hình ổn định rồi mới lùi. Lùi ngay trong lúc
      // nó đang dựng thì lệnh trôi mất.
      const hen = setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/');
      }, 60);
      return () => clearTimeout(hen);
    }

    // ───────────────────────────────────────────── web: tự đóng nốt vòng
    let huy = false;
    void (async () => {
      const kq = await hoanTatOAuthWeb();
      if (huy) return;

      if (kq.kieu === 'loi') {
        datLoi(kq.loi);
        return;
      }

      // Khách tự bấm huỷ ở trang của Google thì đưa về đúng chỗ cũ, đừng doạ
      // bằng chữ đỏ.
      if (kq.kieu === 'huy') {
        router.replace(duongHopLe(kq.duong));
        return;
      }

      // Không có mã nào: ai đó gõ thẳng địa chỉ này, hoặc bấm nút lùi về đây.
      if (kq.kieu === 'khong-phai') {
        router.replace('/');
        return;
      }

      // Gắn thêm tài khoản vào hồ sơ đang dùng: hồ sơ không đổi, nên trả khách
      // về đúng màn họ đang mở.
      if (kq.gan) {
        router.replace(duongHopLe(kq.duong));
        return;
      }

      // Đăng nhập mới. Khách cũ đăng nhập lại ở máy mới thì hồ sơ đã nằm sẵn
      // trên máy chủ — không đọc lại ở đây là bắt họ nhập lại năm bước và ghi
      // đè lên hồ sơ cũ.
      try {
        const h = await docHoSo();
        if (huy) return;
        const coHoSo = Boolean(h?.ngay_sinh);
        datCoHoSo(coHoSo);
        router.replace(coHoSo ? '/' : '/nhap-ho-so');
      } catch {
        // Đọc hồ sơ hỏng thì vẫn đã đăng nhập xong. Đưa về trang chủ còn hơn
        // bỏ khách đứng ở màn chờ.
        if (!huy) router.replace('/');
      }
    })();

    return () => {
      huy = true;
    };
  }, []);

  if (loi) {
    return (
      <View className="flex-1 items-center justify-center gap-5 bg-nen px-7">
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 24, lineHeight: 32 }}
          className="text-center text-chu-chinh">
          Chưa đăng nhập được
        </Text>
        <Text
          style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 24 }}
          className="text-center text-chu-phu">
          {loi}
        </Text>
        <View className="w-full max-w-[320px]">
          <Nut nhan="Thử lại" onPress={() => router.replace('/dang-nhap')} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-nen">
      <ActivityIndicator color={MAU.vang} />
    </View>
  );
}

/**
 * Chỉ nhận đường dẫn nội bộ.
 *
 * Chỗ đứng cũ đọc từ `sessionStorage`, mà ô nhớ đó thì mã nào chạy trên cùng
 * tên miền cũng ghi được. Nhận bừa là mở đường cho một lượt chuyển hướng sang
 * tên miền lạ ngay sau khi khách vừa đăng nhập xong — đúng lúc họ tin tưởng
 * nhất. Phải có một dấu gạch chéo đầu, và không được có dấu thứ hai.
 */
function duongHopLe(duong: string): Href {
  if (!duong.startsWith('/') || duong.startsWith('//')) return '/';
  // Ép kiểu vì expo-router dùng tuyến có kiểu chặt, còn đây là chuỗi đọc lúc
  // chạy. Đã chặn ở trên nên nó chỉ có thể là một đường dẫn nội bộ.
  return duong as Href;
}
