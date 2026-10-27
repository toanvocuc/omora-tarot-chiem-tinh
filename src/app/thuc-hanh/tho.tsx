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

import { KetQuaBuoi, type DongKetQua } from '@/components/ket-qua-buoi';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
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
          className="rounded-2xl bg-nen-nhat p-5 active:opacity-70">
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
          Ngồi cho thoải mái, mắt khép hờ, rồi thả hơi thở theo vòng tròn. Thấy
          chóng mặt thì dừng và thở như thường — không cần cố cho hết vòng.
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
