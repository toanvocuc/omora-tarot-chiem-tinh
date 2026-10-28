/**
 * Tuyến `/hom-nay` — lá bài hôm nay dưới dạng một màn riêng.
 *
 * Màn mở đầu cũng bày sẵn lá này, nên bình thường không ai đi qua đây nữa.
 * Tuyến vẫn phải sống vì thông báo đẩy mang theo `data.man = '/hom-nay'`, và
 * những thông báo đã ra khỏi máy chủ thì không sửa lại được.
 *
 * Phần ruột nằm trong `<LaBaiHomNay />` để hai chỗ không trôi khác nhau.
 */

import { LaBaiHomNay, ngayChuHomNay } from '@/components/la-bai-hom-nay';
import { LuuYThamKhao, ManHinh } from '@/components/nen';
import { NenKhungVan } from '@/components/nen-anh';

export default function HomNay() {
  return (
    <ManHinh quayLai tieuDe="Lá bài hôm nay" phu={ngayChuHomNay()} nenPhu={<NenKhungVan />}>
      <LaBaiHomNay manHinh="hom-nay" hoiChuyenGia />
      <LuuYThamKhao />
    </ManHinh>
  );
}
