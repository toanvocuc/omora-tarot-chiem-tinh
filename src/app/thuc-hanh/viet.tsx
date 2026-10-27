/**
 * Viết — mỗi ngày một câu hỏi, khách tự trả lời.
 *
 * ─────────────────────────────────────────────── GHI LẠI, KHÔNG DIỄN GIẢI
 *
 * App HỎI và GHI. Không câu nào đọc hộ ý nghĩa, không câu nào gọi tên bệnh,
 * không bao giờ có "tuần này bạn căng thẳng". Ghi lại là tự theo dõi, diễn giải
 * là chẩn đoán — mà không ai trong đội có chuyên môn để chẩn đoán.
 *
 * ──────────────────────────────────────────────── DƯỚI BA MƯƠI GIÂY MỘT MỤC
 *
 * Bài học lấy từ mấy app nhật ký sống được: ít ma sát quan trọng hơn nhiều tính
 * năng. Nên chấm tâm trạng một chạm là xong một mục — chữ nghĩa để tuỳ, và có
 * nút bỏ qua đề cho hôm nào muốn viết chuyện khác.
 *
 * Chữ viết ra nằm trên máy, không gửi đi đâu — xem đầu `lib/thuc-hanh.ts`.
 */

import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { hoi } from '@/lib/hoi-lai';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { DE_VIET, deCuaNgay } from '@/data/de-thuc-hanh';
import {
  cacTrang,
  ghiBuoi,
  ngayHomNay,
  nhomTheoThang,
  suaBuoi,
  TAM_TRANG,
  timTrang,
  useThucHanh,
  xoaBuoi,
  type BuoiThucHanh,
} from '@/lib/thuc-hanh';

/** Ngắn hơn chừng này, mà cũng không chấm tâm trạng, thì coi như chưa viết gì. */
const TOI_THIEU = 10;

export default function ManViet() {
  const buoi = useThucHanh();
  const ngay = ngayHomNay();
  const de = deCuaNgay(DE_VIET, ngay);

  const [chu, datChu] = useState('');
  const [tamTrang, datTamTrang] = useState<number | null>(null);
  const [tuDo, datTuDo] = useState(false);
  const [daLuu, datDaLuu] = useState(false);
  /** Mã trang đang sửa. Null là đang viết mục mới. */
  const [dangSua, datDangSua] = useState<string | null>(null);
  const [tim, datTim] = useState('');

  const trang = cacTrang(buoi).filter((b) => b.loai === 'viet');
  const hienRa = timTrang(trang, tim);
  const du = chu.trim().length >= TOI_THIEU || tamTrang !== null;

  function donDep() {
    datChu('');
    datTamTrang(null);
    datDangSua(null);
    datTuDo(false);
  }

  function luu() {
    if (dangSua) {
      suaBuoi(dangSua, { noiDung: chu.trim(), tamTrang: tamTrang ?? null });
    } else {
      ghiBuoi('viet', 120, chu.trim(), {
        ...(tamTrang ? { tamTrang } : {}),
        ...(tuDo ? {} : { de }),
      });
    }
    donDep();
    datDaLuu(true);
  }

  function moSua(t: BuoiThucHanh) {
    datDangSua(t.ma);
    datChu(t.noiDung ?? '');
    datTamTrang(t.tamTrang ?? null);
    datTuDo(!t.de);
    datDaLuu(false);
  }

  function hoiXoa(t: BuoiThucHanh) {
    hoi('Xoá trang này?', 'Trang đã xoá không lấy lại được.', [
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
    <ManHinh tieuDe="Viết" phu="Mỗi ngày một câu hỏi, trả lời bao nhiêu tuỳ bạn." quayLai>
      <View className="gap-5">
        {!tuDo && !dangSua ? (
          <Khoi vien>
            <Nhan>Đề hôm nay</Nhan>
            <Text
              style={{ fontFamily: CHU.hoaDam, fontSize: 22, lineHeight: 30 }}
              className="mt-1 text-chu-chinh">
              {de}
            </Text>
          </Khoi>
        ) : null}

        <View>
          <Nhan>Hôm nay trong lòng thế nào</Nhan>
          <View className="mt-2 flex-row gap-2">
            {TAM_TRANG.map((t, i) => {
              const muc = i + 1;
              const chon = tamTrang === muc;
              return (
                <Pressable
                  key={t}
                  onPress={() => {
                    datTamTrang(chon ? null : muc);
                    datDaLuu(false);
                  }}
                  style={{
                    borderColor: chon ? MAU.vang : MAU.vien,
                    borderWidth: chon ? 2 : 1,
                    backgroundColor: chon ? MAU.vangRatMo : 'transparent',
                  }}
                  className="flex-1 items-center rounded-xl px-1 py-3 active:opacity-70">
                  <Text
                    style={{ fontFamily: CHU.than, fontSize: 11, textAlign: 'center' }}
                    className={chon ? 'text-vang' : 'text-chu-phu'}>
                    {t}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <TextInput
          value={chu}
          onChangeText={(t) => {
            datChu(t);
            datDaLuu(false);
          }}
          multiline
          textAlignVertical="top"
          placeholder={
            tuDo || dangSua
              ? 'Viết bất cứ điều gì. Trang này chỉ mình bạn đọc.'
              : 'Viết bao nhiêu cũng được. Trang này chỉ mình bạn đọc.'
          }
          placeholderTextColor={MAU.chuMo}
          style={{ fontFamily: CHU.than, minHeight: 170, color: MAU.chuChinh }}
          className="rounded-2xl bg-nen-nhat p-4 text-base leading-6"
        />

        <Nut
          nhan={dangSua ? 'Lưu thay đổi' : 'Cất vào nhật ký'}
          onPress={luu}
          tat={!du}
        />

        {dangSua ? (
          <Nut nhan="Thôi, viết mục mới" kieu="nhe" onPress={donDep} />
        ) : !tuDo ? (
          <Nut nhan="Để đề đó, viết chuyện khác" kieu="nhe" onPress={() => datTuDo(true)} />
        ) : (
          <Nut nhan="Quay lại đề hôm nay" kieu="nhe" onPress={() => datTuDo(false)} />
        )}

        {daLuu ? (
          <Text style={{ fontFamily: CHU.than }} className="text-center text-sm text-chu-phu">
            Đã cất.
          </Text>
        ) : null}

        {trang.length ? (
          <View className="mt-6 gap-3">
            <Nhan>{`Đã viết — ${trang.length} trang`}</Nhan>

            {trang.length >= 5 ? (
              <TextInput
                value={tim}
                onChangeText={datTim}
                placeholder="Tìm trong những gì đã viết"
                placeholderTextColor={MAU.chuMo}
                style={{ fontFamily: CHU.than, color: MAU.chuChinh }}
                className="rounded-xl bg-nen-nhat px-4 py-3 text-sm"
              />
            ) : null}

            {hienRa.length === 0 ? (
              <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-phu">
                Không có trang nào khớp.
              </Text>
            ) : (
              nhomTheoThang(hienRa).map((nhom) => (
                <View key={nhom.thang} className="gap-3">
                  <Text
                    style={{ fontFamily: CHU.thanDam }}
                    className="mt-2 text-sm text-chu-phu">
                    {docThang(nhom.thang)}
                  </Text>
                  {nhom.dong.map((t) => (
                    <Pressable key={t.ma} onPress={() => moSua(t)} onLongPress={() => hoiXoa(t)}>
                      <Khoi>
                        <View className="flex-row items-center justify-between">
                          <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
                            {t.ngay}
                          </Text>
                          {t.tamTrang ? (
                            <Text style={{ fontFamily: CHU.than }} className="text-xs text-vang">
                              {TAM_TRANG[t.tamTrang - 1]}
                            </Text>
                          ) : null}
                        </View>
                        {t.de ? (
                          <Text
                            style={{ fontFamily: CHU.than }}
                            className="mt-1 text-xs italic text-chu-mo">
                            {t.de}
                          </Text>
                        ) : null}
                        {t.noiDung ? (
                          <Text
                            style={{ fontFamily: CHU.than }}
                            className="mt-2 text-sm leading-6 text-chu-chinh">
                            {t.noiDung}
                          </Text>
                        ) : null}
                      </Khoi>
                    </Pressable>
                  ))}
                </View>
              ))
            )}

            <Text style={{ fontFamily: CHU.than }} className="text-xs text-chu-mo">
              Chạm một trang để sửa, nhấn giữ để xoá.
            </Text>
          </View>
        ) : null}
      </View>
    </ManHinh>
  );
}

function docThang(thang: string): string {
  const [n, t] = thang.split('-');
  return `Tháng ${Number(t)} năm ${n}`;
}
