"""Hỏi App Store Connect xem bản nộp đang nằm ở đâu.

    python scripts/tinh-trang-apple.py

Không cần đăng nhập, không cần mã hai lớp. Dùng khoá API đã khai trong
`eas.json`, nên không gõ lại mã nào ở đây — sửa một chỗ là cả hai nơi theo.

──────────────────────────────────────────────────────── MẤY CHỖ DỄ SẬP

* **Ký bằng openssl.** Máy không có thư viện ký JWT nào. Openssl trả chữ ký
  dạng DER, mà JWT đòi 64 byte thô (r nối s), nên phải bóc ASN.1 ra. Phần
  `so_nguyen` dưới đây làm đúng việc đó — giống `khoa-bi-mat-apple.py`.

* **curl phải có `-g`.** Đường dẫn của Apple mang dấu ngoặc vuông, ví dụ
  `filter[app]=...`. Thiếu `-g` thì curl hiểu đó là ký hiệu dải ký tự, lệnh
  chết IM LẶNG và trả về rỗng — nhìn y như "Apple không có bản nộp nào", mà
  thật ra là mình hỏi sai. Đã sập đúng một lần.

* **Đừng dùng urllib.** Một số môi trường chặn đường hầm CONNECT của nó, nó
  đứt giữa chừng không trả lời gì.

Trạng thái đọc thế nào:

    WAITING_FOR_REVIEW   đang xếp hàng, CHƯA ai mở ra xem
    IN_REVIEW            đã có người duyệt đang xem
    REJECTED             bị từ chối, vào Resolution Center đọc lý do
    PENDING_DEVELOPER_RELEASE  đã duyệt xong, chờ mình bấm phát hành
    READY_FOR_DISTRIBUTION     đã lên chợ
"""

import base64
import datetime
import json
import os
import subprocess
import sys

GOC_DU_AN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://api.appstoreconnect.apple.com'
BAY_TIENG = datetime.timezone(datetime.timedelta(hours=7))

# Bảng điều khiển Windows mặc định là cp1252, in chữ có dấu là ném lỗi và chết
# giữa chừng — báo cáo đang in dở thì đứt. Ép sang UTF-8 ngay từ đầu.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')


def khai_bao() -> dict:
    """Đọc khoá API từ eas.json. Thiếu gì thì nói thẳng thiếu gì."""
    p = os.path.join(GOC_DU_AN, 'eas.json')
    with open(p, encoding='utf-8') as f:
        ios = json.load(f).get('submit', {}).get('production', {}).get('ios', {})
    thieu = [k for k in ('ascAppId', 'ascApiKeyPath', 'ascApiKeyId', 'ascApiKeyIssuerId')
             if not ios.get(k)]
    if thieu:
        raise SystemExit('eas.json thiếu: ' + ', '.join(thieu))
    if not os.path.exists(ios['ascApiKeyPath']):
        raise SystemExit('Không thấy file khoá: ' + ios['ascApiKeyPath'])
    return ios


def b64(b: bytes) -> bytes:
    return base64.urlsafe_b64encode(b).rstrip(b'=')


def phan(o: dict) -> bytes:
    return b64(json.dumps(o, separators=(',', ':')).encode())


def so_nguyen(b: bytes, i: int) -> tuple[bytes, int]:
    """Đọc một số nguyên ASN.1, trả về đúng 32 byte."""
    if b[i] != 0x02:
        raise SystemExit('Chữ ký openssl trả về không đúng dạng DER.')
    n = b[i + 1]
    return b[i + 2:i + 2 + n].lstrip(b'\x00').rjust(32, b'\x00'), i + 2 + n


def the(ios: dict) -> str:
    gio = int(datetime.datetime.now(datetime.timezone.utc).timestamp())
    dau = (
        phan({'alg': 'ES256', 'kid': ios['ascApiKeyId'], 'typ': 'JWT'})
        + b'.'
        + phan({'iss': ios['ascApiKeyIssuerId'], 'iat': gio, 'exp': gio + 900,
                'aud': 'appstoreconnect-v1'})
    )
    kq = subprocess.run(['openssl', 'dgst', '-sha256', '-sign', ios['ascApiKeyPath']],
                        input=dau, capture_output=True)
    if kq.returncode != 0:
        raise SystemExit('openssl không ký được: '
                         + kq.stderr.decode(errors='replace')[:300])
    der = kq.stdout
    if not der or der[0] != 0x30:
        raise SystemExit('Không đọc được chữ ký. File .p8 có đúng không?')
    i = 4 if der[1] & 0x80 else 2
    r, i = so_nguyen(der, i)
    s, _ = so_nguyen(der, i)
    return (dau + b'.' + b64(r + s)).decode()


def goi(duong: str, khoa: str) -> dict:
    # -g là bắt buộc: xem ghi chú đầu file.
    kq = subprocess.run(
        ['curl', '-s', '-g', '-m', '60', '-H', 'Authorization: Bearer ' + khoa, API + duong],
        capture_output=True)
    ra = kq.stdout.decode('utf-8', errors='replace')
    if not ra.strip():
        raise SystemExit('Apple không trả lời gì cho ' + duong
                         + '\ncurl: ' + kq.stderr.decode(errors='replace')[:300])
    try:
        return json.loads(ra)
    except ValueError:
        raise SystemExit('Không đọc được JSON từ ' + duong + '\n' + ra[:400])


def doc_gio(s: str | None) -> tuple[str, float]:
    """Trả về giờ Việt Nam và số giờ đã trôi qua."""
    if not s:
        return '-', 0.0
    t = datetime.datetime.fromisoformat(s.replace('Z', '+00:00'))
    troi = (datetime.datetime.now(datetime.timezone.utc) - t).total_seconds() / 3600
    return t.astimezone(BAY_TIENG).strftime('%d/%m/%Y %H:%M'), troi


def lau(gio: float) -> str:
    return '%d ngày %d tiếng' % (int(gio // 24), int(gio % 24))


def mot(d: dict) -> dict:
    ds = d.get('data')
    if isinstance(ds, dict):
        return ds
    return ds[0] if ds else {}


def main() -> None:
    ios = khai_bao()
    khoa = the(ios)
    app = ios['ascAppId']

    ten_app = mot(goi('/v1/apps/%s' % app, khoa)).get('attributes', {}).get('name', '?')
    print('\n' + '=' * 60)
    print(' %s   (Apple ID %s)' % (ten_app, app))
    print(' Lúc xem: %s giờ Việt Nam' % datetime.datetime.now(BAY_TIENG).strftime('%d/%m/%Y %H:%M'))
    print('=' * 60)

    pb = mot(goi('/v1/apps/%s/appStoreVersions?limit=1' % app, khoa))
    a = pb.get('attributes', {})
    print('\nPHIÊN BẢN %s' % a.get('versionString', '?'))
    print('  Trạng thái    : %s' % a.get('appStoreState'))
    print('  Cách phát hành: %s' % a.get('releaseType'))

    nop = mot(goi('/v1/reviewSubmissions?filter[app]=%s'
                  '&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW,IN_REVIEW,'
                  'UNRESOLVED_ISSUES&limit=1' % app, khoa))
    if not nop:
        print('\nKHÔNG CÓ BẢN NỘP NÀO ĐANG CHỜ.')
        print('  Hoặc đã duyệt xong, hoặc chưa bấm nộp. Xem dòng trạng thái ở trên.')
    else:
        na = nop.get('attributes', {})
        khi, troi = doc_gio(na.get('submittedDate'))
        print('\nBẢN NỘP ĐANG CHỜ')
        print('  Trạng thái: %s' % na.get('state'))
        print('  Nộp lúc   : %s  (đã %s)' % (khi, lau(troi)))
        print('  Mã bản nộp: %s' % nop.get('id'))
        if na.get('state') == 'WAITING_FOR_REVIEW':
            print('  → Vẫn đang XẾP HÀNG, chưa ai mở ra xem.')
        elif na.get('state') == 'IN_REVIEW':
            print('  → ĐÃ CÓ NGƯỜI DUYỆT ĐANG XEM.')
        elif na.get('state') == 'UNRESOLVED_ISSUES':
            print('  → APPLE ĐANG CHỜ MÌNH XỬ LÝ. Vào Resolution Center ngay.')

    if pb:
        bd = mot(goi('/v1/appStoreVersions/%s/build' % pb['id'], khoa))
        ba = bd.get('attributes', {})
        khi, _ = doc_gio(ba.get('uploadedDate'))
        het, _ = doc_gio(ba.get('expirationDate'))
        print('\nBUILD GẮN VÀO PHIÊN BẢN')
        print('  Số build  : %s   xử lý: %s' % (ba.get('version'), ba.get('processingState')))
        print('  Tải lên   : %s' % khi)
        print('  Hạn dùng  : %s   đã hết hạn: %s' % (het, ba.get('expired')))
        if ba.get('usesNonExemptEncryption') is None:
            print('  !! CHƯA TRẢ LỜI câu hỏi mã hoá xuất khẩu — Apple sẽ treo im.')

        ct = mot(goi('/v1/appStoreVersions/%s/appStoreReviewDetail' % pb['id'], khoa))
        ca = ct.get('attributes', {})
        print('\nKHAI BÁO CHO NGƯỜI DUYỆT')
        print('  Đòi tài khoản demo: %s' % ca.get('demoAccountRequired'))
        if ca.get('demoAccountRequired') and not ca.get('demoAccountName'):
            print('  !! ĐÒI tài khoản demo mà CHƯA ĐIỀN. Đây là cớ bị từ chối ngay.')
        print('  Người liên hệ     : %s %s' % (ca.get('contactFirstName'), ca.get('contactLastName')))

    print('\nXong. Trạng thái đổi thì chạy lại lệnh này.\n')


if __name__ == '__main__':
    sys.exit(main())
