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
        "light-bg": "#f8f9fa",
        "light-card": "#ffffff",
        "light-text": "#212529",
        "light-text-secondary": "#495057",

        "dark-bg": "#121212",
        "dark-card": "#1e1e1e",
        "dark-text": "#e9ecef",
        "dark-text-secondary": "#adb5bd",

        // [수정] 요청하신 새로운 색상으로 교체합니다.
        "signature-blue": "#1A66CC",
        "brand-red": "#DA012D",
      },
    },
  },
  plugins: [],
};
export default config;
