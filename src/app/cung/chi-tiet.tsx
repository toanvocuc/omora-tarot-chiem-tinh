/** Chi tiết một cung: ký hiệu, mốc ngày, bốn thanh chỉ số, tính cách, điểm mạnh yếu. */

import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { IconNet, type TenIcon } from '@/components/icon-net';
import { LuoiPC, OLuoi } from '@/components/luoi-pc';
import { HaiCot, ThanhThe } from '@/components/san-bai-pc';
import { ChuThan, DangTai, Khoi, LuuYThamKhao, Nhan, Nut, Trong, VanNgan } from '@/components/nen';
import { KhungPC } from '@/components/khung-pc';
import { NutQuayLai } from '@/components/nut-quay-lai';
import { NenKhungCung } from '@/components/nen-anh';
import { BauTroiDong } from '@/components/bau-troi-dong';
import { ThanhTieuDe } from '@/components/thanh-tieu-de';
import { CHU, MAU, NEN_CHUYEN, NEN_PHANG } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useCung, useTuVi, type DongTuVi, type NoiDungCung } from '@/lib/kho-noi-dung';
import { layBaiTuVi, ngayChu, tuanChu } from '@/lib/tu-vi';
import { cungTheoNgay, diemHop, timCung, type MaCung } from '@/lib/zodiac';

/**
 * Bốn chỉ số suy từ nguyên tố và tính chất của cung, không phải số bịa ra mỗi lần mở.
 * Cùng một cung thì lúc nào cũng ra cùng một bộ số.
 */
function chiSo(ma: MaCung) {
  const c = timCung(ma);
  const nen = { 'Hoả': [78, 88, 82, 86], 'Khí': [84, 80, 76, 88], 'Thổ': [74, 92, 86, 78], 'Thuỷ': [90, 74, 80, 82] }[
    c.nguyenTo
  ];
  const lech = c.ma.length % 5; // xê dịch nhẹ để các cung cùng nguyên tố không giống hệt nhau
  return {
    tinhDuyen: nen[0] + lech,
    suNghiep: nen[1] - lech,
    sucKhoe: nen[2] + ((lech + 2) % 4),
    mayMan: nen[3] - ((lech + 1) % 4),
  };
}

export default function ChiTietCung() {
  // `ky` cho phép mở thẳng thẻ tuần bằng đường dẫn, ví dụ /cung/chi-tiet?ma=virgo&ky=tuan.
  const { ma, ky: kyBanDau } = useLocalSearchParams<{ ma: MaCung; ky?: string }>();
  const { hoSo } = useHoSo();
  const { dong, loi } = useCung();
  const tuVi = useTuVi();
  const [ky, setKy] = useState<'ngay' | 'tuan'>(kyBanDau === 'tuan' ? 'tuan' : 'ngay');

  const cung = ma ? timCung(ma) : null;
  const nd = dong?.find((x) => x.ma === ma);
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = ns ? cungTheoNgay(ns.ngay, ns.thang) : null;
  const cs = ma ? chiSo(ma) : null;
  const le = useSafeAreaInsets();
  const pc = useManPC();

  if (!cung || !cs) {
    return (
      <LinearGradient colors={NEN_CHUYEN} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ThanhTieuDe ten="Cung hoàng đạo" />
          <View className="px-5 pt-6">
            <Trong loi="Không tìm thấy cung này." />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={pc ? NEN_PHANG : NEN_CHUYEN}
      locations={[0, 0.45, 1]}
      style={{ flex: 1 }}>
      {pc ? null : <NenKhungCung />}
      <BauTroiDong />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Máy tính giấu thanh tiêu đề nhỏ: nó trải hết cửa sổ, nằm NGOÀI khung
            hoa văn, nên trông như một mẩu rời. Nút quay lại chuyển vào trong
            khung — cùng cách đã làm ở màn Cá nhân. */}
        {pc ? null : <ThanhTieuDe ten={cung.ten} />}

        <ScrollView
          contentContainerClassName={pc ? '' : 'px-5 pt-7'}
          contentContainerStyle={{ paddingBottom: pc ? 40 : 56 + le.bottom }}>
          <KhungPC>
          {pc ? (
            <View className="mb-6 self-start">
              <NutQuayLai />
            </View>
          ) : null}
          {pc ? (
            <ChiTietPC
              cung={cung}
              nd={nd}
              cs={cs}
              kho={tuVi.dong}
              dangTai={tuVi.dangTai}
              loiTuVi={tuVi.loi}
              cuaToi={cuaToi}
              kyBanDau={kyBanDau}
            />
          ) : (
            <>
          <View className="items-center">
            <View
              style={{ borderColor: MAU.vangMo }}
              className="h-24 w-24 items-center justify-center rounded-full border">
              <BieuTuongCung ma={cung.ma} co={48} />
            </View>
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 38, lineHeight: 44 }}
              className="mt-4 text-chu-chinh">
              {cung.ten}
            </Text>
            <View className="mt-2 flex-row items-center gap-2">
              <View
                style={{ borderColor: MAU.vangMo }}
                className="rounded-full border px-2.5 py-0.5">
                <Text
                  style={{ fontFamily: CHU.thanDam, letterSpacing: 1 }}
                  className="text-[10px] uppercase text-vang">
                  {nd?.ten_en ?? cung.nguyenTo}
                </Text>
              </View>
              <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-phu">
                {nd ? `${nd.tu_ngay} – ${nd.den_ngay}` : ''} · {cung.nguyenTo}
              </Text>
            </View>
          </View>

          <VanNgan />

          <View className="flex-row flex-wrap justify-between gap-y-5">
            <Chi nhan="Tình duyên" gia={cs.tinhDuyen} />
            <Chi nhan="Sự nghiệp" gia={cs.suNghiep} />
            <Chi nhan="Sức khoẻ" gia={cs.sucKhoe} />
            <Chi nhan="May mắn" gia={cs.mayMan} />
          </View>

          <View className="mt-8">
            <View
              style={{ borderColor: MAU.vien }}
              className="flex-row rounded-full border bg-nen-nhat p-1">
              {(
                [
                  ['ngay', 'Hôm nay'],
                  ['tuan', 'Tuần này'],
                ] as ['ngay' | 'tuan', string][]
              ).map(([v, nhan]) => {
                const dang = ky === v;
                return (
                  <Pressable
                    key={v}
                    onPress={() => setKy(v)}
                    style={{ backgroundColor: dang ? MAU.vang : 'transparent' }}
                    className="min-h-[44px] flex-1 items-center justify-center rounded-full active:opacity-80">
                    <Text
                      style={{ fontFamily: CHU.thanDam, color: dang ? MAU.nen : MAU.chuPhu }}
                      className="text-sm">
                      {nhan}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text
              style={{ fontFamily: CHU.than }}
              className="mt-3 text-center text-xs text-chu-mo">
              {ky === 'ngay' ? ngayChu() : `Tuần ${tuanChu()}`}
            </Text>

            {tuVi.dangTai ? (
              <View className="mt-5">
                <DangTai />
              </View>
            ) : tuVi.loi ? (
              <View className="mt-5">
                <Trong loi={`Chưa tải được tử vi. ${tuVi.loi}`} />
              </View>
            ) : (
              <TuVi kho={tuVi.dong} cung={cung.ma} ky={ky} />
            )}
          </View>

          {nd ? (
            <View className="mt-8 gap-4">
              <Khoi>
                <Nhan>Tính cách</Nhan>
                <ChuThan>{nd.tinh_cach}</ChuThan>
              </Khoi>
              <Khoi>
                <Nhan>Điểm mạnh</Nhan>
                <ChuThan>{nd.diem_manh}</ChuThan>
              </Khoi>
              <Khoi>
                <Nhan>Điểm yếu</Nhan>
                <ChuThan>{nd.diem_yeu}</ChuThan>
              </Khoi>
            </View>
          ) : null}

          {loi ? (
            <View className="mt-7">
              <Trong loi="Chưa tải được nội dung. Bạn thử lại nhé." />
            </View>
          ) : null}

          {cuaToi && cuaToi !== cung.ma ? (
            <View className="mt-4">
              <Khoi vien>
                <Nhan>So với cung của bạn</Nhan>
                <ChuThan>
                  {timCung(cuaToi).ten} và {cung.ten} hợp nhau {diemHop(cuaToi, cung.ma)} trên 5.
                </ChuThan>
                <View className="mt-4">
                  <Nut nhan="Xem độ hợp" kieu="vien" onPress={() => router.push('/cung/do-hop')} />
                </View>
              </Khoi>
            </View>
          ) : null}

            </>
          )}

          <HoiChuyenGia
            manHinh="chi-tiet-cung"
            loiMoi={`Là ${cung.ten} thì điều gì đang chờ bạn tháng này? Nhắn cho chuyên gia để hỏi cho rõ.`}
          />

          <LuuYThamKhao />
          </KhungPC>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/** Khối tử vi: điểm sao, mấy con số vui, rồi tới các mục chữ. */
function TuVi({
  kho,
  cung,
  ky,
}: {
  kho: DongTuVi[] | null;
  cung: MaCung;
  ky: 'ngay' | 'tuan';
}) {
  const b = layBaiTuVi(kho, cung, ky);

  if (!b.tongQuan) {
    return (
      <View className="mt-5">
        <Trong loi="Chưa có bài tử vi cho cung này. Nạp data/tu_vi_mau.csv vào bảng tu_vi_mau." />
      </View>
    );
  }

  return (
    <View className="mt-5 gap-4">
      <Khoi vien>
        <View className="mb-3 flex-row justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{ backgroundColor: i <= b.diem ? MAU.vang : MAU.vien }}
              className="h-2.5 w-9 rounded-full"
            />
          ))}
        </View>
        <ChuThan>{b.tongQuan}</ChuThan>
      </Khoi>

      <View className="flex-row gap-3">
        <O nhan="Số may mắn" gia={String(b.soMayMan)} />
        <O nhan="Màu hợp" gia={b.mauMayMan} />
        <O nhan="Giờ tốt" gia={b.gioTot} />
      </View>

      {b.tinhCam ? (
        <Khoi>
          <Nhan>Tình cảm</Nhan>
          <ChuThan>{b.tinhCam}</ChuThan>
        </Khoi>
      ) : null}
      {b.congViec ? (
        <Khoi>
          <Nhan>Công việc và tiền bạc</Nhan>
          <ChuThan>{b.congViec}</ChuThan>
        </Khoi>
      ) : null}
      {b.sucKhoe ? (
        <Khoi>
          <Nhan>Sức khoẻ</Nhan>
          <ChuThan>{b.sucKhoe}</ChuThan>
        </Khoi>
      ) : null}
    </View>
  );
}

/**
 * Bản máy tính: băng đầu trang, ba thẻ, lưới hai cột, và một cột phụ bên phải.
 *
 * ──────────────────────────────────────────────── VÌ SAO PHẢI DỰNG LẠI
 *
 * Bản điện thoại đổ TẤT CẢ ra một cột: bốn thanh chỉ số, một đoạn tổng quan,
 * ba ô số vui, rồi tình cảm, công việc, sức khoẻ, tính cách, điểm mạnh, điểm
 * yếu, so với cung của bạn. Mười khối chữ. Trên màn điện thoại thì cuộn một
 * mạch là xong, nhưng trải ra 1170 điểm ảnh thì mỗi khối thành một dải dài,
 * và mắt không biết bắt đầu từ đâu. Sếp chê đúng chỗ đó ngày 2026-11-09:
 * "diễn giải quá nhiều làm cho phần UI bị nhiều chữ".
 *
 * Bản mẫu của bên GPT chữa bằng hai việc, chép lại cả hai:
 *
 *   1. THÊM MỘT THẺ. Tính cách, điểm mạnh, điểm yếu và bốn thanh chỉ số dọn
 *      hết sang thẻ "Tính cách". Chúng tả con người cái cung, không đổi theo
 *      ngày — nằm chung với tử vi hôm nay là trộn hai thứ khác hẳn nhau.
 *      Nhờ vậy màn mặc định còn đúng bốn ô.
 *   2. CHIA HAI CỘT. Mấy con số vui và lối rẽ sang Độ hợp sang cột phải, nên
 *      cột chính chỉ còn phần đọc.
 *
 * Không bỏ một chữ nào của bản điện thoại, chỉ xếp lại chỗ.
 */
function ChiTietPC({
  cung,
  nd,
  cs,
  kho,
  dangTai,
  loiTuVi,
  cuaToi,
  kyBanDau,
}: {
  cung: ReturnType<typeof timCung>;
  nd: NoiDungCung | undefined;
  cs: ReturnType<typeof chiSo>;
  kho: DongTuVi[] | null;
  dangTai: boolean;
  loiTuVi: string | null;
  cuaToi: MaCung | null;
  kyBanDau?: string;
}) {
  const [the, setThe] = useState(kyBanDau === 'tuan' ? 1 : 0);
  const ky: 'ngay' | 'tuan' = the === 1 ? 'tuan' : 'ngay';
  const b = layBaiTuVi(kho, cung.ma, ky);

  /** Bốn mục của một bài tử vi, mỗi mục một icon — đúng bộ của bản mẫu. */
  const muc: [string, string | null, TenIcon][] = [
    ['Tổng quan', b.tongQuan, 'troi'],
    ['Tình cảm', b.tinhCam, 'tim'],
    ['Công việc', b.congViec, 'sach'],
    ['Chăm sóc bản thân', b.sucKhoe, 'la'],
  ];

  return (
    <HaiCot
      trai={
        <View>
          <Khoi vien>
            <View className="flex-row items-center gap-5">
              <View
                style={{ borderColor: MAU.vangMo, width: 78, height: 78 }}
                className="items-center justify-center rounded-full border">
                <BieuTuongCung ma={cung.ma} co={38} />
              </View>
              <View className="flex-1">
                <Text
                  style={{ fontFamily: CHU.thanDam, fontSize: 10, letterSpacing: 1.3 }}
                  className="uppercase text-vang">
                  {nd?.ten_en ?? cung.ma} · {cung.nguyenTo}
                </Text>
                <Text
                  style={{ fontFamily: CHU.hoaDam, fontSize: 34, lineHeight: 42 }}
                  className="text-chu-chinh">
                  {cung.ten}
                </Text>
                {nd ? (
                  <Text style={{ fontFamily: CHU.than, fontSize: 13 }} className="text-chu-phu">
                    {nd.tu_ngay} – {nd.den_ngay} · {nd.tinh_chat}
                  </Text>
                ) : null}
              </View>
            </View>
          </Khoi>

          <View className="mt-6">
            <ThanhThe
              cac={['Hôm nay', 'Tuần này', 'Tính cách'] as const}
              dang={the}
              doi={setThe}
            />

            {the === 2 ? (
              <View className="gap-4">
                {nd ? (
                  <Khoi>
                    <Nhan>Tính cách {cung.ten}</Nhan>
                    <ChuThan>{nd.tinh_cach}</ChuThan>
                  </Khoi>
                ) : null}
                {nd ? (
                  <LuoiPC>
                    <OLuoi>
                      <Khoi cao>
                        <Nhan>Điểm mạnh</Nhan>
                        <ChuThan>{nd.diem_manh}</ChuThan>
                      </Khoi>
                    </OLuoi>
                    <OLuoi>
                      <Khoi cao>
                        <Nhan>Điểm yếu</Nhan>
                        <ChuThan>{nd.diem_yeu}</ChuThan>
                      </Khoi>
                    </OLuoi>
                  </LuoiPC>
                ) : null}
                <Khoi>
                  <Nhan>Mấy nét nổi lên</Nhan>
                  <View className="mt-1 flex-row flex-wrap justify-between gap-y-5">
                    <Chi nhan="Tình duyên" gia={cs.tinhDuyen} />
                    <Chi nhan="Sự nghiệp" gia={cs.suNghiep} />
                    <Chi nhan="Sức khoẻ" gia={cs.sucKhoe} />
                    <Chi nhan="May mắn" gia={cs.mayMan} />
                  </View>
                </Khoi>
              </View>
            ) : dangTai ? (
              <DangTai />
            ) : loiTuVi ? (
              <Trong loi={`Chưa tải được tử vi. ${loiTuVi}`} />
            ) : !b.tongQuan ? (
              <Trong loi="Chưa có bài tử vi cho cung này. Nạp data/tu_vi_mau.csv vào bảng tu_vi_mau." />
            ) : (
              <View>
                <View className="mb-5 flex-row items-center justify-between">
                  <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-chu-mo">
                    {ky === 'ngay' ? ngayChu() : `Tuần ${tuanChu()}`}
                  </Text>
                  <View className="flex-row gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <View
                        key={i}
                        style={{ backgroundColor: i <= b.diem ? MAU.vang : MAU.vien }}
                        className="h-2 w-7 rounded-full"
                      />
                    ))}
                  </View>
                </View>
                <LuoiPC>
                  {muc.map(([ten, chu, icon]) =>
                    chu ? (
                      <OLuoi key={ten}>
                        <Khoi cao>
                          <View className="mb-3 flex-row items-center gap-2.5">
                            <IconNet ten={icon} co={19} mau={MAU.vangSang} />
                            <Text
                              style={{ fontFamily: CHU.hoaDam, fontSize: 21 }}
                              className="text-chu-chinh">
                              {ten}
                            </Text>
                          </View>
                          <Text
                            style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
                            className="text-chu-phu">
                            {chu}
                          </Text>
                        </Khoi>
                      </OLuoi>
                    ) : null
                  )}
                </LuoiPC>
              </View>
            )}
          </View>
        </View>
      }
      phai={
        <View className="gap-4">
          <Khoi>
            <Nhan>Một vài điều thú vị</Nhan>
            <Text style={{ fontFamily: CHU.hoaDam, fontSize: 20 }} className="mb-4 text-chu-chinh">
              Dành cho hôm nay
            </Text>
            <View className="flex-row gap-3">
              <O nhan="Con số" gia={String(b.soMayMan)} />
              <O nhan="Khung giờ" gia={b.gioTot} />
              <O nhan="Màu sắc" gia={b.mauMayMan} />
            </View>
            <Text style={{ fontFamily: CHU.than, fontSize: 11 }} className="mt-4 text-chu-mo">
              Các thông tin này mang tính giải trí.
            </Text>
          </Khoi>

          <Khoi>
            <Nhan>Bạn và người ấy</Nhan>
            <Text style={{ fontFamily: CHU.hoaDam, fontSize: 20 }} className="mb-3 text-chu-chinh">
              Hai người khác nhau ở đâu?
            </Text>
            <Text
              style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
              className="text-chu-phu">
              {cuaToi && cuaToi !== cung.ma
                ? `${timCung(cuaToi).ten} và ${cung.ten} hợp nhau ${diemHop(cuaToi, cung.ma)} trên 5.`
                : 'Thử đặt hai cung cạnh nhau để nhìn thêm một góc.'}
            </Text>
            <Pressable
              onPress={() => router.push('/cung/do-hop')}
              accessibilityRole="link"
              className="mt-5 flex-row items-center gap-2 active:opacity-70">
              <Text style={{ fontFamily: CHU.thanDam, fontSize: 13 }} className="text-vang">
                Khám phá độ hợp
              </Text>
              <IconNet ten="muiTen" co={15} mau={MAU.vang} />
            </Pressable>
          </Khoi>
        </View>
      }
    />
  );
}

/** Một ô nhỏ cho mấy con số vui. */
function O({ nhan, gia }: { nhan: string; gia: string }) {
  return (
    <View
      style={{ borderColor: MAU.vien }}
      className="flex-1 items-center rounded-2xl border bg-nen-nhat px-2 py-3">
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1 }}
        className="text-[9px] uppercase text-chu-mo">
        {nhan}
      </Text>
      <Text style={{ fontFamily: CHU.thanDam }} className="mt-1 text-sm text-vang">
        {gia}
      </Text>
    </View>
  );
}

/** Một chỉ số: tên, phần trăm, và thanh ngang. */
function Chi({ nhan, gia }: { nhan: string; gia: number }) {
  return (
    <View style={{ width: '47%' }}>
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-phu">
          {nhan}
        </Text>
        <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-chu-chinh">
          {gia}%
        </Text>
      </View>
      <View style={{ backgroundColor: MAU.vien }} className="h-1.5 overflow-hidden rounded-full">
        <View
          style={{ width: `${gia}%`, backgroundColor: MAU.vang }}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}
