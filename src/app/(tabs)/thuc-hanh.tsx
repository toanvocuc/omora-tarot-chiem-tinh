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
import { IconNet, type TenIcon } from '@/components/icon-net';
import { LuoiPC, OLuoi } from '@/components/luoi-pc';
import { Khoi, ManHinh, Nhan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
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
  tongKetTuan,
  tuoiCay,
  useCay,
  useThucHanh,
  type BuoiThucHanh,
  type LoaiThucHanh,
} from '@/lib/thuc-hanh';

export default function ThucHanh() {
  const buoi = useThucHanh();
  const cay = useCay();
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

        {/* Cây và chuỗi ngày là hai thứ để LIẾC, không phải để đọc. Trên máy
            tính xếp cạnh nhau thì cả hai cùng nằm trong một tầm mắt, thay vì
            phải cuộn qua cái cây cao nửa màn mới thấy con số chuỗi ngày. */}
        <LuoiPC>
          <OLuoi>
            <CayCuaBan daTuoi={cay.daTuoi} conLai={cay.conLai} tuoi={() => tuoiCay()} />
          </OLuoi>
          <OLuoi>
            <ChuoiNgay chuoi={chuoi} phut={phut} ngay={bayNgayQua(buoi)} />
          </OLuoi>
        </LuoiPC>

        {laChuNhat && tuan.soBuoi > 0 ? <NhinLaiTuan tuan={tuan} /> : null}

        <LuoiPC>
          <OLuoi>
            <The
              nhan="5 tới 15 phút"
              icon="gio"
              ten="Bài thở"
              mo="Tĩnh tâm và thở đều theo nhịp của vòng tròn"
              lanCuoi={lanCuoi(buoi, 'tho')}
              onPress={() => router.push('/thuc-hanh/tho')}
            />
          </OLuoi>
          <OLuoi>
            <The
              nhan="5 tới 30 phút"
              icon="trang"
              ten="Ngồi thiền"
              mo="Đặt máy xuống, giữ yên trong khoảng bạn chọn"
              lanCuoi={lanCuoi(buoi, 'ngoi-yen')}
              onPress={() => router.push('/thuc-hanh/thien')}
            />
          </OLuoi>
          <OLuoi>
            <The
              nhan="Mỗi ngày một đề"
              icon="but"
              ten="Viết"
              mo="Một câu hỏi mở, và trang giấy chỉ riêng bạn"
              lanCuoi={lanCuoi(buoi, 'viet')}
              onPress={() => router.push('/thuc-hanh/viet')}
            />
          </OLuoi>
          <OLuoi>
            <The
              nhan="Vài phút"
              icon="ve"
              ten="Vẽ và chụp"
              mo="Thả tay vẽ hoặc chụp một tấm, không ai chấm điểm"
              lanCuoi={lanCuoi(buoi, 've')}
              onPress={() => router.push('/thuc-hanh/ve')}
            />
          </OLuoi>
          <OLuoi rong>
            <The
              icon="nguoi"
              dai
              nhan="Khi cần một người"
              ten="Đặt một buổi trò chuyện"
              mo="Khi trong lòng có điều cần nói với người khác"
              moi="Tìm người lắng nghe"
              onPress={() => router.push('/chuyen-gia')}
            />
          </OLuoi>
        </LuoiPC>
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

/**
 * Thẻ một việc để làm.
 *
 * ───────────────────────────────────────── HAI DÁNG, CHỌN THEO BỀ NGANG
 *
 * Điện thoại giữ NGUYÊN dáng cũ: một hàng ngang, chữ bên trái, dấu `›` bên
 * phải. Đừng đụng vào — cả hai bản app đang dùng đúng dáng đó, và lần này sếp
 * chỉ yêu cầu đổi bản web trên máy tính.
 *
 * Máy tính dựng theo `.quick-card` của bản mẫu, số đo đo thẳng từ `style.css`:
 *
 *     ô cao tối thiểu 145 · đệm 22 · icon 27 màu #E8C673, cách chữ 18
 *     mũi tên nằm tuyệt đối ở góc trên phải, cách trên 24 cách phải 23
 *
 * Dáng này xếp dọc nên bốn thẻ nằm cạnh nhau vẫn đọc được, trong khi dáng
 * ngang của điện thoại bị bóp còn một nửa bề rộng là chữ vỡ thành bốn dòng.
 */
function The({
  icon,
  nhan,
  ten,
  mo,
  moi,
  dai,
  lanCuoi,
  onPress,
}: {
  icon?: TenIcon;
  nhan: string;
  ten: string;
  mo: string;
  /** Chữ trên lối rẽ ở dáng dải ngang. */
  moi?: string;
  /** Dải ngang trải hết bề rộng, cho thẻ mời trò chuyện. */
  dai?: boolean;
  lanCuoi?: string | null;
  onPress: () => void;
}) {
  const pc = useManPC();

  if (pc && dai) {
    return (
      <Pressable
        onPress={onPress}
        style={{ borderColor: MAU.vien, borderRadius: 17, padding: 24 }}
        className="flex-row items-center border bg-nen-nhat active:opacity-70">
        <View
          style={{ borderColor: MAU.vangMo, width: 56, height: 56 }}
          className="items-center justify-center rounded-full border">
          {icon ? <IconNet ten={icon} co={24} mau={MAU.vangSang} /> : null}
        </View>
        <View className="flex-1 px-5">
          <Text style={{ fontFamily: CHU.hoaDam, fontSize: 21 }} className="text-chu-chinh">
            {ten}
          </Text>
          <Text style={{ fontFamily: CHU.than }} className="mt-1 text-[13px] text-chu-phu">
            {mo}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text style={{ fontFamily: CHU.thanDam, fontSize: 13 }} className="text-vang">
            {moi ?? nhan}
          </Text>
          <IconNet ten="muiTen" co={16} mau={MAU.vang} />
        </View>
      </Pressable>
    );
  }

  if (pc) {
    return (
      <Pressable
        onPress={onPress}
        style={{ borderColor: MAU.vien, borderRadius: 17, padding: 22, minHeight: 145 }}
        className="flex-1 border bg-nen-nhat active:opacity-70">
        {/* Mũi tên đặt tuyệt đối để nó không chen vào dòng chữ: tiêu đề dài
            một hay hai dòng thì nó vẫn nằm yên một chỗ, bốn thẻ nhìn đều nhau. */}
        <View style={{ position: 'absolute', top: 24, right: 23 }}>
          <IconNet ten="muiTen" co={17} mau={MAU.chuMo} />
        </View>
        {icon ? (
          <View style={{ marginBottom: 18 }}>
            <IconNet ten={icon} co={27} mau={MAU.vangSang} day={1.4} />
          </View>
        ) : null}
        <Text style={{ fontFamily: CHU.hoaDam, fontSize: 22 }} className="text-chu-chinh">
          {ten}
        </Text>
        <Text
          style={{ fontFamily: CHU.than, fontSize: 12, lineHeight: 20, maxWidth: 240 }}
          className="mt-2 text-chu-phu">
          {nhan} · {mo}.
        </Text>
        {lanCuoi ? (
          <Text style={{ fontFamily: CHU.than, fontSize: 11 }} className="mt-2 text-chu-mo">
            {lanCuoi}
          </Text>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center justify-between rounded-2xl border bg-nen-nhat p-5 active:opacity-70">
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
