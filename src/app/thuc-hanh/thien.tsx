/**
 * Ngồi thiền — đồng hồ đếm ngược, không ai dẫn.
 *
 * ──────────────────────────────────────────── CHƯA CÓ GIỌNG DẪN, VÀ VÌ SAO
 *
 * Bản có giọng dẫn cần một gói phát âm thanh (`expo-audio`), mà thêm gói gốc là
 * ĐỔI DẤU VÂN TAY — bản cài đang sống không nhận được qua OTA nữa, phải dựng
 * lại và nộp lại chợ. Nên màn này chạy bản không lời trước: nó dùng được ngay,
 * và khi có file thu thì chỗ chọn bài đã nằm sẵn đây.
 *
 * Không lời cũng không phải bản thiếu: nhiều người ngồi quen thích im lặng hơn.
 */

import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { KetQuaBuoi, type DongKetQua } from '@/components/ket-qua-buoi';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { CHU } from '@/constants/giao-dien';
import { chuoiNgay, ghiBuoi, luiNgay, ngayHomNay, useThucHanh } from '@/lib/thuc-hanh';

const DO_DAI = [5, 10, 15, 20, 30];

export default function ManThien() {
  const buoi = useThucHanh();
  const [phut, datPhut] = useState<number | null>(null);
  const [xong, datXong] = useState<{ giay: number; dinh: number } | null>(null);

  if (xong) {
    const tu = luiNgay(ngayHomNay(), 6);
    const soBuoiTuan = buoi.filter((b) => b.loai === 'ngoi-yen' && b.ngay >= tu).length;
    const dong: DongKetQua[] = [
      { nhan: 'Đã định', gia: `${xong.dinh} phút` },
      { nhan: 'Ngồi được', gia: docGiay(xong.giay) },
      { nhan: 'Bảy ngày qua', gia: `${soBuoiTuan} buổi ngồi` },
    ];
    return (
      <ManHinh tieuDe="Ngồi thiền" quayLai>
        <KetQuaBuoi
          tieuDe="Xong một buổi"
          dong={dong}
          moTa="Ngồi đủ giờ hay dừng sớm đều được tính. Lần sau dài hơn một chút cũng không sao, ngắn hơn cũng vậy."
          chuoi={chuoiNgay(buoi)}
          xong={() => datXong(null)}
        />
      </ManHinh>
    );
  }

  return (
    <ManHinh tieuDe="Ngồi thiền" phu="Chọn một khoảng, rồi ngồi yên với nó." quayLai>
      {phut === null ? (
        <ChonDoDai chon={datPhut} />
      ) : (
        <DangNgoi
          phut={phut}
          ketThuc={(giay) => {
            if (giay >= 20) {
              ghiBuoi('ngoi-yen', giay);
              datXong({ giay, dinh: phut });
            }
            datPhut(null);
          }}
          bo={() => datPhut(null)}
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

function ChonDoDai({ chon }: { chon: (p: number) => void }) {
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-3">
        {DO_DAI.map((p) => (
          <Pressable
            key={p}
            onPress={() => chon(p)}
            className="min-w-[88px] items-center rounded-2xl bg-nen-nhat px-5 py-4 active:opacity-70">
            <Text style={{ fontFamily: CHU.hoaDam, fontSize: 22 }} className="text-chu-chinh">
              {p}
            </Text>
            <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-phu">
              phút
            </Text>
          </Pressable>
        ))}
      </View>

      <Khoi>
        <Nhan>Sắp có</Nhan>
        <Text style={{ fontFamily: CHU.than }} className="mt-1 text-sm leading-5 text-chu-phu">
          Mấy bài có giọng dẫn đang thu. Hiện giờ màn này giữ thời gian cho bạn,
          phần còn lại là im lặng.
        </Text>
      </Khoi>
    </View>
  );
}

function DangNgoi({
  phut,
  ketThuc,
  bo,
}: {
  phut: number;
  ketThuc: (giay: number) => void;
  bo: () => void;
}) {
  const tong = phut * 60;
  const [conLai, datConLai] = useState(tong);
  const batDau = useRef(Date.now());

  useEffect(() => {
    // Đếm theo ĐỒNG HỒ THẬT chứ không trừ dần mỗi giây: máy khoá màn hay app bị
    // đẩy xuống nền thì setInterval chạy chậm lại, trừ dần sẽ ra một con số sai
    // hẳn khi quay lại.
    let daBao = false;
    const dem = setInterval(() => {
      const troi = Math.floor((Date.now() - batDau.current) / 1000);
      const con = Math.max(0, tong - troi);
      datConLai(con);
      // Rung một nhịp khi hết giờ, thay cho tiếng chuông chưa có. Người đang
      // nhắm mắt cần một dấu hiệu nào đó, không thì ngồi quá giờ mà không biết.
      if (con === 0 && !daBao) {
        daBao = true;
        try {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          // Máy không rung được thì thôi.
        }
      }
    }, 250);
    return () => clearInterval(dem);
  }, [tong]);

  const het = conLai === 0;

  function xong() {
    ketThuc(Math.min(tong, Math.floor((Date.now() - batDau.current) / 1000)));
  }

  return (
    <View className="items-center gap-10 pt-10">
      <Text style={{ fontFamily: CHU.hoaDam, fontSize: 64, lineHeight: 72 }} className="text-chu-chinh">
        {`${Math.floor(conLai / 60)}:${String(conLai % 60).padStart(2, '0')}`}
      </Text>

      <Text style={{ fontFamily: CHU.than }} className="px-6 text-center text-sm leading-5 text-chu-phu">
        {het ? 'Hết giờ. Ngồi thêm một lát nữa cũng được.' : 'Đặt máy xuống. Lưng thẳng, vai buông, hơi thở tự nhiên.'}
      </Text>

      <View className="w-full gap-3">
        <Nut nhan={het ? 'Xong' : 'Kết thúc sớm'} onPress={xong} />
        {!het ? <Nut nhan="Dừng lại, không ghi" kieu="nhe" onPress={bo} /> : null}
      </View>
    </View>
  );
}
