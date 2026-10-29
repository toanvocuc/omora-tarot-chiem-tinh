# -*- coding: utf-8 -*-
"""
Dựng bộ nhận diện từ logo vàng ánh kim.

Ảnh gốc là nét vàng PHÁT SÁNG vẽ trên nền đen, không phải nét vàng trên nền
trong suốt. Màu đã nhân sẵn với độ sáng: chỗ sáng mờ là vàng nhân một số nhỏ,
ra gần đen. Đặt nguyên lên nền xanh đậm của app thì 19,3% số ô LÀM TỐI nền —
thành một đĩa đen sau vòng tròn và vệt đen quanh ngôi sao.

Nên bước đầu là khử nhân-sẵn: lấy kênh lớn nhất làm độ đục rồi chia màu lại cho
chính nó. Đen thành trong suốt hẳn, vàng mờ thành vàng nhạt. Đo lại sau khi khử:
0 ô làm tối nền.

KHÁC HẲN bản logo xanh hôm 27/10 — bản đó là nét trên nền TRẮNG nên phải loang
từ mép vào. Đừng áp cách cũ cho ảnh này.
"""
import numpy as np
from PIL import Image

GOC = 'D:/VibeCode_Project/app_huyen_hoc/assets/images/logo-goc.png'  # da khu nhan-san san
APP = 'D:/VibeCode_Project/app_huyen_hoc'
NEN = (0x0B, 0x12, 0x20)

def khu_nhan_san(p):
    im = Image.open(p).convert('RGBA')
    a = np.array(im).astype(np.float32)
    rgb, al = a[:, :, :3], a[:, :, 3]
    mx = rgb.max(axis=2)
    a_moi = np.clip(mx * (al / 255.0), 0, 255)
    k = np.clip(mx, 1, 255)[:, :, None]
    rgb_moi = np.clip(rgb * 255.0 / k, 0, 255)
    return Image.fromarray(np.dstack([rgb_moi, a_moi]).astype(np.uint8), 'RGBA')

def khung(im, nguong=12):
    m = np.array(im)[:, :, 3] > nguong
    ys, xs = np.where(m)
    return (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1)

def vua_khung(im, co, le_ti_le=0.0, nen=None):
    """Đặt im vào khung vuông `co`, chừa lề theo tỷ lệ, giữ đúng tỷ lệ gốc."""
    trong = int(co * (1 - 2 * le_ti_le))
    w, h = im.size
    ti = min(trong / w, trong / h)
    moi = im.resize((max(1, round(w * ti)), max(1, round(h * ti))), Image.LANCZOS)
    ra = Image.new('RGBA', (co, co), (0, 0, 0, 0))
    ra.paste(moi, ((co - moi.size[0]) // 2, (co - moi.size[1]) // 2), moi)
    if nen:
        bg = Image.new('RGB', (co, co), nen)
        bg.paste(ra, (0, 0), ra)
        return bg
    return ra

sach = khu_nhan_san(GOC)
sach.save(APP + '/assets/images/logo-goc.png')     # nguồn để dựng lại sau này

x0, y0, x1, y1 = khung(sach)
# Khe giữa hình và chữ OMORA, đo được ở hàng 814–822.
KHE = 818
day_du = sach.crop((x0, y0, x1, y1))
chi_hinh = sach.crop(khung(sach.crop((x0, y0, x1, KHE)).copy())) if False else None
# Khung riêng của phần hình, vì chữ OMORA rộng hơn hình
phan_hinh = sach.crop((0, y0, sach.size[0], KHE))
hx0, hy0, hx1, hy1 = khung(phan_hinh)
chi_hinh = phan_hinh.crop((hx0, hy0, hx1, hy1))

print('khung du chu :', (x0, y0, x1, y1), '->', day_du.size)
print('khung chi hinh:', (hx0, y0 + hy0, hx1, y0 + hy1), '->', chi_hinh.size)

def theo_rong(im, rong):
    w, h = im.size
    return im.resize((rong, max(1, round(h * rong / w))), Image.LANCZOS)

ra = {}
# ── Logo trong app ──
a = theo_rong(day_du, 600);  a.save(APP + '/assets/logo/omora-day-du.png'); ra['omora-day-du.png'] = a.size
b = theo_rong(chi_hinh, 600); b.save(APP + '/assets/logo/omora-dau.png');   ra['omora-dau.png'] = b.size
c = vua_khung(day_du, 1024, 0.06);  c.save(APP + '/assets/logo/omora-vuong.png'); ra['omora-vuong.png'] = c.size

# ── Biểu tượng app: PHẢI đục, nền trong suốt là iOS tô đen ──
d = vua_khung(day_du, 1024, 0.10, nen=NEN); d.save(APP + '/assets/images/icon.png'); ra['icon.png'] = d.size

# ── Màn chờ: trong suốt, app.json đã khai nền #0B1220 ──
e = vua_khung(day_du, 1024, 0.08); e.save(APP + '/assets/images/splash-icon.png'); ra['splash-icon.png'] = e.size

# ── Biểu tượng thích ứng Android ──
# Hệ điều hành cắt thành tròn/vuông bo và chỉ chừa ~66% ở giữa. Để lề 0,22 thì
# phần hình nằm trọn trong vùng an toàn, cắt kiểu nào cũng không mất.
f = vua_khung(chi_hinh, 1024, 0.22); f.save(APP + '/assets/images/android-icon-foreground.png'); ra['android-icon-foreground.png'] = f.size

# ── Bản một màu: Android 13+ dùng cho giao diện theo màu nền máy ──
g = np.array(f)
mono = np.dstack([np.full(g.shape[:2], 255, np.uint8)] * 3 + [g[:, :, 3]])
Image.fromarray(mono, 'RGBA').save(APP + '/assets/images/android-icon-monochrome.png')
ra['android-icon-monochrome.png'] = f.size

# ── Favicon: ĐỤC trên nền xanh ──
# Thanh thẻ của trình duyệt thường sáng màu. Để trong suốt thì phần âm bên
# trong vòng tròn hiện ra màu sáng, gương mặt tan mất vì nó vẽ bằng khoảng tối.
h = vua_khung(chi_hinh, 96, 0.06, nen=NEN); h.save(APP + '/assets/images/favicon.png'); ra['favicon.png'] = h.size

print()
for k, v in ra.items():
    print('  %-34s %s' % (k, v))
print('\nTY_LE_DAY_DU = %d / %d' % a.size)
print('TY_LE_DAU    = %d / %d' % b.size)
