import type { Config } from "tailwindcss";

// ═══════════════════════════════════════════════════════════════
//  DUOTONE DESIGN SYSTEM
//  Primary:    Electric Blue  → #0145F2
//  Base/BG:    Canvas Cloud   → #EDF1F5
//  On-primary: White          → #FFFFFF  (accessibility only)
// ═══════════════════════════════════════════════════════════════

const ELECTRIC_BLUE = "#0145F2";
const CANVAS_CLOUD  = "#EDF1F5";
const ON_PRIMARY    = "#FFFFFF";

// ── Semantic colors (Toss-style) ──────────────────────────────
const SUCCESS_GREEN = "#1FAA59"; // 결과 강조, 양수
const WARNING_AMBER = "#F5A623"; // 주의, 임계
const DANGER_RED    = "#E5484D"; // 에러, 음수, 손실

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        // ── Semantic tokens → CSS variables ──────────────────────────
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          DEFAULT:    ELECTRIC_BLUE,   // #0145F2
          foreground: ON_PRIMARY,      // #FFFFFF
          // Opacity shades (all Electric Blue family)
          5:   "#0145F20D",
          10:  "#0145F21A",
          15:  "#0145F226",
          20:  "#0145F233",
          30:  "#0145F24D",
          40:  "#0145F266",
          50:  "#0145F280",
          60:  "#0145F299",
          70:  "#0145F2B3",
          80:  "#0145F2CC",
          90:  "#0145F2E6",
        },

        canvas: {
          DEFAULT: CANVAS_CLOUD,   // #EDF1F5
          foreground: ELECTRIC_BLUE,
          // Tints
          50:  "#F8FAFB",
          100: "#EDF1F5",
          200: "#DDE4EC",
          300: "#C8D4E0",
          400: "#A8BCCD",
          500: "#7A9AB5",
          600: "#557A98",
          700: "#3D5E78",
          800: "#294460",
          900: "#162E4A",
        },

        // Keep Tailwind shorthands pointing to duotone family
        blue:   { 600: ELECTRIC_BLUE, DEFAULT: ELECTRIC_BLUE },
        slate:  {
          50:  CANVAS_CLOUD,
          100: "#DDE4EC",
          200: "#C8D4E0",
          300: "#A8BCCD",
          400: "#7A9AB5",
          500: "#557A98",
          600: "#3D5E78",
          700: "#294460",
          800: "#162E4A",
          900: "#0A1829",
        },

        secondary: {
          DEFAULT:    CANVAS_CLOUD,
          foreground: ELECTRIC_BLUE,
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT:    SUCCESS_GREEN,
          foreground: ON_PRIMARY,
          5:   "#1FAA590D",
          10:  "#1FAA591A",
          20:  "#1FAA5933",
          50:  "#E8F7EF",
          600: "#188048",
          700: "#136638",
        },
        warning: {
          DEFAULT:    WARNING_AMBER,
          foreground: "#1A1106",
          5:   "#F5A6230D",
          10:  "#F5A6231A",
          20:  "#F5A62333",
          50:  "#FEF6E7",
          600: "#C77F0F",
          700: "#995F0A",
        },
        danger: {
          DEFAULT:    DANGER_RED,
          foreground: ON_PRIMARY,
          5:   "#E5484D0D",
          10:  "#E5484D1A",
          20:  "#E5484D33",
          50:  "#FCE8E9",
          600: "#C73237",
          700: "#9C2429",
        },
        muted: {
          DEFAULT:    CANVAS_CLOUD,
          foreground: `${ELECTRIC_BLUE}99`,
        },
        accent: {
          DEFAULT:    CANVAS_CLOUD,
          foreground: ELECTRIC_BLUE,
        },
        popover: {
          DEFAULT:    ON_PRIMARY,
          foreground: ELECTRIC_BLUE,
        },
        card: {
          DEFAULT:    ON_PRIMARY,
          foreground: ELECTRIC_BLUE,
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // ── Section spacing scale (Toss-style 큰 여백) ─────────────
      spacing: {
        "section-xs": "1rem",     // 16px  — 모바일 inline
        "section-sm": "2rem",     // 32px  — 컴팩트 섹션
        "section-md": "3.5rem",   // 56px  — 일반 섹션
        "section-lg": "5rem",     // 80px  — 강조 섹션
        "section-xl": "7rem",     // 112px — Hero 주변
        "section-2xl": "9rem",    // 144px — 페이지 최상단
      },

      // ── Transition durations (마이크로 인터랙션) ─────────────
      transitionDuration: {
        "250": "250ms",
        "400": "400ms",
      },

      // ── Z-index layers ────────────────────────────────────────
      zIndex: {
        "header":   "40",
        "dropdown": "50",
        "modal":    "60",
        "toast":    "70",
        "tooltip":  "80",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-up": {
          "0%":   { opacity: "0", transform: "translateY(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":       { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1",   boxShadow: `0 0 24px -4px ${ELECTRIC_BLUE}55` },
          "50%":       { opacity: "0.8", boxShadow: `0 0 12px -2px ${ELECTRIC_BLUE}22` },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "blob": {
          "0%":   { transform: "translate(0px, 0px) scale(1)" },
          "33%":  { transform: "translate(30px, -50px) scale(1.1)" },
          "66%":  { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "fade-in-up":     "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "reveal-up":      "reveal-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "shimmer":        "shimmer 8s linear infinite",
        "float":          "float 6s ease-in-out infinite",
        "pulse-glow":     "pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow":      "spin-slow 20s linear infinite",
        "blob":           "blob 10s infinite",
      },

      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":      "linear-gradient(to bottom, #EDF1F5, #FFFFFF)",
        "primary-gradient":   `linear-gradient(135deg, ${ELECTRIC_BLUE} 0%, #0D5BFF 100%)`,
        "canvas-gradient":    `linear-gradient(135deg, ${CANVAS_CLOUD} 0%, #DDE4EC 100%)`,
        "duotone-gradient":   `linear-gradient(160deg, ${CANVAS_CLOUD} 0%, #DDE4EC 50%, #C8D4E0 100%)`,
      },

      boxShadow: {
        "primary-sm":  `0 2px 8px -1px ${ELECTRIC_BLUE}22`,
        "primary-md":  `0 4px 16px -2px ${ELECTRIC_BLUE}33`,
        "primary-lg":  `0 8px 32px -4px ${ELECTRIC_BLUE}44`,
        "primary-xl":  `0 12px 48px -6px ${ELECTRIC_BLUE}55`,
        "canvas-sm":   `0 2px 8px -1px #0A182922`,
        "canvas-md":   `0 4px 16px -2px #0A182933`,
        "canvas-lg":   `0 8px 32px -4px #0A182944`,
        "card":        `0 1px 3px 0 #0A182914, 0 4px 16px -4px #0A182910`,
        "card-hover":  `0 4px 24px -4px ${ELECTRIC_BLUE}22, 0 1px 4px 0 #0A182910`,
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;