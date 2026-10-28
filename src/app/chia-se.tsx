import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { hoi } from '@/lib/hoi-lai';
import { DangTai, ManHinh, Nut } from '@/components/nen';
import { CAO_ANH, RONG_ANH, TY_LE_XEM, TheChiaSe } from '@/components/the-chia-se';
import { CHU } from '@/constants/giao-dien';
import { useBoBai } from '@/lib/kho-noi-dung';
import { layPhien } from '@/lib/phien-rut';
import { maNguoiDung } from '@/lib/supabase';
import { laHomNay, type LaDaRut } from '@/lib/tarot';

export default function ChiaSe() {
  const phien = layPhien();
  const theRef = useRef<View>(null);
  /**
   * Bản khổ thật, chỉ dựng trên web và nằm ngoài màn.
   *
   * Bản web của `captureRef` chạy bằng html2canvas: nó rasteriz Ở ĐÚNG CỠ CSS
   * của thẻ rồi mới kéo giãn lên khổ yêu cầu. Chụp tấm xem trước (thu 0.3 lần)
   * rồi phóng 3,3 lần là ra ảnh nhoè. Máy thật thì không dính, vì bên đó
   * `captureRef` dựng lại cây giao diện ở đúng khổ đích.
   *
   * Nên trên web dựng thêm một bản 1080×1350 thật, đẩy ra ngoài khung nhìn, và
   * chụp chính nó.
   */
  const theWebRef = useRef<View>(null);
  const [dangLam, setDangLam] = useState<'luu' | 'chia-se' | null>(null);

  // Vào thẳng màn này mà chưa rút lần nào thì lấy lá hôm nay, đỡ thành ngõ cụt.
  const { boBai } = useBoBai();
  const [laDuPhong, setLaDuPhong] = useState<LaDaRut | null>(null);
  useEffect(() => {
    if (phien?.cacLa.length || !boBai?.length) return;
    maNguoiDung().then((ma) => ma && setLaDuPhong(laHomNay(boBai, ma)));
  }, [phien, boBai]);

  const la = phien?.cacLa[0] ?? laDuPhong;

  /**
   * Chụp tấm thẻ thành file ảnh, trả về đường dẫn tạm.
   *
   * Nạp thư viện ngay tại đây chứ không nạp ở đầu file: react-native-view-shot và
   * expo-media-library không có bản cho trình duyệt, nạp sớm là vỡ cả màn khi chạy web.
   */
  async function chupAnh() {
    const { captureRef } = await import('react-native-view-shot');
    return captureRef(theRef, {
      format: 'jpg',
      quality: 0.92,
      // Vẽ ở cỡ nhỏ cho vừa màn hình, nhưng chụp ra đúng khổ 1080x1350.
      width: RONG_ANH,
      height: CAO_ANH,
    });
  }

  async function luuVaoMay() {
    setDangLam('luu');
    try {
      const MediaLibrary = await import('expo-media-library');
      // true = chỉ xin quyền GHI. App chỉ lưu ảnh ra, không bao giờ đọc ảnh của
      // khách, nên không đụng tới READ_MEDIA_IMAGES. Từ Android 13 trở lên thì
      // lưu vào thư viện còn chẳng cần quyền nào, lời gọi này trả về luôn.
      const quyen = await MediaLibrary.requestPermissionsAsync(true);
      if (!quyen.granted) {
        hoi('Chưa có quyền', 'Cho phép app lưu ảnh trong phần cài đặt của máy.');
        return;
      }
      const duong = await chupAnh();
      await MediaLibrary.saveToLibraryAsync(duong);
      hoi('Đã lưu', 'Ảnh nằm trong thư viện ảnh của máy.');
    } catch (e) {
      hoi('Chưa lưu được', e instanceof Error ? e.message : 'Thử lại giúp tôi.');
    } finally {
      setDangLam(null);
    }
  }

  /**
   * Tải ảnh về máy trên trình duyệt.
   *
   * `react-native-view-shot` 5.1.0 CÓ bản web (`RNViewShot.web.ts`, chạy bằng
   * html2canvas vốn đã nằm trong cây phụ thuộc của nó) — mã cũ chặn web là dựa
   * vào bản thư viện đời trước.
   *
   * Phải khai `result: 'data-uri'`: mặc định là `tmpfile`, mà trình duyệt
   * không có tệp tạm nên thư viện chỉ cảnh báo rồi trả về data-uri.
   */
  async function taiVeTrinhDuyet() {
    // `la` chỉ chắc chắn có ở nhánh vẽ phía dưới, còn hàm này khai trước đó.
    if (!la) return;
    setDangLam('luu');
    try {
      const { captureRef } = await import('react-native-view-shot');
      const uri = await captureRef(theWebRef, { format: 'jpg', quality: 0.92, result: 'data-uri' });
      const ten = la.la.tenEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const a = document.createElement('a');
      a.href = uri;
      a.download = `omora-${ten}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      hoi('Chưa tải được', e instanceof Error ? e.message : 'Thử lại giúp tôi.');
    } finally {
      setDangLam(null);
    }
  }

  async function chiaSe() {
    setDangLam('chia-se');
    try {
      const Sharing = await import('expo-sharing');
      if (!(await Sharing.isAvailableAsync())) {
        hoi('Máy không chia sẻ được', 'Dùng nút lưu vào máy rồi đăng thủ công.');
        return;
      }
      const duong = await chupAnh();
      await Sharing.shareAsync(duong, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Chia sẻ lá bài',
      });
    } catch (e) {
      hoi('Chưa chia sẻ được', e instanceof Error ? e.message : 'Thử lại giúp tôi.');
    } finally {
      setDangLam(null);
    }
  }

  if (!la) {
    return (
      <ManHinh quayLai tieuDe="Chia sẻ">
        <DangTai />
      </ManHinh>
    );
  }

  const laWeb = Platform.OS === 'web';

  return (
    <ManHinh quayLai tieuDe="Chia sẻ" phu="Xem trước ảnh sẽ đăng.">
      <View className="items-center">
        <TheChiaSe ref={theRef} daRut={la} tyLe={TY_LE_XEM} />
      </View>

      {/* Bản khổ thật để chụp, đẩy hẳn ra ngoài khung nhìn. Dùng left âm chứ
          không dùng display:none — thứ không được bày ra thì không có kích
          thước, và html2canvas chụp ra tấm rỗng. */}
      {laWeb ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: -99999, top: 0, opacity: 0 }}>
          <TheChiaSe ref={theWebRef} daRut={la} tyLe={1} />
        </View>
      ) : null}

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-4 text-center text-xs leading-5 text-chu-mo">
        Ảnh xuất ra khổ {RONG_ANH} × {CAO_ANH}, vừa khung đứng của Facebook và Instagram
      </Text>

      {laWeb ? (
        <View className="mt-7">
          <Nut nhan="Tải ảnh về máy" dangChay={dangLam === 'luu'} onPress={taiVeTrinhDuyet} />
        </View>
      ) : (
        <View className="mt-7 gap-3">
          <Nut nhan="Chia sẻ" dangChay={dangLam === 'chia-se'} onPress={chiaSe} />
          <Nut nhan="Lưu vào máy" kieu="vien" dangChay={dangLam === 'luu'} onPress={luuVaoMay} />
        </View>
      )}
    </ManHinh>
  );
}
