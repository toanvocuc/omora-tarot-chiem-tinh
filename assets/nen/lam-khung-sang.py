"""
Làm sáng khung hoa văn Tarot.

VÌ SAO: ảnh gốc là nét vàng dày 1px trên nền đen, cỡ 840x1260. App vẽ nó phủ
kín màn theo kiểu `cover`, nên trên máy DPR2 nó bị PHÓNG TO khoảng 1,5 lần —
nét 1px nhoè ra thành 1,5px mờ, hoà vào nền đen. Đo trên ảnh chụp thật từ
omorasoul.com: độ bão hoà của nét tụt từ 55,8 (trong tệp gốc) xuống 29,9 (trên
màn hình). Khung vì thế trông xám xịt chứ không ra vàng.

CÁCH CHỮA, ba việc:

 1. **Dập nhiễu nền.** Ảnh gốc là JPEG nên vùng đen lấm tấm hạt. Cứ tăng sáng
    thẳng là mấy hạt đó nổi lên thành đốm xám và đốm TÍM (nhiễu màu JPEG) —
    đã thử và thấy rõ. Nên cắt phẳng mọi điểm có độ sáng <= 26 về đen tuyệt đối
    trước, rồi mới kéo giãn khoảng còn lại.

 2. **Ép mọi nét về đúng tông vàng của app** (#D4A84B). Giữ nguyên độ sáng,
    chỉ thay màu. Việc này vừa khử sạch nhiễu màu còn sót, vừa làm khung ăn
    nhập với mọi nét trang trí khác trong app. Điểm sáng nhất thì nhạt dần về
    trắng để nét còn chiều sâu, không bẹt.

 3. **Xuất ở 2x (1680x2520).** Để app THU NHỎ thay vì phóng to — thu nhỏ thì
    nét sắc lại, phóng to thì nét nhoè. Đây mới là gốc rễ của vấn đề.

Chạy: python -I assets/nen/lam-khung-sang.py
Đọc  assets/nen/khung-hoa-van-nguyen-ban.jpg, ghi đè assets/nen/khung-hoa-van.jpg
"""

import numpy as np
from PIL import Image

NGUON = 'assets/nen/khung-hoa-van-nguyen-ban.jpg'
DICH = 'assets/nen/khung-hoa-van.jpg'

#: Dưới mức này coi như nền, ép về đen. Đo bằng mắt: 26 đủ sạch hạt JPEG mà
#: chưa ăn mất mấy ngôi sao mờ nhất trong hoa văn.
NGUONG = 26
#: < 1 thì kéo vùng tối-vừa sáng lên. 0,65 là mức nét rõ hẳn mà chưa cháy.
GAMMA = 0.65
#: Vàng chuẩn của app, chuẩn hoá theo kênh lớn nhất.
VANG = np.array([212, 168, 75], dtype=np.float32) / 212.0
PHONG = 2


def lam_sang(im: Image.Image) -> Image.Image:
    a = np.asarray(im).astype(np.float32)
    i = a.max(axis=2)
    i = np.where(i <= NGUONG, 0.0, (i - NGUONG) * 255.0 / (255.0 - NGUONG))
    i = (np.clip(i / 255.0, 0, 1) ** GAMMA) * 255.0

    ra = i[:, :, None] * VANG[None, None, :]
    # Đỉnh sáng nhạt dần về trắng, để nét không bẹt thành một màu.
    t = np.clip((i - 200) / 55.0, 0, 1)[:, :, None]
    ra = ra * (1 - t) + np.minimum(255.0, i[:, :, None] + 40.0) * t

    out = Image.fromarray(np.clip(ra, 0, 255).astype(np.uint8))
    return out.resize((im.width * PHONG, im.height * PHONG), Image.LANCZOS)


if __name__ == '__main__':
    goc = Image.open(NGUON).convert('RGB')
    moi = lam_sang(goc)
    moi.save(DICH, quality=92, subsampling=0, optimize=True)
    print(f'{NGUON} {goc.size} -> {DICH} {moi.size}')
