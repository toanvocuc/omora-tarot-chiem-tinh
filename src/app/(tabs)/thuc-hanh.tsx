/**
 * Thực hành — tab thay chỗ Khám phá cũ.
 *
 * ────────────────────────────────────────────── VÌ SAO BỎ TAROT KHỎI ĐÂY
 *
 * Tab này từng là tarot, cung hoàng đạo, độ hợp và thần số học. Apple từ chối
 * app hai lần theo điều khoản 4.3(b), nơi ghi đích danh *fortune telling* trong
 * danh sách họ không nhận app mới. Thêm chức năng không gỡ được điều đó — họ xét
 * app LÀ cái gì, không xét app CÓ THÊM cái gì.
 *
 * Nên chỗ này giờ là thứ người dùng LÀM chứ không phải thứ app đoán hộ: thở,
 * ngồi thiền, viết, vẽ. Giữ nguyên tệp khách đi tìm sự yên tâm, bỏ phần đoán
 * trước tương lai.
 *
 * Mấy màn tarot vẫn còn nguyên trong mã nguồn cho bản Android và bản web — hai
 * nơi không có điều khoản tương đương. Đây là hai sản phẩm, không phải một app
 * giấu bài.
 *
 * Tab này nay là thẻ thứ hai, sau Khám phá. Bản iOS để nó đứng đầu để đỡ điều
 * 4.3(b); bên này không cần, nên đừng đồng bộ thứ tự tab giữa hai nhánh.
 */

import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BieuDoTuan } from '@/components/bieu-do-tuan';
import { CayCuaBan } from '@/components/cay-cua-ban';
import { Khoi, ManHinh, Nhan } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';
import {
  bayNgayQua,
  buoiTrongNgay,
  cachMayNgay,
  chuoiNgay,
  daLamHomNay,
  docCachNgay,
  loiChaoTheoBuoi,
  mocVuaCham,
  ngayHomNay,
  phutTrongTuan,
  nangLuongConLai,
  tongKetTuan,
  tuoiCay,
  useDaTuoi,
  useThucHanh,
  type BuoiThucHanh,
  type LoaiThucHanh,
} from '@/lib/thuc-hanh';

export default function ThucHanh() {
  const buoi = useThucHanh();
  const daTuoi = useDaTuoi();
  const chuoi = chuoiNgay(buoi);
  const phut = phutTrongTuan(buoi);
  const xong = daLamHomNay(buoi);
  const moc = mocVuaCham(chuoi);
  const chao = loiChaoTheoBuoi(buoiTrongNgay());

  // Chủ nhật mới hiện thẻ nhìn lại, và chỉ khi tuần đó có làm gì.
  const laChuNhat = new Date().getDay() === 0;
  const tuan = tongKetTuan(buoi);

  return (
    <ManHinh
      tieuDe="Thực hành"
      phu={`${chao} ${
        xong ? 'Hôm nay bạn đã dành cho mình một khoảng.' : 'Một khoảng ngắn thôi cũng là đủ.'
      }`}>
      <View className="gap-4">
        {moc ? <TheMoc chuoi={moc} /> : null}

        <CayCuaBan daTuoi={daTuoi} conLai={nangLuongConLai(buoi, daTuoi)} tuoi={() => tuoiCay()} />

        <ChuoiNgay chuoi={chuoi} phut={phut} ngay={bayNgayQua(buoi)} />

        {laChuNhat && tuan.soBuoi > 0 ? <NhinLaiTuan tuan={tuan} /> : null}

        <The
          nhan="5 tới 15 phút"
          ten="Bài thở"
          mo="Tĩnh tâm và thở đều theo nhịp của vòng tròn"
          lanCuoi={lanCuoi(buoi, 'tho')}
          onPress={() => router.push('/thuc-hanh/tho')}
        />
        <The
          nhan="5 tới 30 phút"
          ten="Ngồi thiền"
          mo="Đặt máy xuống, giữ yên trong khoảng bạn chọn"
          lanCuoi={lanCuoi(buoi, 'ngoi-yen')}
          onPress={() => router.push('/thuc-hanh/thien')}
        />
        <The
          nhan="Mỗi ngày một đề"
          ten="Viết"
          mo="Một câu hỏi mở, và trang giấy chỉ riêng bạn"
          lanCuoi={lanCuoi(buoi, 'viet')}
          onPress={() => router.push('/thuc-hanh/viet')}
        />
        <The
          nhan="Vài phút"
          ten="Vẽ và chụp"
          mo="Thả tay vẽ hoặc chụp một tấm, không ai chấm điểm"
          lanCuoi={lanCuoi(buoi, 've')}
          onPress={() => router.push('/thuc-hanh/ve')}
        />
        <The
          nhan="Khi cần một người"
          ten="Đặt một buổi trò chuyện"
          mo="Khi trong lòng có điều cần nói với người khác"
          onPress={() => router.push('/chuyen-gia')}
        />
      </View>
    </ManHinh>
  );
}

function lanCuoi(buoi: BuoiThucHanh[], loai: LoaiThucHanh): string | null {
  return docCachNgay(cachMayNgay(buoi, loai, ngayHomNay()));
}

/**
 * Chuỗi ngày đặt lên đầu màn, kèm bảy cột của tuần.
 *
 * Đây là thứ kéo người ta quay lại, nên nó phải là vật thể đầu tiên đập vào mắt
 * chứ không nằm lẫn dưới danh sách.
 */
function ChuoiNgay({
  chuoi,
  phut,
  ngay,
}: {
  chuoi: number;
  phut: number;
  ngay: { ngay: string; phut: number }[];
}) {
  return (
    <Khoi vang={chuoi > 0}>
      <View className="flex-row items-end justify-between">
        <View>
          <Nhan>Chuỗi ngày</Nhan>
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }}
            className="text-chu-chinh">
            {chuoi === 0 ? 'Chưa bắt đầu' : `${chuoi} ngày`}
          </Text>
        </View>
        <View className="items-end">
          <Nhan>Bảy ngày qua</Nhan>
          <Text style={{ fontFamily: CHU.thanDam, fontSize: 20 }} className="text-chu-chinh">
            {`${phut} phút`}
          </Text>
        </View>
      </View>

      <View className="mt-4 items-center">
        <BieuDoTuan ngay={ngay} />
      </View>

      <Text style={{ fontFamily: CHU.than }} className="mt-3 text-sm leading-5 text-chu-phu">
        {chuoi === 0
          ? 'Chọn một mục bên dưới, chuỗi bắt đầu từ hôm nay.'
          : 'Chuỗi chỉ đứt khi trọn một ngày trôi qua — hôm nay vẫn còn kịp.'}
      </Text>
    </Khoi>
  );
}

/** Chỉ hiện đúng ngày chạm mốc. Báo mấy ngày liền thì mốc mất thiêng. */
function TheMoc({ chuoi }: { chuoi: number }) {
  return (
    <Khoi vien>
      <Nhan>Mốc</Nhan>
      <Text
        style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
        className="text-chu-chinh">
        {`${chuoi} ngày liền`}
      </Text>
      <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">
        Bạn đã giữ được chừng ấy ngày. Không cần làm gì thêm, chỉ ghi nhận thôi.
      </Text>
    </Khoi>
  );
}

function NhinLaiTuan({ tuan }: { tuan: ReturnType<typeof tongKetTuan> }) {
  const dong = [
    { nhan: 'Số ngày tham gia', gia: `${tuan.soNgay} / 7` },
    { nhan: 'Tổng thời gian', gia: `${tuan.phut} phút` },
    ...(tuan.soTrangViet ? [{ nhan: 'Trang đã viết', gia: `${tuan.soTrangViet}` }] : []),
    ...(tuan.soBucVe ? [{ nhan: 'Bức đã vẽ', gia: `${tuan.soBucVe}` }] : []),
  ];
  return (
    <Khoi vien>
      <Nhan>Nhìn lại tuần</Nhan>
      {dong.map((d, i) => (
        <View
          key={d.nhan}
          className={`flex-row items-center justify-between ${i ? 'mt-2' : 'mt-1'}`}>
          <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
            {d.nhan}
          </Text>
          <Text style={{ fontFamily: CHU.thanDam }} className="text-base text-chu-chinh">
            {d.gia}
          </Text>
        </View>
      ))}
    </Khoi>
  );
}

function The({
  nhan,
  ten,
  mo,
  lanCuoi,
  onPress,
}: {
  nhan: string;
  ten: string;
  mo: string;
  lanCuoi?: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between rounded-2xl bg-nen-nhat p-5 active:opacity-70">
      <View className="flex-1 pr-3">
        <View className="flex-row items-center justify-between">
          <Nhan>{nhan}</Nhan>
          {lanCuoi ? (
            <Text style={{ fontFamily: CHU.than, fontSize: 11 }} className="text-chu-mo">
              {lanCuoi}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontFamily: CHU.thanDam }} className="text-lg text-chu-chinh">
          {ten}
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">
          {mo}
        </Text>
      </View>
      <Text style={{ fontFamily: CHU.than }} className="text-lg text-vang">
        ›
      </Text>
    </Pressable>
  );
}
