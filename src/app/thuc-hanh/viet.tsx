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
import { IconNet } from '@/components/icon-net';
import { Khoi, ManHinh, Nhan, Nut } from '@/components/nen';
import { HaiCot } from '@/components/san-bai-pc';
import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';
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
  const pc = useManPC();

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

  if (pc) {
    return (
      <ManHinh
        tieuDe="Để những điều trong lòng có chỗ ở"
        phu="Viết bao nhiêu tuỳ bạn. Trang này nằm trên máy của bạn, không gửi đi đâu."
        quayLai>
        {dangSua || tuDo ? (
          <View className="mb-6 items-center">
            <Pressable
              onPress={donDep}
              accessibilityRole="button"
              style={{ borderColor: MAU.vangMo, borderWidth: 1, borderRadius: 30, minHeight: 40 }}
              className="flex-row items-center gap-2 px-5 active:opacity-70">
              <IconNet ten="them" co={15} mau={MAU.vang} />
              <Text style={{ fontFamily: CHU.thanVua, fontSize: 13 }} className="text-vang">
                Trang mới
              </Text>
            </Pressable>
          </View>
        ) : null}

        <HaiCot
          trai={
            <Khoi>
              <View className="flex-row items-center justify-between">
                <Nhan>{dangSua ? 'Trang đã viết' : 'Câu hỏi hôm nay'}</Nhan>
                <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-chu-mo">
                  {ngay.split('-').reverse().join('.')}
                </Text>
              </View>

              <Text
                style={{ fontFamily: CHU.hoaDam, fontSize: 25, lineHeight: 34 }}
                className="text-chu-chinh">
                {tuDo || dangSua ? 'Hôm nay bạn muốn viết điều gì?' : de}
              </Text>

              <View className="mt-6 flex-row items-center justify-between">
                <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-chu-mo">
                  Hôm nay trong lòng thế nào?
                </Text>
                {dangSua ? null : (
                  <Pressable onPress={() => datTuDo((v) => !v)} className="active:opacity-70">
                    <Text style={{ fontFamily: CHU.thanVua, fontSize: 13 }} className="text-vang">
                      {tuDo ? 'Trở lại câu hỏi' : 'Viết tự do'}
                    </Text>
                  </Pressable>
                )}
              </View>

              <View className="mt-3 flex-row gap-2">
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
                      accessibilityRole="button"
                      accessibilityState={{ selected: chon }}
                      style={{
                        borderColor: chon ? MAU.vang : MAU.vien,
                        borderWidth: 1,
                        borderRadius: 11,
                        backgroundColor: chon ? MAU.vangRatMo : 'transparent',
                      }}
                      className="flex-1 items-center px-1 py-3 active:opacity-70">
                      <Text
                        style={{ fontFamily: CHU.than, fontSize: 12, textAlign: 'center' }}
                        className={chon ? 'text-vang' : 'text-chu-phu'}>
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={chu}
                onChangeText={(t) => {
                  datChu(t);
                  datDaLuu(false);
                }}
                multiline
                textAlignVertical="top"
                placeholder="Bạn có thể bắt đầu từ một chuyện rất nhỏ…"
                placeholderTextColor={MAU.chuMo}
                style={{
                  fontFamily: CHU.than,
                  minHeight: 230,
                  color: MAU.chuChinh,
                  borderColor: MAU.vien,
                  borderWidth: 1,
                  borderRadius: 13,
                  lineHeight: 29,
                }}
                className="mt-6 bg-nen-nhat p-4 text-[15px]"
              />

              <View className="mt-5 flex-row items-center justify-between">
                <Text style={{ fontFamily: CHU.than, fontSize: 12 }} className="text-chu-mo">
                  {chu.length} ký tự
                </Text>
                <Pressable
                  onPress={luu}
                  disabled={!du}
                  accessibilityRole="button"
                  style={{
                    backgroundColor: MAU.vang,
                    borderRadius: 11,
                    minHeight: 44,
                    opacity: du ? 1 : 0.45,
                  }}
                  className="flex-row items-center gap-2 px-5 active:opacity-80">
                  <IconNet ten="sach" co={16} mau={MAU.nen} />
                  <Text style={{ fontFamily: CHU.thanDam, color: MAU.nen }} className="text-sm">
                    {dangSua ? 'Lưu thay đổi' : 'Cất vào nhật ký'}
                  </Text>
                </Pressable>
              </View>

              {daLuu ? (
                <Text
                  style={{ fontFamily: CHU.than, fontSize: 13 }}
                  className="mt-3 text-center text-chu-phu">
                  Đã cất.
                </Text>
              ) : null}
            </Khoi>
          }
          phai={
            <Khoi>
              <Nhan>Những trang đã viết</Nhan>
              <TextInput
                value={tim}
                onChangeText={datTim}
                placeholder="Tìm một trang…"
                placeholderTextColor={MAU.chuMo}
                style={{
                  fontFamily: CHU.than,
                  color: MAU.chuChinh,
                  borderColor: MAU.vien,
                  borderWidth: 1,
                  borderRadius: 11,
                  paddingHorizontal: 14,
                  minHeight: 44,
                }}
                className="bg-nen-nhat text-[14px]"
              />

              {hienRa.length === 0 ? (
                <View className="items-center py-10">
                  <IconNet ten="sach" co={26} mau={MAU.vangSang} />
                  <Text
                    style={{ fontFamily: CHU.than, fontSize: 12, lineHeight: 20 }}
                    className="mt-3 text-center text-chu-mo">
                    {tim
                      ? 'Không có trang nào phù hợp.'
                      : 'Trang đầu tiên của bạn sẽ xuất hiện ở đây.'}
                  </Text>
                </View>
              ) : (
                <View className="mt-4 gap-3">
                  {hienRa.slice(0, 20).map((t) => (
                    <View key={t.ma} className="flex-row items-start gap-2">
                      <Pressable
                        onPress={() => moSua(t)}
                        style={{ borderColor: MAU.vien, borderWidth: 1, borderRadius: 11 }}
                        className="flex-1 p-3 active:opacity-70">
                        <Text
                          style={{ fontFamily: CHU.than, fontSize: 11 }}
                          className="text-chu-mo">
                          {t.ngay}
                          {t.tamTrang ? ` · ${TAM_TRANG[t.tamTrang - 1]}` : ''}
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={{ fontFamily: CHU.than, fontSize: 13, lineHeight: 21 }}
                          className="mt-1 text-chu-phu">
                          {t.noiDung || '(chỉ chấm tâm trạng)'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => hoiXoa(t)}
                        accessibilityRole="button"
                        accessibilityLabel="Xoá trang nhật ký"
                        hitSlop={8}
                        className="pt-3 active:opacity-60">
                        <IconNet ten="thungRac" co={16} mau={MAU.chuMo} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Khoi>
          }
        />
      </ManHinh>
    );
  }

  return (
    <ManHinh tieuDe="Viết" phu="Mỗi ngày một câu hỏi, trả lời bao nhiêu tuỳ bạn." quayLai>
      <View className="gap-5">
        {!tuDo && !dangSua ? (
          <Khoi vien>
            <Nhan>Câu hỏi hôm nay</Nhan>
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
          style={{
            fontFamily: CHU.than,
            minHeight: 170,
            color: MAU.chuChinh,
            borderColor: MAU.vien,
          }}
          className="rounded-2xl border bg-nen-nhat p-4 text-base leading-6"
        />

        <Nut
          nhan={dangSua ? 'Lưu thay đổi' : 'Cất vào nhật ký'}
          onPress={luu}
          tat={!du}
        />

        {dangSua ? (
          <Nut nhan="Thôi, viết mục mới" kieu="nhe" onPress={donDep} />
        ) : !tuDo ? (
          <Nut nhan="Viết chuyện khác" kieu="nhe" onPress={() => datTuDo(true)} />
        ) : (
          <Nut nhan="Quay lại câu hỏi hôm nay" kieu="nhe" onPress={() => datTuDo(false)} />
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
