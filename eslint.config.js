// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // dist-web là thư mục build của bản web. Thiếu nó ở đây thì `expo lint`
    // quét luôn mã đã đóng gói và báo hơn mười nghìn lỗi vô nghĩa, chôn
    // mất mưọi mấy lỗi thật trong mã nguồn.
    ignores: ["dist/*", "dist-web/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // CẤM Alert của react-native. Trên web nó là HÀM RỖNG — đọc
      // node_modules/react-native-web/dist/exports/Alert/index.js, toàn bộ nội
      // dung là `class Alert { static alert() {} }`.
      //
      // Nghĩa là mọi câu hỏi lại im lặng tuyệt đối trên bản web: khách bấm
      // "Huỷ đơn" thì không có gì hiện ra và đơn không bao giờ bị huỷ. Không có
      // lỗi nào trong bảng điều khiển để lần ra, và trên máy thật thì chạy
      // bình thường nên rất dễ lọt.
      //
      // Dùng `hoi()` trong `@/lib/hoi-lai` thay cho nó.
      "no-restricted-imports": ["error", {
        paths: [{
          name: "react-native",
          importNames: ["Alert"],
          message:
            "Alert không chạy trên web (hàm rỗng). Dùng `hoi()` trong @/lib/hoi-lai.",
        }],
      }],
    },
  }
]);
