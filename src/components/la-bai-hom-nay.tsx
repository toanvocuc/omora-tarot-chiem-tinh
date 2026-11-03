/**
 * Lá bài hôm nay, tách khỏi màn để hai chỗ dùng chung được.
 *
 * Hai chỗ đó là MÀN MỞ ĐẦU (tab Khám phá) và tuyến `/hom-nay`. Tuyến `/hom-nay`
 * phải sống tiếp dù màn mở đầu đã bày sẵn lá bài: thông báo đẩy mang theo
 * `data.man = '/hom-nay'`, và thông báo đã gửi ra máy khách thì không sửa lại
 * được nữa. Xoá tuyến là bấm thông báo rơi vào "Unmatched Route".
 *
 * Lá bài không cần ngày sinh — chỉ cần mã người dùng. Nhờ vậy nó bày được ở
 * màn mở đầu cho cả người mới chưa điền hồ sơ, khác với huy hiệu cung hoàng
 * đạo nằm dưới.
 */

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { LaBai } from '@/components/la-bai';
import { ChuThan, DangTai, Khoi, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU, TY_LE_LA_BAI } from '@/constants/giao-dien';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useBoBai } from '@/lib/kho-noi-dung';
import { datPhien } from '@/lib/phien-rut';
import { ghiSuKien } from '@/lib/su-kien';
import { maNguoiDung } from '@/lib/supabase';
import { laHomNay, type LaDaRut } from '@/lib/tarot';
import { cungTheoNgay, timCung } from '@/lib/zodiac';

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

/**
 * Cỡ dải thu gọn.
 *
 * Chiều cao tính ra từ lá bài chứ không gõ sẵn một con số: lá giữ đúng tỷ lệ
 * 57x100 của bộ Rider-Waite, nên đổi bề rộng là chiều cao tự theo. Gõ cứng thì
 * sửa một chỗ quên chỗ kia, lá lòi ra ngoài hoặc dải thừa một dải trống.
 *
 * 48 là cỡ nhỏ nhất mà mặt lá còn nhận ra được hình. Cộng đệm trên dưới ra
 * đúng 104 — vừa trần của khoảng 90–104 đã chốt.
 */
const RONG_LA = 48;
const DEM = 10;
const CAO_GON = Math.round(RONG_LA / TY_LE_LA_BAI) + DEM * 2;

/** "Thứ ba, ngày 28 tháng 10" — dùng làm dòng phụ dưới tiêu đề. */
export function ngayChuHomNay(): string {
  const d = new Date();
  return `${THU[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth() + 1}`;
}

export function LaBaiHomNay({
  manHinh,
  hoiChuyenGia = false,
}: {
  /** Tên màn ghi vào sự kiện, để hai chỗ gọi phân biệt được trong số liệu. */
  manHinh: string;
  /** Khối mời đặt tư vấn. Màn mở đầu đã có thẻ riêng nên tắt, kẻo nhắc hai lần. */
  hoiChuyenGia?: boolean;
}) {
  const { boBai, loi, dangTai } = useBoBai();
  const { hoSo } = useHoSo();
  const [la, setLa] = useState<LaDaRut | null>(null);
  const [khongDocDuoc, setKhongDocDuoc] = useState(false);

  /**
   * Lá bài của ngày tính từ mã người dùng, nên phải hỏi mã trước.
   *
   * `maNguoiDung` gọi mạng và trả null khi hỏi không xong, chứ không ném lỗi.
   * Bỏ qua nhánh đó thì chỗ này hiện đúng tiêu đề với ngày tháng rồi hết —
   * không vòng xoay, không báo lỗi, chỉ một mảng trống.
   */
  const timLa = useCallback(() => {
    if (!boBai?.length) return;
    maNguoiDung()
      .then((ma) => {
        if (!ma) {
          setKhongDocDuoc(true);
          return;
        }
        setLa(laHomNay(boBai, ma));
        ghiSuKien({ loai: 'xem_ket_qua', manHinh });
      })
      .catch((e) => {
        console.warn('[la-bai-hom-nay]', e);
        setKhongDocDuoc(true);
      });
  }, [boBai, manHinh]);

  useEffect(timLa, [timLa]);

  // Nút thử lại: gỡ cờ báo lỗi rồi hỏi lại. Gỡ cờ nằm ở đây chứ không nằm trong
  // timLa, vì timLa chạy thẳng trong hiệu ứng và đặt trạng thái ngay trong thân
  // hiệu ứng là kéo thêm một vòng vẽ thừa — eslint bắt đúng chỗ này.
  const thuLai = useCallback(() => {
    setKhongDocDuoc(false);
    timLa();
  }, [timLa]);

  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const maCung = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = maCung ? timCung(maCung) : null;

  return (
    <View>
      {dangTai ? <DangTai /> : null}
      {loi ? <Trong loi={`Chưa tải được nội dung. ${loi}`} /> : null}
      {boBai?.length === 0 ? (
        <Trong loi="Kho lá bài đang trống. Nạp data/tarot_78_la.csv vào bảng la_bai rồi mở lại." />
      ) : null}

      {khongDocDuoc ? (
        <View>
          <Trong loi="Chưa đọc được tài khoản của bạn nên chưa biết lá nào là của hôm nay. Kiểm tra mạng giúp tôi." />
          <View className="mt-5">
            <Nut nhan="Thử lại" kieu="vien" onPress={thuLai} />
          </View>
        </View>
      ) : null}

      {la ? (
        <View>
          <View className="items-center">
            <LaBai daRut={la} rong={210} />
          </View>

          <View className="mt-6">
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 36, lineHeight: 42 }}
              className="text-center text-chu-chinh">
              {la.la.tenEn}
            </Text>
            <Text
              style={{ fontFamily: CHU.thanDam, letterSpacing: 1.8 }}
              className="mt-2 text-center text-[11px] uppercase text-vang">
              {la.la.tuKhoa}
            </Text>
          </View>

          <VanNgan />

          <Khoi>
            <ChuThan>{la.la.yNghiaXuoi}</ChuThan>
          </Khoi>

          <View className="mt-4">
            <Khoi vien>
              <Nhan>Lời khuyên</Nhan>
              <ChuThan>{la.la.loiKhuyen}</ChuThan>
            </Khoi>
          </View>

          {cung ? (
            <Pressable
              onPress={() => router.push({ pathname: '/cung/chi-tiet', params: { ma: maCung } })}
              style={{ borderColor: MAU.vien }}
              className="mt-4 flex-row items-center justify-between rounded-2xl border bg-nen-nhat p-5 active:opacity-70">
              <View className="flex-1 pr-3">
                <Nhan>Cung của bạn</Nhan>
                <Text style={{ fontFamily: CHU.than }} className="text-base text-chu-chinh">
                  {cung.ten} · xem tử vi hôm nay
                </Text>
              </View>
              <Text className="text-lg text-vang">›</Text>
            </Pressable>
          ) : null}

          <View className="mt-5">
            <Nut
              nhan="Lưu ảnh để chia sẻ"
              kieu="vien"
              onPress={() => {
                datPhien([la]);
                router.push('/chia-se');
              }}
            />
          </View>

          {hoiChuyenGia ? (
            <HoiChuyenGia
              manHinh={manHinh}
              loiMoi={`Lá ${la.la.tenEn} hôm nay ứng vào chuyện gì của bạn? Nhắn cho chuyên gia để hỏi cho rõ.`}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

/**
 * Bản THU GỌN của lá bài hôm nay — một dải bấm được, dẫn sang `/hom-nay`.
 *
 * Vì sao có nó: màn Khám phá trước đây bày nguyên khối lá bài đầy đủ ở trên
 * cùng. Đo trên khung 412x915 thì khối đó chiếm 0→1162px, và thẻ Khám phá đầu
 * tiên rơi xuống y=1630 trong vùng cuộn cao 845px — khách phải cuộn gần hai
 * màn hình mới thấy mục nào để bấm. Dải này còn khoảng 134px.
 *
 * KHÔNG ghi sự kiện `xem_ket_qua` ở đây. Khách mới thấy cái tên lá, chưa đọc
 * ý nghĩa hay lời khuyên. Ghi ở cả hai chỗ là thổi phồng số liệu; bản đầy đủ
 * bên `/hom-nay` tự ghi lấy khi khách bấm sang.
 *
 * Phần nạp dữ liệu ở đây cố ý viết riêng và ngắn hơn bản đầy đủ: dải này
 * không có khung báo lỗi, không có nút thử lại. Hỏng thì nó biến mất chứ
 * không bày một dòng chết ở đầu màn.
 */
export function LaBaiHomNayGon() {
  const { boBai, dangTai } = useBoBai();
  const [la, setLa] = useState<LaDaRut | null>(null);

  useEffect(() => {
    if (!boBai?.length) return;
    let con = true;
    maNguoiDung()
      .then((ma) => {
        if (con && ma) setLa(laHomNay(boBai, ma));
      })
      .catch(() => {});
    return () => {
      con = false;
    };
  }, [boBai]);

  // Giữ chỗ trong lúc còn đang tải, để mấy thẻ bên dưới không nhảy một cái khi
  // lá hiện ra. Tải hỏng thì trả về rỗng hẳn — thà thiếu còn hơn một dải chết.
  if (!la) return dangTai ? <View style={{ height: CAO_GON }} /> : null;

  return (
    <Pressable
      onPress={() => router.push('/hom-nay')}
      style={{
        height: CAO_GON,
        paddingHorizontal: DEM + 2,
        // Nền sáng hơn nền thẻ thường và viền đậm hơn: đây là nút bấm duy
        // nhất nằm trên nền đen trống, không có gì quanh để tựa. Để nguyên
        // nenNhat + viền 30% thì user nhìn không ra là có viền.
        backgroundColor: MAU.nenNhatHon,
        borderColor: MAU.vangVua,
      }}
      className="flex-row items-center rounded-2xl border active:opacity-60">
      <LaBai daRut={la} rong={RONG_LA} hienNguoc={false} bongNhe />

      <View style={{ marginLeft: 12 }} className="flex-1">
        {/* Nhãn mục KHÔNG dùng `Nhan` dùng chung: nó mang sẵn lề dưới 8, mà ở
            đây ba dòng phải xếp sát nhau mới vừa 104. */}
        <Text
          style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
          className="text-[10px] uppercase text-vang">
          Lá bài hôm nay
        </Text>
        <Text
          style={{ fontFamily: CHU.thanDam, fontSize: 17, lineHeight: 22 }}
          numberOfLines={1}
          className="mt-1 text-chu-chinh">
          {la.la.tenEn}
          {la.nguoc ? ' (ngược)' : ''}
        </Text>
        {/* Một dòng, cắt bằng ba chấm. Hai dòng là dải cao thêm 16 và vỡ mốc. */}
        <Text
          style={{ fontFamily: CHU.than, fontSize: 12, lineHeight: 17 }}
          numberOfLines={1}
          className="mt-0.5 text-chu-phu">
          {la.la.tuKhoa}
        </Text>
      </View>

      <Text style={{ fontFamily: CHU.than }} className="ml-2 text-base text-vang">
        ›
      </Text>
    </Pressable>
  );
}
