/**
 * MÀN MỞ ĐẦU của bản Android và web — mở app ra là lá bài hôm nay.
 *
 * Trước đây màn này là danh sách chuyên gia, vì bản iOS bị Apple từ chối theo
 * điều 4.3(b) và phải đẩy con người lên trước tarot. Bản Android và web không
 * chịu điều khoản đó, nên thứ tự ở đây đi theo cái người dùng mở app để xem.
 * Danh sách chuyên gia dọn sang tuyến riêng `/chuyen-gia`, vẫn là một thẻ tab.
 *
 * ĐỪNG mang thứ tự này về nhánh iOS `phase-thuc-hanh`. Hai cây mã tách hẳn
 * nhau: bên đó không có một tệp tarot nào, và đem tarot về là điều 2.5.19 —
 * tính năng ẩn — với mức phạt là khoá tài khoản nhà phát triển.
 *
 * Lá bài không cần ngày sinh, chỉ cần mã người dùng, nên người mới chưa điền
 * hồ sơ vẫn thấy ngay một thứ xem được. Phần cung hoàng đạo và thần số học
 * phía dưới mới cần ngày sinh, và thiếu thì chỉ phần đó nhường chỗ cho một lời
 * mời điền — chứ không phải cả màn trắng như bản cũ.
 */

import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { LaBaiHomNay, ngayChuHomNay } from '@/components/la-bai-hom-nay';
import { LuuYThamKhao, ManHinh, Nhan, VanNgan } from '@/components/nen';
import { NenKhungVan, SAU_HOA_VAN } from '@/components/nen-anh';
import { CHU, MAU } from '@/constants/giao-dien';
import { napTuHoSo } from '@/lib/ban-nhap';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { soChuDao } from '@/lib/numerology';
import { cungTheoNgay, timCung, type MaCung } from '@/lib/zodiac';

export default function MoDau() {
  const { hoSo } = useHoSo();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const ma = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cung = ma ? timCung(ma) : null;
  const so = ns ? soChuDao(ns.ngay, ns.thang, ns.nam) : null;

  return (
    <ManHinh
      tieuDe="Lá bài hôm nay"
      phu={ngayChuHomNay()}
      nenPhu={<NenKhungVan />}
      sauHoaVan={SAU_HOA_VAN.van}>
      {/* Khối mời đặt tư vấn tắt ở đây: danh sách dưới đã có thẻ "Hỏi chuyên
          gia", bật lên là nhắc hai lần trong một màn. */}
      <LaBaiHomNay manHinh="mo-dau" />

      <VanNgan />

      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 28, lineHeight: 34 }}
        className="mt-2 text-chu-chinh">
        Khám phá
      </Text>
      <Text
        style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 22 }}
        className="mb-7 mt-1.5 text-chu-phu">
        Tarot, chiêm tinh phương Tây và thần số học.
      </Text>

      {ma && cung ? <HuyHieu ma={ma} ten={cung.ten} /> : null}

      <View className="gap-4">
        <The
          nhan="Tarot"
          ten="Rút bài"
          mo="Một lá cho câu hỏi nhanh, hoặc ba lá cho quá khứ hiện tại tương lai"
          onPress={() => router.push('/rut-bai')}
        />

        {/* Không nhắc lại tên cung ở đây: huy hiệu ngay phía trên đã nói rồi,
            đọc liền hai lần nghe như máy lặp. */}
        <The
          nhan="Cung hoàng đạo"
          ten="Tử vi và tính cách"
          mo={`Hôm nay, tuần này, và ${cung ? cung.ten : 'cung của bạn'} vốn là người thế nào`}
          onPress={() => router.push('/cung')}
        />
        <The
          nhan="Độ hợp"
          ten="Bạn và người ấy"
          mo="So hai cung hoàng đạo với nhau"
          onPress={() => router.push('/cung/do-hop')}
        />
        <The
          nhan="Thần số học"
          ten={so ? `Số chủ đạo ${so}` : 'Số chủ đạo và số vận mệnh'}
          mo="Số chủ đạo từ ngày sinh và số vận mệnh từ họ tên"
          onPress={() => router.push('/than-so')}
        />
        <The
          nhan="Hỏi chuyên gia"
          ten="Đặt một buổi tư vấn"
          mo="Khi muốn hỏi một câu cụ thể mà app chưa trả lời được"
          onPress={() => router.push('/chuyen-gia')}
        />

        {/* Thiếu ngày sinh thì hai mục trên chạy rỗng. Nói thẳng chỗ điền, đặt
            cuối danh sách để nó là lời mời chứ không phải cửa chặn.

            `napTuHoSo` phải gọi TRƯỚC khi vào luồng nhập, giống mục Cá nhân:
            bước cuối ghi cả hồ sơ một lượt, nên không nạp sẵn là mấy mục không
            đi qua bị ghi đè bằng giá trị rỗng — mất luôn cái tên đã có. */}
        {!ns ? (
          <The
            nhan="Còn thiếu"
            ten="Thêm ngày sinh"
            mo="Có ngày sinh mới tính được cung hoàng đạo và số chủ đạo của bạn"
            onPress={() => {
              napTuHoSo(hoSo);
              router.push('/nhap-ho-so/ten');
            }}
          />
        ) : null}
      </View>

      <LuuYThamKhao />
    </ManHinh>
  );
}

/**
 * Huy hiệu cung của khách, đặt làm vật thể lớn mở đầu phần Khám phá.
 *
 * Ảnh vòng hoàng đạo CHỈ làm vân nền chứ không làm vai chính: đo ra độ sáng
 * trung bình của nó là 27 trên 255, chỗ sáng nhất cũng chỉ tới 106 — thu về
 * đường kính 190 thì gần như là một khoanh đen. Ký hiệu cung vẽ bằng nét SVG
 * vàng mới là thứ nhìn ra được, nên nó nằm trên cùng và ăn phần lớn vòng tròn.
 */
function HuyHieu({ ma, ten }: { ma: MaCung; ten: string }) {
  return (
    <View className="mb-8 items-center">
      <View
        style={{ borderColor: MAU.vangMo }}
        className="h-[196px] w-[196px] items-center justify-center overflow-hidden rounded-full border">
        <Image
          source={require('@/assets/nen/vong-hoang-dao.jpg')}
          style={{ position: 'absolute', width: 196, height: 196 }}
          contentFit="cover"
        />
        {/* Vòng trong, để ký hiệu không trôi nổi giữa một mảng vân. */}
        <View
          style={{ borderColor: MAU.vangMo }}
          className="h-[118px] w-[118px] items-center justify-center rounded-full border bg-nen/70">
          <BieuTuongCung ma={ma} co={62} />
        </View>
      </View>
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
        className="mt-4 text-chu-chinh">
        {ten}
      </Text>
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6 }}
        className="mt-1 text-[11px] uppercase text-vang">
        Cung của bạn
      </Text>
    </View>
  );
}

function The({ nhan, ten, mo, onPress }: { nhan: string; ten: string; mo: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
      <View className="flex-1 pr-3">
        <Nhan>{nhan}</Nhan>
        {ten ? <Text style={{ fontFamily: CHU.thanDam }} className="text-lg text-chu-chinh">{ten}</Text> : null}
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">{mo}</Text>
      </View>
      <Text style={{ fontFamily: CHU.than }} className="text-lg text-vang">›</Text>
    </Pressable>
  );
}
