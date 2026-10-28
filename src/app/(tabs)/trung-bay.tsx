/**
 * Khu trưng bày — hàng của cửa hàng.
 *
 * App chỉ BÀY RA. Không có giỏ hàng gửi lên máy chủ, không có đơn, không hỏi tên
 * hay số điện thoại của ai. Khách gom món vào danh sách nằm ngay trên máy mình
 * rồi tự hỏi cửa hàng qua Zalo. Xem migration 0027 để biết vì sao ranh giới đó
 * là thứ quyết định cả thiết kế.
 *
 * Hai phần: dải NỔI BẬT TUẦN NÀY trên đầu, rồi tất cả hàng phía dưới. Món nổi
 * bật vẫn nằm luôn trong phần tất cả — khách cuộn từ trên xuống không phải nhớ
 * món nào đã thấy rồi.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { KhoiGia } from '@/components/gia-giam';
import { DangTai, ManHinh, Nhan, Trong, VanNgan } from '@/components/nen';
import { CHU, MAU } from '@/constants/giao-dien';
import { useQuanTam } from '@/lib/quan-tam';
import { anhSanPham, useSanPham, type SanPham } from '@/lib/san-pham';

export default function TrungBay() {
  const { dong, loi, dangTai } = useSanPham();
  const quanTam = useQuanTam();

  const { noiBat, tatCa } = useMemo(() => {
    const ds = dong ?? [];
    return { noiBat: ds.filter((x) => x.noi_bat), tatCa: ds };
  }, [dong]);

  const soMon = quanTam.reduce((t, m) => t + m.soLuong, 0);

  return (
    <ManHinh tieuDe="Shop" phu="Đá phong thuỷ, ngọc và đồ bày của cửa hàng.">
      {/* Lối vào danh sách quan tâm. Chỉ hiện khi đã gom được món nào — chưa gom
          gì mà bày một cái thùng rỗng ra thì chỉ tổ làm khách thắc mắc. */}
      {soMon > 0 ? (
        <Pressable
          onPress={() => router.push('/quan-tam')}
          style={{ borderColor: MAU.vang }}
          className="mb-6 flex-row items-center justify-between rounded-2xl border bg-nen-nhat px-4 py-3.5 active:opacity-70">
          <View className="flex-1 flex-row items-center gap-2.5">
            <Ionicons name="bookmark" size={17} color={MAU.vang} />
            <Text style={{ fontFamily: CHU.thanDam }} className="text-sm text-chu-chinh">
              Danh sách quan tâm
            </Text>
            <Text style={{ fontFamily: CHU.than }} className="text-sm text-chu-mo">
              {soMon} món
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={MAU.vang} />
        </Pressable>
      ) : null}

      {dangTai ? <DangTai /> : null}

      {loi ? <Trong loi={`Chưa tải được danh sách hàng. ${loi}`} /> : null}

      {dong && tatCa.length === 0 ? (
        <Trong loi="Cửa hàng chưa bày món nào. Quay lại sau giúp tôi." />
      ) : null}

      {noiBat.length > 0 ? (
        <View className="mb-2">
          <TieuDeNoiBat />
          <DaiNoiBat ds={noiBat} />
          <VanNgan />
        </View>
      ) : null}

      {tatCa.length > 0 ? (
        <View>
          <Nhan>Tất cả hàng ({tatCa.length})</Nhan>
          <View className="mt-3 gap-3">
            {tatCa.map((s) => (
              <TheDoc key={s.ma} mon={s} />
            ))}
          </View>
        </View>
      ) : null}

      <Text
        style={{ fontFamily: CHU.than }}
        className="mt-10 text-center text-[11px] leading-5 text-chu-mo">
        Giá có thể đổi theo từng đợt hàng. Bạn gửi danh sách quan tâm cho cửa hàng để được
        báo giá và cách gửi hàng.
      </Text>
    </ManHinh>
  );
}

/**
 * Tiêu đề dải nổi bật: cái loa và dòng chữ nhún lên xuống.
 *
 * Nhún nhẹ và CHẬM, biên độ bốn điểm ảnh. Mấy sàn nhảy giật cục vì họ có hàng
 * chục thứ tranh nhau sự chú ý; ở đây chỉ có một dải, nhảy mạnh thì thành rẻ
 * tiền chứ không thành nổi bật.
 *
 * Máy bật mục giảm chuyển động thì đứng yên — đúng loại chuyển động lặp vô tận
 * mà mục đó sinh ra để tắt.
 */
function TieuDeNoiBat() {
  const nhun = useSharedValue(0);
  const giamChuyenDong = useReducedMotion();

  useEffect(() => {
    if (giamChuyenDong) return;
    nhun.value = withRepeat(
      withSequence(withTiming(-4, { duration: 460 }), withTiming(0, { duration: 460 })),
      -1
    );
    // `nhun` là ô nhớ dùng chung của reanimated, không bao giờ đổi danh tính.
    // Khai vào danh sách phụ thuộc thì trình biên dịch React coi nó là chỉ-đọc
    // và chặn luôn phép gán ngay dòng trên.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [giamChuyenDong]);

  const kieu = useAnimatedStyle(() => ({ transform: [{ translateY: nhun.value }] }));

  return (
    <Animated.View style={kieu} className="flex-row items-center gap-2">
      <Ionicons name="megaphone" size={17} color={MAU.giam} />
      <Text
        style={{ fontFamily: CHU.thanDam, letterSpacing: 1.6, color: MAU.giam, fontSize: 13 }}
        className="uppercase">
        Nổi bật tuần này
      </Text>
    </Animated.View>
  );
}

/** Đệm hai bên của `ManHinh`, cần để tính bề ngang một thẻ. */
const LE_MAN = 20;
/** Khe giữa hai thẻ trong dải. */
const KHE = 12;
/** Không ai vuốt trong bấy nhiêu mili giây thì tự sang món kế. */
const CHO_TU_CHAY = 4000;

/**
 * Dải NỔI BẬT TUẦN NÀY: vuốt ngang, và tự chạy khi không ai đụng tới.
 *
 * ───────────────────────────────────────── VÌ SAO HẸN GIỜ CHỨ KHÔNG ĐẶT NHỊP
 *
 * `setInterval` thì nhịp chạy đều bất kể người dùng làm gì: vừa vuốt xong là
 * có thể bị nhảy tiếp ngay sau một phần mười giây, vì nhịp cũ sắp tới. Yêu cầu
 * là "không vuốt trong 4 giây", tức là đếm lại từ lần đụng cuối — mà cái đó chỉ
 * có hẹn giờ đặt lại được mới làm đúng.
 *
 * `dungLai` là TRẠNG THÁI chứ không phải mốc: đổi trạng thái thì hiệu ứng chạy
 * lại và dọn luôn hẹn giờ cũ. Để mốc thì hẹn giờ cũ vẫn nổ giữa lúc tay đang
 * vuốt.
 *
 * Máy bật mục giảm chuyển động thì KHÔNG tự chạy. Một thứ tự động trượt ngang
 * là đúng loại chuyển động mà mục đó sinh ra để tắt.
 */
function DaiNoiBat({ ds }: { ds: SanPham[] }) {
  const { width } = useWindowDimensions();
  const rong = Math.max(240, width - LE_MAN * 2);
  const buoc = rong + KHE;
  const cuon = useRef<ScrollView>(null);
  const [o, datO] = useState(0);
  const [dungLai, datDungLai] = useState(false);
  const giamChuyenDong = useReducedMotion();

  const tuChay = ds.length > 1 && !giamChuyenDong && !dungLai;

  useEffect(() => {
    if (!tuChay) return;
    const hen = setTimeout(() => {
      const moi = (o + 1) % ds.length;
      datO(moi);
      cuon.current?.scrollTo({ x: moi * buoc, animated: true });
    }, CHO_TU_CHAY);
    return () => clearTimeout(hen);
  }, [tuChay, o, ds.length, buoc]);

  // Màn xoay ngang hay đổi bề rộng thì giữ nguyên món đang xem.
  useEffect(() => {
    cuon.current?.scrollTo({ x: o * buoc, animated: false });
    // Chỉ chạy khi bề ngang đổi, không chạy theo `o` — `o` đã có hẹn giờ lo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buoc]);

  const xongVuot = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const moi = Math.round(e.nativeEvent.contentOffset.x / buoc);
      datO(Math.min(ds.length - 1, Math.max(0, moi)));
      // Thả tay ra thì đếm lại từ đầu bốn giây.
      datDungLai(false);
    },
    [buoc, ds.length]
  );

  /**
   * Chốt lại khi CUỘN ĐÃ DỪNG, vì trên web hai chỗ chốt kia không bao giờ chạy.
   *
   * `ScrollViewBase` của react-native-web chỉ gọi đúng một thứ: `onScroll`.
   * `onMomentumScrollEnd` và `onScrollEndDrag` được truyền xuống nhưng không
   * có mã nào phát ra chúng — đọc
   * `node_modules/react-native-web/dist/exports/ScrollView/ScrollViewBase.js`.
   *
   * Thiếu chỗ này thì trên web mấy chấm chỉ vị trí không chạy theo tay khách,
   * và bộ đếm tự chạy vẫn tưởng đang ở món cũ nên bốn giây sau nó giật dải về
   * đúng chỗ khách vừa vuốt đi. Cùng một lỗi với bánh xe chọn giờ.
   */
  const henCuon = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dangCuon = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      if (henCuon.current) clearTimeout(henCuon.current);
      henCuon.current = setTimeout(() => {
        henCuon.current = null;
          const moi = Math.min(ds.length - 1, Math.max(0, Math.round(x / buoc)));
        datO(moi);

        /**
         * TỰ KÉO VỀ THẺ. `snapToInterval` KHÔNG chạy trên web.
         *
         * Đo trên omorasoul.com: khung cuộn có `scroll-snap-type: none`, nên
         * buông tay giữa hai thẻ là nó nằm lì đúng chỗ đó — màn hiện nửa thẻ
         * này ghép nửa thẻ kia, tên hàng bị cắt cụt ở cả hai mép. Đúng cảnh
         * sếp chê, và là cùng một lỗi với bánh xe chọn ngày.
         *
         * Mấy chấm chỉ vị trí thì vẫn đúng vì chúng làm tròn — nên nhìn vào
         * tưởng dải đang ở thẻ số hai, mà mắt lại thấy hai nửa thẻ.
         */
        const dich = moi * buoc;
        if (Math.abs(x - dich) > 0.5) cuon.current?.scrollTo({ x: dich, animated: true });

        datDungLai(false);
      }, 180);
    },
    [buoc, ds.length]
  );

  useEffect(
    () => () => {
      if (henCuon.current) clearTimeout(henCuon.current);
    },
    []
  );

  return (
    <View className="mt-3">
      <ScrollView
        ref={cuon}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={buoc}
        snapToAlignment="start"
        decelerationRate="fast"
        onScrollBeginDrag={() => datDungLai(true)}
        onScroll={dangCuon}
        scrollEventThrottle={16}
        onMomentumScrollEnd={xongVuot}
        // Vuốt xong mà không có quán tính thì `onMomentumScrollEnd` không nổ,
        // và dải sẽ đứng im mãi. Bắt thêm ở đây cho chắc.
        onScrollEndDrag={xongVuot}>
        {ds.map((mon, i) => (
          <View key={mon.ma} style={{ width: rong, marginRight: i === ds.length - 1 ? 0 : KHE }}>
            <TheNoiBat mon={mon} />
          </View>
        ))}
      </ScrollView>

      {/* Mấy chấm cho biết đang ở món thứ mấy. Không có thì khách vuốt mà
          không biết còn bao nhiêu món nữa. */}
      {ds.length > 1 ? (
        <View className="mt-3 flex-row justify-center gap-1.5">
          {ds.map((mon, i) => (
            <View
              key={mon.ma}
              style={{
                width: i === o ? 18 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === o ? MAU.vang : MAU.vien,
              }}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** Thẻ to, ảnh nằm trên — một món trong dải nổi bật. */
function TheNoiBat({ mon }: { mon: SanPham }) {
  const anh = anhSanPham(mon.anh);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/san-pham', params: { ma: mon.ma } })}
      style={{ borderColor: MAU.vangMo }}
      className="overflow-hidden rounded-2xl border bg-nen-nhat active:opacity-80">
      {anh ? (
        <Image source={{ uri: anh }} style={{ width: '100%', height: 210 }} contentFit="cover" />
      ) : null}
      <View className="px-4 py-3.5">
        <Text
          numberOfLines={2}
          style={{ fontFamily: CHU.hoaDam, fontSize: 19, lineHeight: 25 }}
          className="text-chu-chinh">
          {mon.ten}
        </Text>
        <View className="mt-1.5">
          <KhoiGia gia={mon.gia} giaTruoc={mon.gia_truoc} donVi={mon.don_vi} />
        </View>
      </View>
    </Pressable>
  );
}

/** Thẻ gọn, ảnh vuông bên trái — dùng cho danh sách tất cả hàng. */
function TheDoc({ mon }: { mon: SanPham }) {
  const anh = anhSanPham(mon.anh);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/san-pham', params: { ma: mon.ma } })}
      style={{ borderColor: MAU.vien }}
      className="flex-row items-center gap-3.5 overflow-hidden rounded-2xl border bg-nen-nhat p-3 active:opacity-70">
      {anh ? (
        <Image
          source={{ uri: anh }}
          style={{ width: 74, height: 74, borderRadius: 12 }}
          contentFit="cover"
        />
      ) : (
        <View
          style={{ width: 74, height: 74, borderRadius: 12, backgroundColor: MAU.nen }}
          className="items-center justify-center">
          <Ionicons name="image-outline" size={22} color={MAU.chuMo} />
        </View>
      )}
      <View className="flex-1">
        <Text
          numberOfLines={2}
          style={{ fontFamily: CHU.thanDam }}
          className="text-sm leading-5 text-chu-chinh">
          {mon.ten}
        </Text>
        <View className="mt-1">
          <KhoiGia gia={mon.gia} giaTruoc={mon.gia_truoc} donVi={mon.don_vi} />
        </View>
        {!mon.con_hang ? (
          <Text style={{ fontFamily: CHU.than }} className="mt-0.5 text-xs text-canh">
            Tạm hết hàng
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={MAU.chuMo} />
    </Pressable>
  );
}
