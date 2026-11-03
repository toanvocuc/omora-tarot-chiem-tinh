/** @type {import('tailwindcss').Config} */
module.exports = {
  // App chỉ có một bộ màu, nền tím đêm, không đổi theo sáng tối của máy. Để
  // mặc định 'media' thì bản web chết ngay lúc dựng: NativeWind ném lỗi
  // "Cannot manually set color scheme". Không chỗ nào dùng biến thể dark: nên
  // đổi sang 'class' không làm đổi giao diện.
  darkMode: 'class',
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // `rounded-2xl` mặc định của Tailwind là 16. Đổi ở đây là đổi một lượt
      // cả 36 chỗ dùng nó trong app, khỏi phải sửa từng tệp rồi sót.
      // Phải khớp với `BO_GOC_THE` trong src/constants/giao-dien.ts.
      borderRadius: {
        '2xl': '20px',
      },
      colors: {
        // Giữ khớp với src/constants/giao-dien.ts
        nen: '#120E1C',
        'nen-nhat': '#1E162F',
        'nen-nhat-hon': '#2A2140',
        vang: '#D4A84B',
        'vang-sang': '#E8C673',
        'chu-chinh': '#EDF1F8',
        'chu-phu': '#9AA8C0',
        'chu-mo': '#63708A',
        vien: '#322845',
        tot: '#4FBF95',
        canh: '#E08268',
      },
    },
  },
  plugins: [],
};
