/**
 * Độ hợp hai cung.
 *
 * ──────────────────────────────────────────── HAI BỐ CỤC, CHỌN THEO BỀ NGANG
 *
 * Điện thoại giữ NGUYÊN bố cục cũ: hai hàng thẻ chọn cung, rồi bốn khối chữ
 * xếp dọc. Đừng đụng vào — cả hai bản app đang dùng đúng bố cục đó, và lần này
 * sếp chỉ yêu cầu đổi bản web trên máy tính.
 *
 * Máy tính dựng lại theo bản mẫu của bên GPT, vì sếp chê ngày 2026-11-09:
 * "diễn giải quá nhiều làm cho phần UI bị nhiều chữ". Đúng vậy — trên màn 1920,
 * bốn khối chữ trải hết bề ngang thành bốn dải dài, phải cuộn hai màn mới hết,
 * mà mắt thì không biết bắt đầu từ đâu.
 *
 * Bản mẫu chữa bằng cách chia hai cột: cột trái giữ phần NHÌN (hai ô chọn, hai
 * ký hiệu cung, vòng điểm ở giữa), cột phải gom phần ĐỌC thành hai khối ngắn.
 * Cùng từng ấy chữ nhưng cao chỉ còn một màn, và mắt có chỗ nghỉ.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { BieuTuongCung } from '@/components/bieu-tuong-cung';
import { HoiChuyenGia } from '@/components/hoi-chuyen-gia';
import { IconNet } from '@/components/icon-net';
import { DangTai, Khoi, LuuYThamKhao, ManHinh, Nhan, Trong } from '@/components/nen';
import { NenKhungCung, SAU_HOA_VAN } from '@/components/nen-anh';
import { HaiCot } from '@/components/san-bai-pc';
import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
import { tachNgay, useHoSo } from '@/lib/ho-so';
import { useDoHop } from '@/lib/kho-noi-dung';
import { CUNG, cungTheoNgay, diemHop, timCung, type MaCung } from '@/lib/zodiac';

/** Gọi tên từng mức điểm. Năm vạch vàng không tự nói lên điều gì. */
const MUC: Record<number, string> = {
  1: 'Lệch nhau nhiều',
  2: 'Hay va chạm',
  3: 'Vừa phải',
  4: 'Khá hợp',
  5: 'Rất hợp',
};

export default function DoHop() {
  const { hoSo } = useHoSo();
  const { dong, loi, dangTai } = useDoHop();
  const pc = useManPC();
  const ns = tachNgay(hoSo?.ngay_sinh ?? null);
  const cuaToi = (ns ? cungTheoNgay(ns.ngay, ns.thang) : null) ?? 'aries';

  const [a, setA] = useState<MaCung>(cuaToi);
  const [b, setB] = useState<MaCung>('leo');
  /**
   * Cột phải chỉ bày hai khối ngắn. Nút này mở nốt phần còn lại.
   *
   * Bản gọn ban đầu gộp "để gần nhau hơn" thành `loi_khuyen || diem_yeu`, tức
   * khi có lời khuyên thì phần ĐIỂM YẾU biến mất hẳn — mất chữ thật, không
   * phải xếp lại chỗ. Sếp nhận ra ngay ngày 2026-11-09.
   *
   * Chữa bằng cách mở ra theo yêu cầu chứ không bày sẵn: ai muốn đọc kỹ thì
   * bấm, còn mặc định vẫn gọn như bản mẫu.
   */
  const [docHet, datDocHet] = useState(false);

  const binh = dong?.find(
    (d) => (d.cung_a === a && d.cung_b === b) || (d.cung_a === b && d.cung_b === a)
  );
  const diem = binh?.diem ?? diemHop(a, b);

  // ───────────────────────────────────────────────────────── bản máy tính
  if (pc) {
    return (
      <ManHinh
        quayLai
        tieuDe="Bạn và người ấy"
        phu="Nhìn vào điểm gặp gỡ và những khác biệt giữa hai cung hoàng đạo.">
        {dangTai ? (
          <DangTai />
        ) : loi ? (
          <Trong loi="Chưa tải được nội dung. Bạn thử lại nhé." />
        ) : (
          <HaiCot
            trai={
              <Khoi vien>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <ChonCungGon nhan="Cung của bạn" gia={a} dat={setA} />
                  </View>
                  <View className="flex-1">
                    <ChonCungGon nhan="Cung của người ấy" gia={b} dat={setB} />
                  </View>
                </View>

                <View className="mt-8 flex-row items-center justify-center gap-5">
                  <MotCung ma={a} />
                  <VongDiem diem={diem} />
                  <MotCung ma={b} />
                </View>

                {binh ? (
                  <Text
                    style={{ fontFamily: CHU.than, fontSize: 15, lineHeight: 27 }}
                    className="mt-7 text-center text-chu-chinh">
                    {binh.loi_binh}
                  </Text>
                ) : null}

                <Text
                  style={{ fontFamily: CHU.than, fontSize: 12 }}
                  className="mt-6 text-center text-chu-mo">
                  Một mối quan hệ còn phụ thuộc vào cách hai người sống và đối xử với nhau.
                </Text>
              </Khoi>
            }
            phai={
              <View className="gap-4">
                {binh?.diem_manh ? (
                  <Khoi>
                    <Nhan>Điểm gặp gỡ</Nhan>
                    <Text
                      style={{ fontFamily: CHU.hoaDam, fontSize: 20 }}
                      className="mb-3 text-chu-chinh">
                      Điều kết nối hai bạn
                    </Text>
                    <Text
                      style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
                      className="text-chu-phu">
                      {binh.diem_manh}
                    </Text>
                  </Khoi>
                ) : null}

                {binh?.loi_khuyen ? (
                  <Khoi>
                    <Nhan>Để gần nhau hơn</Nhan>
                    <Text
                      style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
                      className="text-chu-phu">
                      {binh.loi_khuyen}
                    </Text>
                  </Khoi>
                ) : null}

                {/* Phần đọc kỹ, giấu sau một nút. Giữ đủ mọi chữ của bản điện
                    thoại mà màn mặc định vẫn gọn. */}
                {docHet && binh?.diem_yeu ? (
                  <Khoi>
                    <Nhan>Dễ vướng ở chỗ</Nhan>
                    <Text
                      style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
                      className="text-chu-phu">
                      {binh.diem_yeu}
                    </Text>
                  </Khoi>
                ) : null}

                {binh?.diem_yeu ? (
                  <Pressable
                    onPress={() => datDocHet((v) => !v)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: docHet }}
                    className="flex-row items-center justify-center gap-2 py-1 active:opacity-70">
                    <Text style={{ fontFamily: CHU.thanDam, fontSize: 13 }} className="text-vang">
                      {docHet ? 'Thu gọn' : 'Đọc đầy đủ'}
                    </Text>
                    <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-vang">
                      {docHet ? '▲' : '▼'}
                    </Text>
                  </Pressable>
                ) : null}

                <Khoi>
                  <Nhan>Muốn hỏi kỹ hơn</Nhan>
                  <Text
                    style={{ fontFamily: CHU.than, fontSize: 14, lineHeight: 25 }}
                    className="text-chu-phu">
                    Chuyện hai người còn tuỳ lá số thật, không chỉ hai cung mặt trời.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/chuyen-gia')}
                    accessibilityRole="link"
                    className="mt-5 flex-row items-center gap-2 active:opacity-70">
                    <Text style={{ fontFamily: CHU.thanDam, fontSize: 13 }} className="text-vang">
                      Trò chuyện với chuyên gia
                    </Text>
                    <IconNet ten="muiTen" co={15} mau={MAU.vang} />
                  </Pressable>
                </Khoi>
              </View>
            }
          />
        )}
        <LuuYThamKhao />
      </ManHinh>
    );
  }

  // ─────────────────────────────────────────────────────── bản điện thoại
  return (
    <ManHinh quayLai nenPhu={<NenKhungCung />} sauHoaVan={SAU_HOA_VAN.cung} tieuDe="Độ hợp" phu="Chọn hai cung để xem hai người hợp nhau tới đâu.">
      <ChonCung nhan="Cung của bạn" gia={a} dat={setA} />
      <View className="mt-5">
        <ChonCung nhan="Cung của người ấy" gia={b} dat={setB} />
      </View>

      <View className="mt-7">
        {dangTai ? (
          <DangTai />
        ) : loi ? (
          <Trong loi="Chưa tải được nội dung. Bạn thử lại nhé." />
        ) : (
          <View className="gap-4">
            <Khoi vien>
              <Text
                style={{ fontFamily: CHU.hoaDam, fontSize: 26, lineHeight: 32 }}
                className="text-center text-chu-chinh">
                {timCung(a).ten} và {timCung(b).ten}
              </Text>
              <View className="mt-3 flex-row justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: i <= diem ? MAU.vang : MAU.vien }}
                    className="h-2.5 w-9 rounded-full"
                  />
                ))}
              </View>
              <Text
                style={{ fontFamily: CHU.thanDam, letterSpacing: 1.4 }}
                className="mt-2.5 text-center text-[11px] uppercase text-vang">
                {diem} trên 5 · {MUC[diem]}
              </Text>
              {binh ? (
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="mt-4 text-base leading-7 text-chu-chinh">
                  {binh.loi_binh}
                </Text>
              ) : null}
            </Khoi>

            {binh?.diem_manh ? (
              <Khoi>
                <Nhan>Được ở chỗ</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.diem_manh}
                </Text>
              </Khoi>
            ) : null}

            {binh?.diem_yeu ? (
              <Khoi>
                <Nhan>Dễ vướng ở chỗ</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.diem_yeu}
                </Text>
              </Khoi>
            ) : null}

            {binh?.loi_khuyen ? (
              <Khoi vien>
                <Nhan>Lời khuyên</Nhan>
                <Text
                  style={{ fontFamily: CHU.than }}
                  className="text-[15px] leading-7 text-chu-chinh">
                  {binh.loi_khuyen}
                </Text>
              </Khoi>
            ) : null}
          </View>
        )}
      </View>

      <HoiChuyenGia
        manHinh="do-hop"
        loiMoi="Muốn xem kỹ hơn chuyện hai người? Nhắn cho chuyên gia để hỏi theo lá số thật."
      />
      <LuuYThamKhao />
    </ManHinh>
  );
}

/** Ký hiệu một cung trong vòng tròn, kèm tên dưới chân. Chỉ dùng ở bản máy tính. */
function MotCung({ ma }: { ma: MaCung }) {
  return (
    <View className="items-center">
      <View
        style={{ borderColor: MAU.vangMo, width: 92, height: 92 }}
        className="items-center justify-center rounded-full bg-nen-nhat border">
        <BieuTuongCung ma={ma} co={42} />
      </View>
      <Text style={{ fontFamily: CHU.hoaDam, fontSize: 19 }} className="mt-3 text-chu-chinh">
        {timCung(ma).ten}
      </Text>
    </View>
  );
}

/**
 * Vòng điểm giữa hai cung, thay cho năm vạch ngang của bản điện thoại.
 *
 * Năm vạch cần thêm một dòng chữ "3 trên 5 · Vừa phải" mới hiểu được, tức là
 * thêm chữ — đúng thứ đang phải bớt. Một con số to trong vòng tròn thì tự nó
 * đã đọc được.
 */
function VongDiem({ diem }: { diem: number }) {
  return (
    <View
      style={{ borderColor: MAU.vang, borderWidth: 2, width: 128, height: 128 }}
      className="items-center justify-center rounded-full">
      <View className="flex-row items-baseline">
        <Text style={{ fontFamily: CHU.hoaDam, fontSize: 38 }} className="text-chu-chinh">
          {diem}
        </Text>
        <Text style={{ fontFamily: CHU.than, fontSize: 17 }} className="text-chu-phu">
          /5
        </Text>
      </View>
      <Text
        style={{ fontFamily: CHU.thanDam, fontSize: 8, letterSpacing: 0.9, lineHeight: 12 }}
        className="mt-1 text-center uppercase text-vang">
        {MUC[diem]}
      </Text>
    </View>
  );
}

/**
 * Ô chọn cung dạng hộp xổ, CHỈ cho máy tính.
 *
 * Dùng thẻ `select` thật của trình duyệt chứ không dựng lại bằng React Native.
 * Hai lẽ: mười hai thẻ bấm xếp ngang chiếm bốn hàng trong cột trái, đúng cái
 * rậm rạp vừa phải bớt; và hộp xổ của hệ điều hành thì bàn phím, trình đọc màn
 * hình và chuột đều đã biết cách dùng, dựng lại bằng tay là mất cả ba.
 *
 * Nhánh này chỉ chạy trên web — `useManPC` luôn trả false trên máy thật — nên
 * một thẻ `select` thường là lối thoát hợp lệ, cùng cách đã làm ở
 * `components/khung-pc`.
 */
function ChonCungGon({
  nhan,
  gia,
  dat,
}: {
  nhan: string;
  gia: MaCung;
  dat: (v: MaCung) => void;
}) {
  if (Platform.OS !== 'web') return null;
  return (
    <View>
      <Nhan>{nhan}</Nhan>
      <select
        value={gia}
        onChange={(e) => dat(e.target.value as MaCung)}
        aria-label={nhan}
        style={{
          width: '100%',
          background: MAU.nenNhat,
          color: MAU.chuChinh,
          border: `1px solid ${MAU.vien}`,
          borderRadius: 11,
          padding: '13px 15px',
          fontSize: 15,
          fontFamily: CHU.than,
          cursor: 'pointer',
        }}>
        {CUNG.map((c) => (
          <option key={c.ma} value={c.ma}>
            {c.ten}
          </option>
        ))}
      </select>
    </View>
  );
}

function ChonCung({
  nhan,
  gia,
  dat,
}: {
  nhan: string;
  gia: MaCung;
  dat: (v: MaCung) => void;
}) {
  return (
    <View>
      <Nhan>{nhan}</Nhan>
      <View className="flex-row flex-wrap gap-2">
        {CUNG.map((c) => {
          const chon = gia === c.ma;
          return (
            <Pressable
              key={c.ma}
              onPress={() => dat(c.ma)}
              className={`min-h-[40px] justify-center rounded-full border px-3.5 active:opacity-70 ${
                chon ? 'border-vang bg-vang/15' : 'border-vien bg-nen-nhat'
              }`}>
              <Text
                numberOfLines={1}
                style={{ fontFamily: chon ? CHU.thanDam : CHU.than }}
                className={`text-sm ${chon ? 'text-vang' : 'text-chu-phu'}`}>
                {c.ten}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
