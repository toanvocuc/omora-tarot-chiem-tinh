/**
 * Vẽ — mỗi ngày một đề, vẽ thẳng trong app.
 *
 * Chưa có đề chụp ảnh vì app chưa đính được ảnh — xem ghi chú ở `DE_VE`.
 *
 * Nét vẽ cất thành toạ độ chứ không thành ảnh: nhẹ hơn hẳn, và không cần gói
 * chọn ảnh — xem đầu `components/khung-ve.tsx`.
 *
 * Trang vẽ nằm trên máy, không gửi đi đâu — xem đầu `lib/thuc-hanh.ts`.
 */

import { Image } from 'expo-image';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { hoi } from '@/lib/hoi-lai';
import { KhungVe, XemLaiNet, type Net } from '@/components/khung-ve';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { DE_VE, deCuaNgay } from '@/data/de-thuc-hanh';
import {
  cacTrang,
  ghiBuoi,
  ngayHomNay,
  suaBuoi,
  useThucHanh,
  xoaBuoi,
  type BuoiThucHanh,
} from '@/lib/thuc-hanh';

export default function ManVe() {
  const buoi = useThucHanh();
  const de = deCuaNgay(DE_VE, ngayHomNay());
  const [net, datNet] = useState<Net[]>([]);
  const [co, datCo] = useState({ w: 400, h: 320 });
  const [ghi, datGhi] = useState('');
  const [daLuu, datDaLuu] = useState(false);
  /** Mã bức đang sửa. Null là đang vẽ bức mới. */
  const [dangSua, datDangSua] = useState<string | null>(null);
  const [anh, datAnh] = useState<string | null>(null);

  const trang = cacTrang(buoi).filter((b) => b.loai === 've');
  const coGi = net.length > 0 || ghi.trim().length > 0 || anh !== null;

  function donDep() {
    datNet([]);
    datGhi('');
    datAnh(null);
    datDangSua(null);
  }

  /**
   * Giữ lại tấm ảnh ở chỗ bền.
   *
   * `launchImageLibraryAsync` trả về một bản chép nằm trong thư mục ĐỆM của
   * app. Đệm là thứ máy được phép xoá bất cứ lúc nào — hết chỗ trống, hoặc
   * khách bấm "Xoá bộ nhớ đệm" trong cài đặt. Nhật ký thì cất nguyên đường dẫn
   * đó xuống AsyncStorage, nên vài tuần sau mở lại buổi cũ là ô ảnh trống trơn
   * mà không hiểu vì sao.
   *
   * Chép sang thư mục tài liệu thì máy không đụng vào nữa. Chép hỏng thì vẫn
   * trả về đường dẫn cũ: ảnh tạm còn hơn không có ảnh.
   */
  async function giuAnh(nguonUri: string): Promise<string> {
    try {
      const thuMuc = new Directory(Paths.document, 'anh-thuc-hanh');
      if (!thuMuc.exists) thuMuc.create({ intermediates: true, idempotent: true });
      const nguon = new File(nguonUri);
      const dich = new File(thuMuc, `${Date.now()}.${nguon.extension || 'jpg'}`);
      await nguon.copy(dich);
      return dich.uri;
    } catch {
      return nguonUri;
    }
  }

  /**
   * Chọn một tấm từ thư viện máy.
   *
   * KHÔNG xin quyền ở đây. Bộ chọn ảnh của hệ thống (`PickVisualMedia`, máy cũ
   * thì `ACTION_GET_CONTENT`) không đòi quyền nào — khách tự chọn tấm nào thì
   * app chỉ thấy đúng tấm đó. Bản cũ chặn trước bằng
   * `requestMediaLibraryPermissionsAsync`, và trên Android 12 trở xuống câu đó
   * LUÔN trả về bị từ chối, vì `READ_EXTERNAL_STORAGE` nằm trong
   * `blockedPermissions` của app.json. Kết quả: nút đính ảnh chết hẳn trên máy
   * Android cũ, báo "chưa mở quyền" mà vào cài đặt cũng không có gì để mở.
   *
   * Quyền đó bị chặn CÓ CHỦ Ý — xem commit 00649d9, Google đã một lần chặn bản
   * nộp chợ ở mục "Photo and video permissions". Nên đường đúng là bỏ câu hỏi
   * quyền, không phải mở lại quyền.
   *
   * `mediaTypes: ['images']` để khỏi lọt video — một đoạn phim nhét vào nhật ký
   * thì nặng và cũng không hiện lại được ở đây.
   */
  async function chonAnh() {
    try {
      const ket = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: false,
      });
      if (!ket.canceled && ket.assets[0]) {
        datAnh(await giuAnh(ket.assets[0].uri));
        datDaLuu(false);
      }
    } catch {
      hoi('Chưa mở được thư viện ảnh', 'Thử lại giúp tôi.');
    }
  }

  function xong() {
    // Gói cả nét lẫn lời kể vào một chuỗi JSON. Đọc lại thì thử phân tích; bản
    // cũ chỉ cất chữ nên phải chịu được cả hai dạng — xem `docTrang`.
    const noi = JSON.stringify({ net, ghi: ghi.trim(), w: co.w, h: co.h, ...(anh ? { anh } : {}) });
    if (dangSua) suaBuoi(dangSua, { noiDung: noi });
    else ghiBuoi('ve', 180, noi);
    donDep();
    datDaLuu(true);
  }

  function moSua(t: BuoiThucHanh) {
    const d = docTrang(t.noiDung);
    datDangSua(t.ma);
    datNet(d.net);
    datGhi(d.ghi);
    datAnh(d.anh ?? null);
    if (d.co) datCo(d.co);
    datDaLuu(false);
  }

  function hoiXoa(t: BuoiThucHanh) {
    hoi('Xoá bức này?', 'Bức đã xoá không lấy lại được.', [
      { nhan: 'Thôi', kieu: 'bo' },
      {
        nhan: 'Xoá',
        kieu: 'manh',
        onPress: () => {
          xoaBuoi(t.ma);
          if (dangSua === t.ma) donDep();
        },
      },
    ]);
  }

  return (
    <ManHinh tieuDe="Vẽ và chụp" phu="Vài phút thả tay, không ai chấm điểm." quayLai>
      <View className="gap-5">
        <Khoi vien>
          <Nhan>Hôm nay vẽ gì</Nhan>
          <Text
            style={{ fontFamily: CHU.hoaDam, fontSize: 22, lineHeight: 30 }}
            className="mt-1 text-chu-chinh">
            {de}
          </Text>
        </Khoi>

        <KhungVe net={net} datNet={(n) => { datNet(n); datDaLuu(false); }} datCo={datCo} />

        {anh ? (
          <View>
            <Image
              source={{ uri: anh }}
              style={{ width: '100%', height: 220, borderRadius: 16 }}
              contentFit="cover"
            />
            <Nut nhan="Bỏ tấm ảnh này" kieu="nhe" onPress={() => datAnh(null)} />
          </View>
        ) : (
          <Nut nhan="Đính một tấm ảnh" kieu="vien" onPress={() => void chonAnh()} />
        )}

        <TextInput
          value={ghi}
          onChangeText={(t) => {
            datGhi(t);
            datDaLuu(false);
          }}
          multiline
          textAlignVertical="top"
          placeholder="Kể một dòng về thứ bạn vừa vẽ, nếu muốn."
          placeholderTextColor={MAU.chuMo}
          style={{
            fontFamily: CHU.than,
            minHeight: 90,
            color: MAU.chuChinh,
            borderColor: MAU.vien,
          }}
          className="rounded-2xl border bg-nen-nhat p-4 text-base leading-6"
        />

        <Nut nhan={dangSua ? 'Lưu thay đổi' : 'Cất vào nhật ký'} onPress={xong} tat={!coGi} />
        {dangSua ? <Nut nhan="Thôi, vẽ bức mới" kieu="nhe" onPress={donDep} /> : null}
        {daLuu ? (
          <Text style={{ fontFamily: CHU.than }} className="text-center text-sm text-chu-phu">
            Đã cất.
          </Text>
        ) : null}

        {trang.length ? (
          <View className="mt-4 gap-3">
            <Nhan>Đã vẽ</Nhan>
            {trang.slice(0, 12).map((t) => {
              const doc = docTrang(t.noiDung);
              return (
                <Pressable key={t.ma} onPress={() => moSua(t)} onLongPress={() => hoiXoa(t)}>
                  <Khoi>
                    <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
                      {t.ngay}
                    </Text>
                    {doc.net.length ? (
                      <View className="mt-2">
                        <XemLaiNet net={doc.net} co={doc.co} />
                      </View>
                    ) : null}
                    {doc.anh ? (
                      <Image
                        source={{ uri: doc.anh }}
                        style={{ width: '100%', height: 160, borderRadius: 12, marginTop: 8 }}
                        contentFit="cover"
                      />
                    ) : null}
                    {doc.ghi ? (
                      <Text
                        style={{ fontFamily: CHU.than }}
                        className="mt-2 text-sm leading-6 text-chu-chinh">
                        {doc.ghi}
                      </Text>
                    ) : null}
                  </Khoi>
                </Pressable>
              );
            })}

            <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
              Chạm một bức để vẽ tiếp, nhấn giữ để xoá.
            </Text>
          </View>
        ) : null}
      </View>
    </ManHinh>
  );
}

/**
 * Đọc một trang đã cất.
 *
 * Bản trước cất thẳng chữ, bản này cất JSON có cả nét. Đọc lên phải chịu được
 * cả hai dạng, không thì người đã dùng bản cũ mở ra thấy một đống dấu ngoặc.
 */
function docTrang(noi: string | undefined): {
  net: Net[];
  ghi: string;
  co?: { w: number; h: number };
  anh?: string;
} {
  if (!noi) return { net: [], ghi: '' };
  try {
    const d = JSON.parse(noi);
    if (d && typeof d === 'object' && Array.isArray(d.net)) {
      const co = typeof d.w === 'number' && typeof d.h === 'number' ? { w: d.w, h: d.h } : undefined;
      return {
        net: d.net as Net[],
        ghi: typeof d.ghi === 'string' ? d.ghi : '',
        co,
        ...(typeof d.anh === 'string' ? { anh: d.anh } : {}),
      };
    }
  } catch {
    // Không phải JSON thì nó là chữ của bản cũ.
  }
  return { net: [], ghi: noi };
}
