import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 라이트 모드 색상 정제
        "light-bg": "#f8f9fa", // 완전한 흰색보다 부드러운 배경
        "light-card": "#ffffff",
        "light-text": "#212529",
        "light-text-secondary": "#495057",

        // 다크 모드 색상 정제
        "dark-bg": "#121212", // 깊이감 있는 검은색
        "dark-card": "#1e1e1e",
        "dark-text": "#e9ecef",
        "dark-text-secondary": "#adb5bd",

        // 시그니처 블루는 유지
        "signature-blue": "#1329a0",
      },
    },
  },
  plugins: [],
};
export default config;
