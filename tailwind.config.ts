// tailwind.config.ts

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
        // 기본 배경 및 텍스트 색상
        "light-bg": "#f9fafb", // 밝은 모드 배경
        "light-card": "#ffffff", // 밝은 모드 카드
        "light-text": "#111827", // 밝은 모드 기본 텍스트
        "light-text-secondary": "#6b7280", // 밝은 모드 보조 텍스트
        "dark-bg": "#121212", // 어두운 모드 배경
        "dark-card": "#1e1e1e", // 어두운 모드 카드
        "dark-text": "#f3f4f6", // 어두운 모드 기본 텍스트
        "dark-text-secondary": "#9ca3af", // 어두운 모드 보조 텍스트

        // 브랜드 및 강조 색상 (신규)
        primary: {
          DEFAULT: "#0052ff", // 신뢰감을 주는 메인 파란색
          hover: "#0048e0", // 호버 효과
        },
        accent: {
          DEFAULT: "#ffc82c", // 행동을 유도하는 노란색
          hover: "#f0b91a", // 호버 효과
        },
        danger: "#e11d48", // 위험/경고

        // 레거시 색상 (하위 호환성)
        "signature-blue": "#0052ff",
        "brand-red": "#e11d48",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
        "subtle-shine": "subtleShine 2s infinite linear",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        subtleShine: {
          "0%, 100%": { "box-shadow": "0 0 5px rgba(0, 82, 255, 0)" },
          "50%": { "box-shadow": "0 0 20px rgba(0, 82, 255, 0.3)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
