/**
 * Danh sách chuyên gia — tuyến `/chuyen-gia`, một thẻ trên thanh tab.
 *
 * Màn này từng là màn mở đầu, nằm ở tuyến `/`. Lý do là bản iOS: Apple từ chối
 * theo điều 4.3(b) vì app "chủ yếu là tarot và chiêm tinh", nên con người của
 * công ty phải đứng ngay cửa. Bản Android và web không chịu điều khoản đó, nên
 * bên này màn mở đầu trả lại cho lá bài hôm nay và chuyên gia dọn về đây.
 *
 * Tuyến `/` KHÔNG còn trỏ tới màn này. Chỗ nào muốn mở danh sách chuyên gia thì
 * phải gọi `/chuyen-gia`; gọi `/` là về màn mở đầu. Nhánh iOS `phase-thuc-hanh`
 * vẫn giữ màn này ở `/` — đừng đồng bộ thứ tự tab giữa hai nhánh.
 *
 * Mỗi thẻ chỉ hiện thứ cần để chọn: tên, mảng chuyên sâu, điểm sao, giá. Phần
 * dài dòng để trong hồ sơ riêng.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { CotDoc, LuoiPC, OLuoi } from '@/components/luoi-pc';
import { DangTai, ManHinh, Trong } from '@/components/nen';
import { NenChomSao } from '@/components/nen-anh';
import { SaoKemSo } from '@/components/sao';
import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
import { useChuyenGia, type DongChuyenGia } from '@/lib/kho-noi-dung';
import { ThongTin } from '@/app/ho-so-thay';

export function tien(d: number): string {
  return `${d.toLocaleString('vi-VN')}đ`;
}

export default function DanhSachChuyenGia() {
  const { dong, loi, dangTai } = useChuyenGia();
  const mot = dong?.length === 1;

  return (
    <ManHinh
      tieuDe="Chuyên gia của Omora"
      phu={
        mot
          ? 'Đặt một buổi tư vấn riêng. Bạn chọn gói, chọn ngày, rồi viết điều muốn hỏi.'
          : 'Chọn người bạn muốn hỏi, rồi đặt một buổi tư vấn.'
      }
      nenPhu={<NenChomSao />}>
      {dangTai ? (
        <DangTai />
      ) : loi ? (
        <Trong loi={`Chưa tải được danh sách. ${loi}`} />
      ) : !dong || dong.length === 0 ? (
        <Trong loi="Hiện chưa có ai nhận tư vấn. Bạn quay lại sau giúp nhé." />
      ) : dong.length === 1 ? (
        /*
         * MỘT chuyên gia thì bày thẳng hồ sơ, không vẽ ra cái danh sách một món.
         *
         * Một thẻ đơn độc giữa màn trời sao trống trông như app chưa làm xong,
         * mà thật ra sau thẻ đó là một hồ sơ đầy: ảnh, giới thiệu, điểm sao, ba
         * gói có giá. Bày luôn thứ đó ra thì khách bớt được một lần bấm, mà màn
         * đầu tiên cũng nói được app này làm gì.
         *
         * Từ hai người trở lên thì danh sách lại đúng hơn: lúc đó việc của màn này
         * là cho chọn, không phải giới thiệu một người.
         */
        /* Hồ sơ một người là nội dung để ĐỌC: giới thiệu, đánh giá, ba gói.
           Kéo ra 1180 thì mỗi dòng dài cả gang tay, mắt mỏi mà trang vẫn
           trống hai bên. Bó lại thành cột hẹp căn giữa. */
        <CotDoc>
          <ThongTin thay={dong[0]} />
        </CotDoc>
      ) : (
        <LuoiPC cot={3}>
          {dong.map((t) => (
            <OLuoi key={t.ma}>
              <TheChuyenGia thay={t} />
            </OLuoi>
          ))}
        </LuoiPC>
      )}
    </ManHinh>
  );
}

/**
 * Chọn kiểu thẻ theo bề ngang.
 *
 * Điện thoại: thẻ ngang, ảnh tròn 56 bên trái — một cột hẹp thì ảnh to chiếm
 * hết chỗ của chữ. Máy tính: ảnh lớn nằm trên, đúng bản mẫu; ở 3 cột thì mỗi
 * thẻ rộng 377, thừa chỗ cho một tấm ảnh ra hồn.
 */
function TheChuyenGia({ thay }: { thay: DongChuyenGia }) {
  const pc = useManPC();
  return pc ? <TheAnhTren thay={thay} /> : <TheGon thay={thay} />;
}

/**
 * Thẻ của bản máy tính: ảnh 245 cao nằm trên, rồi chuyên môn, tên, mô tả, giá.
 *
 * Số đo lấy từ bản mẫu: bo 15, ảnh cao 245, chuyên môn 10 chữ hoa, tên 30
 * kiểu chữ có chân, mô tả 12, giá 14.
 */
function TheAnhTren({ thay }: { thay: DongChuyenGia }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ho-so-thay', params: { ma: thay.ma } })}
      style={{ borderColor: MAU.vien, borderRadius: 15 }}
      className="overflow-hidden border bg-nen-nhat active:opacity-80">
      {thay.anh ? (
        <Image source={{ uri: thay.anh }} style={{ width: '100%', height: 245 }} contentFit="cover" />
      ) : (
        <View
          style={{ height: 245, backgroundColor: MAU.nen }}
          className="items-center justify-center">
          <Ionicons name="person-outline" size={44} color={MAU.chuMo} />
        </View>
      )}

      <View className="px-5 pb-5 pt-4">
        {thay.chuyen_sau ? (
          <Text
            numberOfLines={1}
            style={{ fontFamily: CHU.thanVua, fontSize: 10, letterSpacing: 1.4, color: MAU.vangSang }}
            className="uppercase">
            {thay.chuyen_sau}
          </Text>
        ) : null}

        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 30, lineHeight: 38 }}
          numberOfLines={1}
          className="mt-1.5 text-chu-chinh">
          {thay.ten}
        </Text>

        <View className="mt-2">
          <SaoKemSo diem={thay.diem_tb} soLuot={thay.so_danh_gia} />
        </View>

        {thay.nam_kinh_nghiem ? (
          <Text
            style={{ fontFamily: CHU.than, fontSize: 12, lineHeight: 19 }}
            className="mt-2 text-chu-phu">
            {`${thay.nam_kinh_nghiem} năm nghề`}
            {thay.so_nguoi_da_xem
              ? ` · ${thay.so_nguoi_da_xem.toLocaleString('vi-VN')} người đã xem`
              : ''}
          </Text>
        ) : null}

        {thay.gia_tu ? (
          <Text
            style={{ fontFamily: CHU.thanVua, fontSize: 14, color: MAU.vangSang }}
            className="mt-3">
            Từ {tien(thay.gia_tu)} một lượt
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function TheGon({ thay }: { thay: DongChuyenGia }) {
  const phu = [
    thay.nam_kinh_nghiem ? `${thay.nam_kinh_nghiem} năm nghề` : null,
    thay.so_nguoi_da_xem
      ? `${thay.so_nguoi_da_xem.toLocaleString('vi-VN')} người đã xem`
      : null,
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/ho-so-thay', params: { ma: thay.ma } })}
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center gap-4 rounded-2xl border bg-nen-nhat px-4 py-4 active:opacity-75">
      {thay.anh ? (
        <Image
          source={{ uri: thay.anh }}
          style={{ width: 56, height: 56, borderRadius: 28 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ borderColor: MAU.vien }}
          className="h-14 w-14 items-center justify-center rounded-full border bg-nen">
          <Ionicons name="person-outline" size={24} color={MAU.chuMo} />
        </View>
      )}

      <View className="flex-1">
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 20, lineHeight: 26 }}
          className="text-chu-chinh">
          {thay.ten}
        </Text>
        {thay.chuyen_sau ? (
          <Text style={{ fontFamily: CHU.thanVua }} className="mt-0.5 text-xs text-vang">
            {thay.chuyen_sau}
          </Text>
        ) : null}

        <View className="mt-1.5">
          <SaoKemSo diem={thay.diem_tb} soLuot={thay.so_danh_gia} />
        </View>

        {phu.length ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-1 text-xs text-chu-mo">
            {phu.join(' · ')}
          </Text>
        ) : null}
        {thay.gia_tu ? (
          <Text style={{ fontFamily: CHU.thanVua }} className="mt-1 text-xs text-chu-phu">
            Từ {tien(thay.gia_tu)} một lượt
          </Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color={MAU.chuMo} />
    </Pressable>
  );
}
