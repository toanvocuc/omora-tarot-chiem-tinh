/**
 * Bài thở — một vòng tròn phình ra co vào theo nhịp.
 *
 * Không giọng đọc, không nhạc. Hai lý do: nhạc có bản quyền là thứ phải mua,
 * còn giọng đọc là thứ phải thu — mà cái vòng tròn thì đủ để người ta theo. Làm
 * được ngay, không chờ ai.
 *
 * Màn kết quả sau buổi CHỈ kể việc đã làm, không hứa tác dụng gì — xem đầu
 * `components/ket-qua-buoi.tsx`.
 */

import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { IconNet } from '@/components/icon-net';
import { KetQuaBuoi, type DongKetQua } from '@/components/ket-qua-buoi';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { HaiCot } from '@/components/san-bai-pc';
import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
import { motVong, NHIP_THO, type NhipTho } from '@/data/de-thuc-hanh';
import { chuoiNgay, ghiBuoi, ngayHomNay, useThucHanh } from '@/lib/thuc-hanh';

const TEN_CHANG = ['Hít vào', 'Giữ', 'Thở ra', 'Giữ'] as const;

/**
 * Rung một nhịp mỗi khi đổi chặng.
 *
 * Đây là thứ làm bài thở dùng được khi NHẮM MẮT — không phải nhìn màn hình mới
 * biết lúc nào chuyển. Hít vào rung mạnh hơn chút để phân biệt với thở ra.
 *
 * Bọc trong try/catch: máy không có mô-tơ rung, hoặc người dùng tắt rung trong
 * cài đặt, thì hàm này ném lỗi — mà lỗi đó không đáng làm gãy cả buổi thở.
 */
function rung(chang: number) {
  try {
    if (chang === 0) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (chang === 2) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else void Haptics.selectionAsync();
  } catch {
    // Máy không rung được thì vòng tròn vẫn chạy như thường.
  }
}
/** Vòng tròn nhỏ nhất và lớn nhất, tính theo bề ngang màn. */
const NHO = 0.42;
const LON = 1;
/** Ngắn hơn chừng này thì coi như mở ra xem rồi tắt, không ghi thành một buổi. */
const TOI_THIEU_GIAY = 20;

type Xong = { nhip: NhipTho; giay: number; vong: number };

export default function ManTho() {
  const { nhip } = useLocalSearchParams<{ nhip?: string }>();
  const buoi = useThucHanh();
  // Nhịp đang chọn giữ ở state, không đọc thẳng từ đường dẫn: bấm vào thẻ nào
  // thì chạy đúng nhịp đó. Bản trước đọc từ đường dẫn nên bấm thẻ nào cũng ra
  // một nhịp.
  const [chon, datChon] = useState<NhipTho>(
    () => NHIP_THO.find((n) => n.ma === nhip) ?? NHIP_THO[0]
  );
  const [dangChay, datDangChay] = useState(false);
  const [xong, datXong] = useState<Xong | null>(null);
  const pc = useManPC();

  function ketThuc(k: Xong) {
    if (k.giay >= TOI_THIEU_GIAY) ghiBuoi('tho', k.giay);
    datDangChay(false);
    datXong(k.giay >= TOI_THIEU_GIAY ? k : null);
  }

  if (xong) {
    const soBuoiTuan = buoi.filter((b) => b.loai === 'tho' && b.ngay >= luiBayNgay()).length;
    const dong: DongKetQua[] = [
      { nhan: 'Bài', gia: xong.nhip.ten },
      { nhan: 'Thời gian', gia: docGiay(xong.giay) },
      { nhan: 'Số vòng', gia: `${xong.vong} vòng` },
      { nhan: 'Bảy ngày qua', gia: `${soBuoiTuan} buổi thở` },
    ];
    return (
      <ManHinh tieuDe="Bài thở" quayLai>
        <KetQuaBuoi
          tieuDe="Xong một buổi"
          dong={dong}
          moTa={xong.nhip.cachLam}
          chuoi={chuoiNgay(buoi)}
          xong={() => datXong(null)}
        />
      </ManHinh>
    );
  }

  if (pc) {
    return (
      <ManHinh
        tieuDe="Trở về với nhịp thở"
        phu="Chọn một khoảng thời gian vừa sức. Bạn có thể dừng bất cứ lúc nào."
        quayLai>
        <ThoPC ketThuc={ketThuc} />
      </ManHinh>
    );
  }

  return (
    <ManHinh tieuDe="Bài thở" phu={dangChay ? chon.mo : undefined} quayLai>
      {dangChay ? (
        <DangTho nhip={chon} ketThuc={ketThuc} bo={() => datDangChay(false)} />
      ) : (
        <ChonNhip
          batDau={(n) => {
            datChon(n);
            datDangChay(true);
          }}
        />
      )}
    </ManHinh>
  );
}

/** Mấy mốc thời lượng của bản mẫu. */
const CAC_PHUT = [5, 10, 15, 20, 30] as const;

/** Đọc số giây thành mm:ss cho đồng hồ đếm ngược. */
function donghO(giay: number): string {
  const p = Math.floor(Math.max(0, giay) / 60);
  const c = Math.max(0, giay) % 60;
  return `${String(p).padStart(2, '0')}:${String(c).padStart(2, '0')}`;
}

/**
 * Bài thở trên máy tính: sân thở bên trái, bảng chọn bên phải.
 *
 * ──────────────────────────────────────────── KHÁC BẢN ĐIỆN THOẠI Ở ĐÂU
 *
 * Điện thoại đi hai bước: bấm một thẻ nhịp là vào thẳng vòng tròn toàn màn,
 * thở tới khi bấm "Xong". Hợp với màn hẹp và một tay cầm máy.
 *
 * Máy tính thì màn rộng, bày được cả hai cùng lúc — nên theo bản mẫu: vòng
 * tròn đứng yên một chỗ, còn thời lượng và nhịp nằm bên phải, đổi được ngay
 * mà không phải lùi ra.
 *
 * Kèm theo đó là một thứ bản điện thoại KHÔNG có: chọn thời lượng và đếm
 * NGƯỢC. Đếm xuôi thì người thở phải tự canh lúc nào dừng, tức vẫn phải để ý
 * màn hình — đúng thứ bài thở muốn bỏ. Đếm ngược xong là tự dừng.
 *
 * Chỉ thêm ở bản web. Bản điện thoại và hai bản app giữ nguyên lối cũ.
 */
function ThoPC({ ketThuc }: { ketThuc: (k: Xong) => void }) {
  const [phut, datPhut] = useState<number>(5);
  const [nhip, datNhip] = useState<NhipTho>(NHIP_THO[0]);
  const [chay, datChay] = useState(false);
  const [chang, datChang] = useState(0);
  const [daQua, datDaQua] = useState(0);
  const [vong, datVong] = useState(0);
  // Đứng yên thì vòng tròn phải ĐẦY. Khởi từ `NHO` thì lúc chưa thở nó đã co
  // quắp lại còn 42%, chữ tràn cả ra ngoài viền — nhìn như hỏng.
  const co = useSharedValue(LON);

  const tong = phut * 60;
  const conLai = Math.max(0, tong - daQua);

  // Đổi thời lượng hay đổi nhịp lúc chưa chạy thì làm lại từ đầu.
  function datLai() {
    datChay(false);
    datDaQua(0);
    datVong(0);
    datChang(0);
    co.value = LON;
  }

  /** Vòng thở: lặp các chặng, bỏ chặng 0 giây, phình to khi hít, thu lại khi thở ra. */
  useEffect(() => {
    if (!chay) return undefined;
    const chuoi = nhip.chang.map((c, i) => ({ giay: c, i })).filter((c) => c.giay > 0);
    let huy = false;
    let o = 0;
    let hen: ReturnType<typeof setTimeout> | null = null;
    // Thu lại trước khi hít hơi đầu tiên, không thì chặng hít vào chẳng còn
    // chỗ nào để phình ra.
    co.value = NHO;

    const buoc = () => {
      if (huy) return;
      const c = chuoi[o % chuoi.length];
      datChang(c.i);
      rung(c.i);
      if (o > 0 && o % chuoi.length === 0) datVong((v) => v + 1);
      if (c.i === 0)
        co.value = withTiming(LON, { duration: c.giay * 1000, easing: Easing.inOut(Easing.quad) });
      else if (c.i === 2)
        co.value = withTiming(NHO, { duration: c.giay * 1000, easing: Easing.inOut(Easing.quad) });
      hen = setTimeout(() => {
        o += 1;
        buoc();
      }, c.giay * 1000);
    };
    buoc();

    return () => {
      huy = true;
      if (hen) clearTimeout(hen);
      cancelAnimation(co);
    };
  }, [chay, nhip, co]);

  /**
   * Đồng hồ đếm riêng khỏi vòng thở.
   *
   * Gộp vào một chỗ thì mỗi lần đổi chặng lại dựng lại đồng hồ, và số giây
   * nhảy loạn. Tách ra thì đồng hồ chạy đều bất kể nhịp dài ngắn.
   */
  useEffect(() => {
    if (!chay) return undefined;
    const d = setInterval(() => datDaQua((g) => g + 1), 1000);
    return () => clearInterval(d);
  }, [chay]);

  // Hết giờ thì tự dừng và ghi lại, không bắt người ta nhìn màn chờ bấm.
  useEffect(() => {
    if (chay && daQua >= tong) ketThuc({ nhip, giay: daQua, vong });
  }, [chay, daQua, tong, nhip, vong, ketThuc]);

  const kieu = useAnimatedStyle(() => ({ transform: [{ scale: co.value }] }));

  return (
    <HaiCot
      trai={
        <View
          style={{
            minHeight: 475,
            borderWidth: 1,
            borderColor: MAU.vien,
            borderRadius: 17,
            overflow: 'hidden',
          }}
          className="items-center justify-center">
          {/* Nền loang TRÒN quanh vòng thở. `expo-linear-gradient` chỉ làm được
              chuyển sắc thẳng, mà cái đáng giá ở đây đúng là độ loang tròn.
              Nhánh này chỉ chạy trên web nên một thẻ `div` là hợp lệ — cùng
              cách đã làm ở `components/khung-pc` và `components/san-bai-pc`. */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse, #46314c55, transparent 65%), #191323',
            }}
          />

          <View className="h-[220px] w-[220px] items-center justify-center">
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  borderWidth: 1,
                  borderColor: '#AF8A47',
                },
                kieu,
              ]}
            />
            <Text
              style={{ fontFamily: CHU.thanDam, fontSize: 10, letterSpacing: 1.4 }}
              className="uppercase text-vang">
              {chay ? TEN_CHANG[chang] : 'Sẵn sàng'}
            </Text>
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 34, lineHeight: 44 }}
              className="text-chu-chinh">
              {chay ? TEN_CHANG[chang] : nhip.ten}
            </Text>
            <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-chu-phu">
              Chậm rãi, không gắng sức
            </Text>
          </View>

          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 31, letterSpacing: 2 }}
            className="mt-8 text-vang">
            {donghO(conLai)}
          </Text>

          <View className="mt-6 flex-row gap-3">
            <Pressable
              onPress={() => datChay((v) => !v)}
              accessibilityRole="button"
              style={{ backgroundColor: MAU.vang, minHeight: 46, borderRadius: 11 }}
              className="flex-row items-center justify-center gap-2 px-7 active:opacity-80">
              <Text style={{ fontFamily: CHU.thanDam, color: MAU.nen }} className="text-sm">
                {chay ? 'Tạm dừng' : 'Bắt đầu'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => (daQua > 0 ? ketThuc({ nhip, giay: daQua, vong }) : undefined)}
              disabled={daQua === 0}
              accessibilityRole="button"
              style={{
                borderColor: MAU.vien,
                borderWidth: 1,
                minHeight: 46,
                borderRadius: 11,
                opacity: daQua === 0 ? 0.45 : 1,
              }}
              className="items-center justify-center px-7 active:opacity-70">
              <Text style={{ fontFamily: CHU.thanVua }} className="text-sm text-chu-phu">
                Hoàn tất
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={datLai} className="mt-5 active:opacity-70">
            <Text style={{ fontFamily: CHU.thanVua, fontSize: 13 }} className="text-vang">
              Dừng lại, không ghi
            </Text>
          </Pressable>
        </View>
      }
      phai={
        <View className="gap-4">
          <Khoi>
            <Nhan>Thời gian</Nhan>
            <View className="flex-row flex-wrap gap-2">
              {CAC_PHUT.map((n) => {
                const dang = n === phut;
                return (
                  <Pressable
                    key={n}
                    onPress={() => {
                      datPhut(n);
                      datLai();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: dang }}
                    style={{
                      borderColor: dang ? MAU.vang : MAU.vien,
                      backgroundColor: dang ? MAU.vangRatMo : 'transparent',
                      borderWidth: 1,
                      borderRadius: 30,
                      paddingVertical: 8,
                      paddingHorizontal: 15,
                    }}
                    className="active:opacity-70">
                    <Text
                      style={{ fontFamily: dang ? CHU.thanDam : CHU.than, fontSize: 12 }}
                      className={dang ? 'text-vang' : 'text-chu-phu'}>
                      {n} phút
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ backgroundColor: MAU.vien }} className="my-5 h-px" />

            <Nhan>Chọn nhịp thở</Nhan>
            <View className="gap-2.5">
              {NHIP_THO.map((n) => {
                const dang = n.ma === nhip.ma;
                return (
                  <Pressable
                    key={n.ma}
                    onPress={() => {
                      datNhip(n);
                      datLai();
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: dang }}
                    style={{
                      borderColor: dang ? MAU.vang : MAU.vien,
                      backgroundColor: dang ? MAU.nenNhatHon : 'transparent',
                      borderWidth: 1,
                      borderRadius: 11,
                      padding: 13,
                    }}
                    className="flex-row items-center gap-3 active:opacity-70">
                    <IconNet ten="gio" co={18} mau={dang ? MAU.vangSang : MAU.chuMo} />
                    <View className="flex-1">
                      <Text
                        style={{ fontFamily: CHU.thanVua, fontSize: 13 }}
                        className="text-chu-chinh">
                        {n.ten}
                      </Text>
                      <Text
                        style={{ fontFamily: CHU.than, fontSize: 11, lineHeight: 17 }}
                        className="mt-0.5 text-chu-mo">
                        {motVong(n)} giây một vòng
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Khoi>

          <Text
            style={{ fontFamily: CHU.than, fontSize: 12, lineHeight: 20 }}
            className="text-chu-mo">
            Nếu thấy chóng mặt hoặc khó chịu, hãy dừng và thở tự nhiên.
          </Text>
        </View>
      }
    />
  );
}

function docGiay(g: number): string {
  const p = Math.floor(g / 60);
  const con = g % 60;
  if (p === 0) return `${con} giây`;
  return con ? `${p} phút ${con} giây` : `${p} phút`;
}

function luiBayNgay(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return ngayHomNay(d);
}

function ChonNhip({ batDau }: { batDau: (n: NhipTho) => void }) {
  return (
    <View className="gap-4">
      {NHIP_THO.map((n) => (
        <Pressable
          key={n.ma}
          onPress={() => batDau(n)}
          style={{ borderColor: MAU.vien }}
          className="rounded-2xl border bg-nen-nhat p-5 active:opacity-70">
          <Nhan>{`${motVong(n)} giây một vòng`}</Nhan>
          <Text style={{ fontFamily: CHU.thanDam }} className="text-lg text-chu-chinh">
            {n.ten}
          </Text>
          <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">
            {n.mo}
          </Text>
        </Pressable>
      ))}

      <Khoi>
        <Text style={{ fontFamily: CHU.than }} className="text-sm leading-5 text-chu-phu">
          Chọn một tư thế thoải mái, thả lỏng vai và nhẹ nhàng đưa sự chú ý về hơi
          thở. Không cần cố hít thật sâu hay ép bản thân theo kịp nhịp hướng dẫn.
          Nếu cảm thấy chóng mặt hoặc khó chịu, hãy dừng lại và trở về nhịp thở
          tự nhiên.
        </Text>
      </Khoi>
    </View>
  );
}

function DangTho({
  nhip,
  ketThuc,
  bo,
}: {
  nhip: NhipTho;
  ketThuc: (k: { nhip: NhipTho; giay: number; vong: number }) => void;
  bo: () => void;
}) {
  const [chang, datChang] = useState(0);
  const [giay, datGiay] = useState(0);
  const [vong, datVong] = useState(0);
  const co = useSharedValue(NHO);
  const batDau = useRef(Date.now());
  const dongHo = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Mảng chặng có chặng 0 giây (nhịp 4–7–8 không giữ hơi ở cuối). Bỏ chúng ra
    // trước, không thì vòng lặp dừng ở một chặng dài 0 giây và đứng im.
    const chuoi = nhip.chang.map((c, i) => ({ giay: c, i })).filter((c) => c.giay > 0);
    let huy = false;
    let o = 0;

    const chay = () => {
      if (huy) return;
      const c = chuoi[o % chuoi.length];
      datChang(c.i);
      rung(c.i);
      // Đếm một vòng khi quay lại chặng đầu, không đếm ở chặng cuối: chặng cuối
      // của mỗi nhịp một khác, còn chặng đầu thì nhịp nào cũng có.
      if (o > 0 && o % chuoi.length === 0) datVong((v) => v + 1);

      if (c.i === 0) co.value = withTiming(LON, { duration: c.giay * 1000, easing: Easing.inOut(Easing.quad) });
      else if (c.i === 2) co.value = withTiming(NHO, { duration: c.giay * 1000, easing: Easing.inOut(Easing.quad) });

      dongHo.current = setTimeout(() => {
        o += 1;
        chay();
      }, c.giay * 1000);
    };
    chay();

    const dem = setInterval(() => datGiay(Math.floor((Date.now() - batDau.current) / 1000)), 1000);

    return () => {
      huy = true;
      if (dongHo.current) clearTimeout(dongHo.current);
      clearInterval(dem);
      cancelAnimation(co);
    };
  }, [nhip, co]);

  const kieu = useAnimatedStyle(() => ({ transform: [{ scale: co.value }] }));

  return (
    <View className="items-center gap-8 pt-6">
      <View className="h-[260px] w-[260px] items-center justify-center">
        <Animated.View
          style={[
            {
              width: 260,
              height: 260,
              borderRadius: 130,
              borderWidth: 1,
              borderColor: MAU.vang,
              backgroundColor: MAU.nenNhat,
            },
            kieu,
          ]}
        />
        <Text
          style={{ fontFamily: CHU.hoaDam, fontSize: 26, position: 'absolute' }}
          className="text-chu-chinh">
          {TEN_CHANG[chang]}
        </Text>
      </View>

      <View className="items-center">
        <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
          {docGiay(giay)}
        </Text>
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm text-chu-mo">
          {`${vong} vòng`}
        </Text>
      </View>

      <View className="w-full gap-3">
        <Nut
          nhan="Xong"
          onPress={() =>
            ketThuc({ nhip, giay: Math.floor((Date.now() - batDau.current) / 1000), vong })
          }
        />
        <Nut nhan="Dừng lại, không ghi" kieu="nhe" onPress={bo} />
      </View>
    </View>
  );
}
