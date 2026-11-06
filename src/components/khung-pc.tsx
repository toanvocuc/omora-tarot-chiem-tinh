/**
 * Khung hoa văn vàng của bản web trên máy tính.
 *
 * ────────────────────────────── VÌ SAO KHÔNG DÙNG `NenKhungVan` NHƯ ĐIỆN THOẠI
 *
 * `NenKhungVan` vẽ nguyên tấm `khung-hoa-van.jpg` bằng `contentFit="fill"`,
 * tức ép cả ảnh vừa khít khung. Trên điện thoại ảnh bị bóp ngang khoảng 30%
 * và không ai nhận ra, vì khung viền vốn đối xứng.
 *
 * Trên máy tính thì khác hẳn: ảnh tỷ lệ 840x1260 (0,67) mà khung ngang
 * 1420x900 (1,58) — kéo ngang gấp hơn hai lần rưỡi. Bốn góc trăng và mặt trời
 * giãn bè thành vệt. Đó đúng là thứ sếp chê ngày 06/11/2026: "ảnh background
 * bị kéo giãn nhìn xấu thật sự".
 *
 * ────────────────────────────── CÁCH LÀM ĐÚNG: CẮT CHÍN Ô
 *
 * `border-image` của CSS cắt ảnh thành chín ô. Bốn góc giữ nguyên kích thước
 * thật, bốn cạnh chỉ giãn theo MỘT chiều của chính nó, ô giữa làm nền. Nên
 * khung rộng bao nhiêu thì góc vẫn đúng hình. Bản mẫu làm đúng cách này, và
 * dùng đúng tấm ảnh này.
 *
 * React Native không có thuộc tính đó. Nhưng đây là nhánh CHỈ CHẠY TRÊN WEB,
 * mà trên web bộ dựng chính là react-dom — nên một thẻ `div` thường là lối
 * thoát hợp lệ và gọn nhất. Máy thật không bao giờ chạy tới đây.
 *
 * Mấy con số cắt và bề dày viền đo thẳng từ bản mẫu, đừng chỉnh mò.
 */

import { Platform, useWindowDimensions, View } from 'react-native';

import { soDoKhung, useManPC } from '@/constants/khung-web';

/**
 * Đường tới ảnh khung, lấy từ thư mục `public/` chứ không `require` từ
 * `assets/`.
 *
 * `Image.resolveAssetSource` của react-native KHÔNG tồn tại trên bản web của
 * dự án này — gọi vào là "resolveAssetSource is not a function" và cả trang
 * trắng, đã sập đúng một lần ngày 06/11/2026. Còn `expo-asset` thì đang nằm
 * trong `node_modules` mà KHÔNG khai trong `package.json`; dùng một gói không
 * khai là kiểu lỗi đã cháy một lượt build EAS.
 *
 * `public/` được `expo export` chép thẳng ra gốc trang, nên đường dẫn này
 * đúng cả lúc chạy thử lẫn trên omorasoul.com. Và nó CHỈ dùng ở nhánh web,
 * nên bản điện thoại không tải thêm gì.
 *
 * Chép tệp mới vào `public/` thì nhớ chép cả ở kho công khai.
 */
const ANH_KHUNG = '/khung-hoa-van.jpg';

/**
 * Đen TUYỆT ĐỐI, không phải `MAU.nenDen`.
 *
 * Nền khung và dải che phải cùng một màu với ruột tấm `khung-hoa-van.jpg` —
 * ảnh đó là nét vàng trên nền đen thuần. Dùng `MAU.nenDen` (#08060C) thì dải
 * che sáng hơn ruột ảnh đúng ba bậc, đủ để nổi lên thành hai hình chữ nhật
 * hai bên ngôi sao. Bản mẫu cũng dùng #000 ở cả hai chỗ.
 */
const DEN = '#000';

/**
 * Lớp hoa văn, nằm dưới nội dung.
 *
 * `border-image-slice: 560 420 550 fill` — cắt 560 điểm ảnh ở mép trên, 420 ở
 * hai mép bên, 550 ở mép dưới của ảnh gốc 1680x2520. `fill` giữ lại ô giữa
 * làm nền; thiếu nó thì giữa khung trong suốt và lòi nền trang ra.
 */
function HoaVan({ doc, ngang }: { doc: number; ngang: number }) {
  if (Platform.OS !== 'web') return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderWidth: `${doc}px ${ngang}px`,
        borderImageSource: `url(${ANH_KHUNG})`,
        borderImageSlice: '560 420 550 fill',
        borderImageRepeat: 'stretch',
      }}
    />
  );
}

/**
 * Dải che ở mép trên hoặc mép dưới, có mẩu hoa văn đúng tỷ lệ ở giữa.
 *
 * ─────────────────────────── VÌ SAO PHẢI CHE
 *
 * `border-image` cắt chín ô, nên bốn GÓC giữ đúng hình. Nhưng bốn CẠNH vẫn
 * bị kéo theo chiều của chúng: mẩu giữa mép trên rộng 840 điểm ảnh gốc bị
 * kéo ra 1094 trong khi cao 560 bị nén còn 217 — méo gấp hơn ba lần, và ngôi
 * sao ở giữa cạnh bẹt thành một vệt. Sếp chỉ đúng chỗ đó ngày 07/11/2026.
 *
 * Bản mẫu không chữa, mà CHE: một dải đen trải từ mép hoa văn bên này sang
 * bên kia, rồi dán lên giữa một mẩu ảnh cắt ở đúng tỷ lệ gốc.
 *
 * `o` và `cao` là khung cắt trong ảnh 1680x2520, lấy nguyên từ hai thẻ
 * `viewBox` của bản mẫu: mép trên 420,61 rộng 840 cao 150; mép dưới 420,2315
 * rộng 840 cao 140.
 */
function MuKhung({
  ngang,
  cach,
  cao,
  oY,
  oCao,
  duoi,
}: {
  /** Dải thụt vào hai bên bấy nhiêu — đúng bề dày hoa văn cạnh bên. */
  ngang: number;
  /** Cách mép trên (hoặc mép dưới) bấy nhiêu. */
  cach: number;
  /** Chiều cao dải. */
  cao: number;
  /** Mẩu ảnh: toạ độ Y và chiều cao trong ảnh gốc 1680x2520. */
  oY: number;
  oCao: number;
  duoi?: boolean;
}) {
  if (Platform.OS !== 'web') return null;
  // Mẩu ảnh phóng vừa chiều cao dải, giữ nguyên tỷ lệ ngang-dọc.
  const tiLe = cao / oCao;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        left: ngang,
        right: ngang,
        [duoi ? 'bottom' : 'top']: cach,
        height: cao,
        background: DEN,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
      <div
        style={{
          height: cao,
          width: cao * (840 / oCao),
          maxWidth: '70%',
          backgroundImage: `url(${ANH_KHUNG})`,
          backgroundSize: `${tiLe * 1680}px ${tiLe * 2520}px`,
          backgroundPosition: `-${tiLe * 420}px -${tiLe * oY}px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </div>
  );
}

/**
 * Bọc nội dung một màn vào khung hoa văn. Ngoài máy tính thì trả nguyên con.
 *
 * Mọi màn trên máy tính đều dùng CHUNG khung này, giống hệt bản mẫu — kể cả
 * mấy màn trên điện thoại đang dùng ảnh nền khác (trời sao, chòm sao, tinh
 * vân). Mấy ảnh đó là ảnh DỌC; trải ngang 1420 thì cắt còn một dải mỏng mất
 * hết phần đẹp. Trên máy tính chúng nhường chỗ cho khung vàng.
 */
export function KhungPC({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const pc = useManPC();
  if (!pc) return <>{children}</>;

  const d = soDoKhung(width);
  return (
    <View
      style={{
        width: d.rong,
        alignSelf: 'center',
        marginTop: 18,
        backgroundColor: DEN,
        paddingTop: d.demTren,
        paddingBottom: d.demDuoi,
        paddingHorizontal: d.demNgang,
      }}>
      <HoaVan doc={d.vienDoc} ngang={d.vienNgang} />
      <MuKhung
        ngang={d.vienNgang}
        cach={Math.round(d.vienNgang * 0.14)}
        cao={d.muTren}
        oY={61}
        oCao={150}
      />
      <MuKhung
        ngang={d.vienNgang}
        cach={Math.round(d.vienNgang * 0.14)}
        cao={d.muDuoi}
        oY={2315}
        oCao={140}
        duoi
      />
      {children}
    </View>
  );
}
