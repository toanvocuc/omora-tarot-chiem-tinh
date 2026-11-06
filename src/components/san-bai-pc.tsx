/**
 * Bố cục hai cột của bản máy tính: sân bài bên trái, bảng đọc bên phải.
 *
 * Màn kết quả trải bài và màn lá bài hôm nay trong bản mẫu dùng CHUNG một bố
 * cục: lưới `1.65fr / 1fr`, bên trái là một sân tròn có lá bài đứng giữa, bên
 * phải là bảng chữ có thanh thẻ Ý nghĩa / Tình cảm / Công việc / Lời khuyên.
 * Gom vào đây để hai màn không trôi khác nhau.
 *
 * Mọi con số đo thẳng từ mã nguồn bản mẫu (`style.css`, `celestial.css`):
 *
 *   sân      bo 17, viền #57424f, cao tối thiểu 410, đệm 34, khe 30
 *   vòng     hai vòng tròn 340 và 280, viền vàng rất mờ
 *   lá       154x268, viền 4 màu #c7b486, bo 6
 *   bảng     bo 17, đệm 26, nền chuyển sắc 135 độ
 *   thẻ      chữ 11, đệm 13/18, gạch chân 2 khi đang mở
 *   tiêu đề  28, đoạn 14 cách dòng 1,9
 *
 * Ngoài máy tính thì mọi thứ ở đây trả về bố cục dọc như cũ, nên bản điện
 * thoại và hai bản app không đổi.
 */

import { Platform, Pressable, Text, View } from 'react-native';

import { CHU, MAU } from '@/constants/giao-dien';
import { useManPC } from '@/constants/khung-web';

/** Viền của sân và của bảng — sáng hơn viền thẻ thường một bậc. */
const VIEN_SAN = '#57424F';
/** Nền sân: tím nhạt ở giữa loang ra tím đậm. */
const NEN_SAN = 'radial-gradient(ellipse at center, #3D2D47 0%, #21192F 70%)';
/** Nền bảng đọc: chuyển sắc chéo, nhạt ở góc trên trái. */
const NEN_BANG = 'linear-gradient(135deg, #21192F, #1C1628)';

/** Hai cột 1.65 / 1. Dưới ngưỡng máy tính thì xếp dọc. */
export function HaiCot({ trai, phai }: { trai: React.ReactNode; phai: React.ReactNode }) {
  const pc = useManPC();
  if (!pc) {
    return (
      <View>
        {trai}
        <View className="mt-6">{phai}</View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 24 }}>
      <View style={{ flex: 1.65 }}>{trai}</View>
      <View style={{ flex: 1, minWidth: 280 }}>{phai}</View>
    </View>
  );
}

/**
 * Sân bài: khung tròn có hai vòng vàng mờ, lá bài đứng giữa.
 *
 * Nền loang tròn phải vẽ bằng một thẻ `div` — `expo-linear-gradient` chỉ làm
 * được chuyển sắc thẳng, mà cái đáng giá ở đây đúng là độ loang TRÒN quanh lá
 * bài. Nhánh này chỉ chạy trên web nên `div` là hợp lệ; xem thêm ghi chú đầu
 * `components/khung-pc`.
 */
export function SanBai({ children }: { children: React.ReactNode }) {
  const pc = useManPC();
  if (!pc) return <View className="items-center">{children}</View>;

  return (
    <View
      style={{
        minHeight: 410,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: VIEN_SAN,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 34,
      }}>
      {Platform.OS === 'web' ? (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: NEN_SAN, pointerEvents: 'none' }}
        />
      ) : null}

      <Vong co={340} mau="#C9A34F30" />
      <Vong co={280} mau="#A4803C1C" />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 30 }}>{children}</View>
    </View>
  );
}

/** Một vòng tròn viền mỏng, nằm giữa sân, không ăn chạm. */
function Vong({ co, mau }: { co: number; mau: string }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: co,
        height: co,
        borderRadius: co / 2,
        borderWidth: 1,
        borderColor: mau,
      }}
    />
  );
}

/** Bảng chữ bên phải. */
export function BangDoc({ children }: { children: React.ReactNode }) {
  const pc = useManPC();
  if (!pc) return <>{children}</>;

  return (
    <View
      style={{
        borderRadius: 17,
        borderWidth: 1,
        borderColor: MAU.vien,
        padding: 26,
        overflow: 'hidden',
      }}>
      {Platform.OS === 'web' ? (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: NEN_BANG, pointerEvents: 'none' }}
        />
      ) : null}
      {children}
    </View>
  );
}

/**
 * Thanh thẻ của bảng đọc.
 *
 * CHỈ dựng trên máy tính. Trên điện thoại bốn mục này nằm thành bốn khối xếp
 * dọc — đọc một mạch, không phải bấm. Đổi bản điện thoại sang thẻ là bắt
 * khách bấm thêm ba lần để đọc hết cùng một nội dung.
 */
export function ThanhThe({
  cac,
  dang,
  doi,
}: {
  cac: readonly string[];
  dang: number;
  doi: (i: number) => void;
}) {
  return (
    <View
      style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: MAU.vien }}
      className="mb-6">
      {cac.map((ten, i) => (
        <Pressable
          key={ten}
          onPress={() => doi(i)}
          accessibilityRole="tab"
          accessibilityState={{ selected: i === dang }}
          style={{
            paddingVertical: 13,
            paddingHorizontal: 18,
            borderBottomWidth: 2,
            borderBottomColor: i === dang ? MAU.vang : 'transparent',
            marginBottom: -1,
          }}
          className="active:opacity-70">
          <Text
            style={{
              fontFamily: i === dang ? CHU.thanDam : CHU.thanVua,
              fontSize: 11,
              letterSpacing: 1.1,
              color: i === dang ? MAU.vangSang : MAU.chuMo,
            }}
            className="uppercase">
            {ten}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}


/**
 * Cột chính co giãn, cột phụ rộng cố định 310 — bản mẫu gọi là `main-aside`.
 *
 * Khác `HaiCot` ở chỗ cột phụ KHÔNG co: nó chứa nút bấm và vài dòng số, rộng
 * hơn thì chữ loãng, hẹp hơn thì nút xuống dòng.
 */
export function CotChinhPhu({ chinh, phu }: { chinh: React.ReactNode; phu: React.ReactNode }) {
  const pc = useManPC();
  if (!pc) {
    return (
      <View>
        {chinh}
        <View className="mt-6">{phu}</View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 24 }}>
      <View style={{ flex: 1 }}>{chinh}</View>
      <View style={{ width: 310 }}>{phu}</View>
    </View>
  );
}
