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

        "signature-blue": "#007FFF",
        "brand-red": "#DA012D",
      },
    },
  },
  plugins: [],
};
export default config;
