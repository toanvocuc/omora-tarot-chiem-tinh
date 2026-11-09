/**
 * Dựng bản web rồi bày sẵn vào cây thư mục gh-pages.
 *
 * Chạy: node scripts/day-web.mjs
 * Xong thì tự vào `_ghp` mà xem, rồi `git add -A && git commit && git push origin gh-pages`.
 *
 * ──────────────────────────────────────────── VÌ SAO PHẢI ĐẺ RA MỘT ĐỐNG index.html
 *
 * `app.json` đặt `web.output: "single"`, nên cả app chỉ xuất ra MỘT `index.html`.
 * GitHub Pages là máy chủ tệp tĩnh: xin `/thuc-hanh` mà không có tệp nào tên vậy
 * thì nó trả **404**, rồi mới lấy `404.html` ra làm nội dung an ủi.
 *
 * Người dùng không thấy gì lạ — trang vẫn hiện đúng. Nhưng mã trạng thái vẫn là
 * 404, và hai thứ sau đọc mã đó chứ không đọc nội dung:
 *
 *   • Google và các máy tìm kiếm: 404 nghĩa là "trang này không tồn tại", nên cả
 *     site chỉ có đúng trang gốc được lập chỉ mục.
 *   • Máy thu thập thẻ xem trước của Facebook, Zalo, Messenger: gặp 404 thì
 *     nhiều bên bỏ qua, link chia sẻ trơ lại mỗi tên miền.
 *
 * Đo ngày 2026-11-09: `/` trả 200, còn `/thuc-hanh`, `/chuyen-gia`, `/trung-bay`
 * đều trả 404.
 *
 * Cách chữa rẻ nhất: đẻ ra `thuc-hanh/index.html`, `chuyen-gia/index.html`… mỗi
 * tuyến một bản sao của `index.html`. Có tệp thật thì Pages trả 200. Chạy được
 * vì mọi đường dẫn trong `index.html` đều TUYỆT ĐỐI (`/_expo/...`), nên bản sao
 * nằm sâu mấy tầng vẫn nạp đúng mã và kiểu.
 *
 * Cách chữa đẹp hơn là `web.output: "static"` — Expo tự kết xuất mỗi tuyến một
 * trang riêng, có tiêu đề riêng. Chưa làm vì hai lẽ: sửa `app.json` là **đổi vân
 * tay**, mọi bản Android đang chạy mất đường nhận cập nhật từ xa (đọc
 * `fingerprint.config.js`, đã sập đúng một lần); và kết xuất tĩnh chạy trong
 * Node, mà app còn mấy chỗ đọc `Dimensions` ngay ở cấp module nên sẽ đổ.
 */

import { execSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

const GOC = process.cwd();
const DIST = join(GOC, 'dist');
const GHP = 'D:/VibeCode_Project/_ghp';

/** Dò mọi tuyến tĩnh từ cây thư mục `src/app`, để thêm màn mới khỏi phải sửa tay. */
function doTuyen(thuMuc = join(GOC, 'src', 'app'), tien = '') {
  const ra = [];
  for (const m of readdirSync(thuMuc, { withFileTypes: true })) {
    if (m.isDirectory()) {
      // `(tabs)` là nhóm bố cục của expo-router, không hiện trong địa chỉ.
      const con = m.name.startsWith('(') ? tien : `${tien}${m.name}/`;
      ra.push(...doTuyen(join(thuMuc, m.name), con));
      continue;
    }
    if (!m.name.endsWith('.tsx')) continue;
    const ten = m.name.slice(0, -4);
    // `_layout` là bố cục, `+not-found` là màn bắt lỗi — không phải tuyến thật.
    if (ten.startsWith('_') || ten.startsWith('+')) continue;
    // Tuyến động `[ma]` không kết xuất trước được: không biết trước giá trị nào.
    if (ten.includes('[')) continue;
    const duong = ten === 'index' ? tien.replace(/\/$/, '') : `${tien}${ten}`;
    if (duong) ra.push(duong);
  }
  return ra;
}

console.log('1/4  Dựng bản web…');
execSync('npx expo export --platform web --clear', { stdio: 'inherit' });
if (!existsSync(join(DIST, 'index.html'))) throw new Error('Không thấy dist/index.html — bản dựng hỏng.');

console.log('2/4  Dọn cây gh-pages (giữ .git và CNAME)…');
for (const m of readdirSync(GHP)) {
  if (m === '.git' || m === 'CNAME') continue;
  rmSync(join(GHP, m), { recursive: true, force: true });
}

console.log('3/4  Chép bản dựng sang…');
cpSync(DIST, GHP, { recursive: true });
const trang = readFileSync(join(GHP, 'index.html'), 'utf8');
// Lưới an toàn cho tuyến động và mọi địa chỉ gõ sai.
writeFileSync(join(GHP, '404.html'), trang);
// Thiếu tệp này là GitHub Pages chạy Jekyll, và Jekyll nuốt mọi thư mục có
// tên bắt đầu bằng dấu gạch dưới — tức nuốt sạch `_expo`.
writeFileSync(join(GHP, '.nojekyll'), '');

/**
 * Vá địa chỉ của riêng từng tuyến vào bản sao.
 *
 * `og:url` do `public/index.html` ghi cứng là `https://omorasoul.com`. Chép
 * nguyên xi thì cả 37 trang cùng khai mình là trang chủ, và hai chuyện xảy ra:
 *
 *   • Chia sẻ link `/chuyen-gia` lên Zalo hay Facebook thì thẻ xem trước hiện
 *     ra nhưng bấm vào lại nhảy về trang chủ — máy thu thập tin `og:url` hơn
 *     tin địa chỉ nó vừa tải.
 *   • Máy tìm kiếm coi `og:url` kèm `canonical` là "trang thật nằm ở đâu", nên
 *     gộp cả 37 trang thành một.
 *
 * `canonical` thì bản gốc không có dòng nào, thêm luôn ở đây.
 */
function vaDiaChi(html, duong) {
  const diaChi = `https://omorasoul.com/${duong}${duong ? '/' : ''}`;
  return html
    .replace(
      '<meta property="og:url" content="https://omorasoul.com" />',
      `<meta property="og:url" content="${diaChi}" />\n    <link rel="canonical" href="${diaChi}" />`
    );
}

console.log('4/4  Đẻ index.html cho từng tuyến…');
// Trang gốc cũng cần `canonical`, và `og:url` của nó phải có dấu gạch cuối cho
// khớp với địa chỉ GitHub Pages thật sự phục vụ.
writeFileSync(join(GHP, 'index.html'), vaDiaChi(trang, ''));
// `404.html` cố ý GIỮ NGUYÊN bản gốc: nó phục vụ những địa chỉ không có thật,
// mà gán cho chúng một `canonical` là chỉ máy tìm kiếm đi lập chỉ mục địa chỉ sai.
const tuyen = doTuyen().sort();
for (const t of tuyen) {
  const dich = join(GHP, t, 'index.html');
  mkdirSync(dirname(dich), { recursive: true });
  writeFileSync(dich, vaDiaChi(trang, t));
}
console.log(`     ${tuyen.length} tuyến: ${tuyen.join(', ')}`);

console.log(`\nXong. Giờ:  cd ${GHP} && git add -A && git commit -m "..." && git push origin gh-pages`);
