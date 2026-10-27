/**
 * Đề viết, đề vẽ, và mấy nhịp thở.
 *
 * ─────────────────────────────────────────────────────── ĐỀ LÀ CÂU HỎI, KHÔNG PHẢI LỜI PHÁN
 *
 * Mỗi đề viết là một câu hỏi mở, để người ta tự trả lời. KHÔNG có câu nào diễn
 * giải hộ ("điều này nghĩa là bạn đang..."), không câu nào đoán trước, không câu
 * nào gọi tên bệnh. App hỏi, người viết trả lời, và không ai chấm.
 *
 * Ranh giới đó giữ app ra khỏi hai chỗ cùng lúc: bói toán, và lời khuyên tâm lý
 * mà không ai trong đội có chuyên môn để đưa ra.
 */

export type NhipTho = {
  ma: string;
  ten: string;
  mo: string;
  /** Giây cho từng chặng: hít vào, giữ, thở ra, giữ. 0 là bỏ qua chặng đó. */
  chang: [number, number, number, number];
  /**
   * Một câu tả CÁCH LÀM, hiện ở màn kết quả.
   *
   * Tả cách làm chứ KHÔNG tả tác dụng: "thở ra dài gấp đôi hít vào" thì được,
   * "giúp ngủ ngon hơn" thì không — câu sau là lời hứa y tế, xem đầu
   * `components/ket-qua-buoi.tsx`.
   */
  cachLam: string;
};

export const NHIP_THO: NhipTho[] = [
  {
    ma: 'hop',
    ten: 'Thở hộp',
    mo: 'Bốn chặng bằng nhau, dễ theo khi mới bắt đầu',
    chang: [4, 4, 4, 4],
    cachLam:
      'Bốn chặng dài bằng nhau nên dễ bám nhịp nhất. Đều hơi quan trọng hơn nhiều vòng — không cần cố.',
  },
  {
    ma: '478',
    ten: 'Nhịp 4–7–8',
    mo: 'Hơi ra dài gấp đôi hơi vào',
    chang: [4, 7, 8, 0],
    cachLam:
      'Hơi ra dài gấp đôi hơi vào, và cuối vòng không giữ lại. Thấy hụt hơi thì rút ngắn, đừng nín.',
  },
  {
    ma: 'bung',
    ten: 'Thở bụng',
    mo: 'Vào sáu ra sáu, bụng phình lên xẹp xuống',
    chang: [6, 0, 6, 0],
    cachLam:
      'Đặt một tay lên bụng, để bụng đẩy tay lên khi hơi vào và lún xuống khi hơi ra. Ngực giữ yên.',
  },
  {
    ma: 'dai',
    ten: 'Hơi ra dài',
    mo: 'Vào bốn, ra tám, không giữ lại',
    chang: [4, 0, 8, 0],
    cachLam:
      'Hơi ra dài gấp đôi hơi vào mà không giữ ở giữa. Hợp lúc muốn chậm lại trước khi nằm xuống.',
  },
  {
    ma: 'cham',
    ten: 'Thở chậm',
    mo: 'Hơi vào và hơi ra đều nhau, không giữ lại',
    chang: [5, 0, 5, 0],
    cachLam:
      'Không giữ hơi chặng nào, vào và ra đều nhau. Hợp khi muốn ngồi lâu mà không phải đếm nhiều.',
  },
];

/** Tổng một vòng, tính bằng giây. */
export function motVong(n: NhipTho): number {
  return n.chang.reduce((t, c) => t + c, 0);
}

export const DE_VIET: string[] = [
  'Hôm nay điều gì làm bạn mệt nhất?',
  'Có chuyện gì bạn đang né không muốn nghĩ tới?',
  'Ba thứ hôm nay diễn ra êm hơn bạn tưởng.',
  'Bạn đang mong một người nào đó nói gì với mình?',
  'Nếu ngày mai rảnh cả ngày, bạn sẽ làm gì đầu tiên?',
  'Lần gần nhất bạn thấy nhẹ người là lúc nào?',
  'Điều gì bạn vẫn làm dù không còn muốn làm?',
  'Hôm nay bạn đã tử tế với mình chưa, bằng cách nào?',
  'Có câu nào bạn muốn nói mà chưa nói được?',
  'Thứ gì nhỏ thôi nhưng hôm nay làm bạn dừng lại một nhịp?',
  'Bạn đang mang giúp ai một việc không phải của mình?',
  'Nếu bớt được một thứ trong tuần này, bạn bỏ thứ gì?',
  'Chuyện gì tuần trước còn lớn mà giờ thấy nhỏ rồi?',
  'Bạn đang chờ điều gì để bắt đầu?',
];

/**
 * Đề vẽ và đề chụp.
 *
 * Có `expo-image-picker` rồi nên đề chụp quay lại — trước đó bỏ hết vì ra đề
 * "chụp bầu trời" khi app không có chỗ nào để chụp là bắt người ta làm một việc
 * rồi bỏ lửng.
 */
export const DE_VE: string[] = [
  'Vẽ nguệch ngoạc một lúc, không nhấc tay lên.',
  'Chụp một thứ hôm nay khiến bạn dừng lại.',
  'Vẽ hôm nay của bạn bằng đúng một hình.',
  'Chụp góc bạn hay ngồi nhất trong nhà.',
  'Vẽ bằng tay không thuận.',
  'Chụp bầu trời ngay lúc này, dù nó thế nào.',
  'Vẽ kín trang bằng một hình lặp đi lặp lại.',
  'Chụp một thứ cũ mà bạn vẫn giữ.',
  'Vẽ cái bạn thấy khi nhắm mắt lại.',
  'Chụp thứ gì đó mang màu bạn thích nhất.',
  'Vẽ một đường duy nhất, đi đâu cũng được, cho tới khi muốn dừng.',
  'Vẽ cái bạn muốn bớt đi trong tuần này.',
  'Chụp một chỗ bạn thấy dễ thở.',
  'Vẽ căn phòng bạn đang ngồi, nhìn từ trên xuống.',
];

/**
 * Đề của ngày hôm nay.
 *
 * Chọn theo NGÀY chứ không ngẫu nhiên: mở ra mở vào mấy lần trong ngày vẫn ra
 * một đề, và hôm sau mới đổi. Ngẫu nhiên thì mỗi lần vẽ lại màn là một đề khác,
 * người đang viết dở mất đề.
 */
export function deCuaNgay(ds: string[], ngay: string): string {
  const so = Number(ngay.replaceAll('-', ''));
  return ds[so % ds.length];
}
